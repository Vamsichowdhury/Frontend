# Nested Comments System — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~50 minutes
**Interviewer style:** Will push hard on the data model choice — flat vs nested is the central decision. Will also probe the collapse logic and vote mutual exclusion.

---

> **How to use this file:**
> The data model discussion (Phase 2 & 3) is the dramatic centre. Flat list with `parentId` vs nested tree object — knowing WHY flat is better for mutable React state is the key insight. The collapse implementation (Phase 5) is the second most interesting area.

---

## ─────────────────────────────────────
## PHASE 1 — Requirements & Clarification
## ─────────────────────────────────────

---

**Interviewer:**

Design a nested comments system — like Reddit or Hacker News. Go ahead.

---

**Candidate:**

A few questions first to scope this properly.

---

**Q1. How many levels of nesting are allowed?**

> **Why ask this:**
> Unlimited nesting creates UI problems — deeply nested comments become extremely narrow. Reddit caps nesting at around 6 levels and shows a "continue thread" link beyond that. This cap also prevents infinite recursion in the rendering component.
>
> Knowing the depth limit determines whether a simple recursive component works or whether you need a "continue thread" redirect pattern.

---

**Q2. Do we need voting — upvote/downvote per comment?**

> **Why ask this:**
> Voting adds a three-state enum per comment (`"none" | "up" | "down"`), not just a boolean. Up and down are mutually exclusive — the same problem as YouTube like/dislike. Asking signals you already know voting has state complexity.

---

**Q3. Are replies loaded upfront or on demand?**

> **Why ask this:**
> A popular Reddit thread can have 50,000 comments. Loading all of them upfront is impossible — both API cost and rendering cost are prohibitive. If replies are loaded on demand (click "X replies" to expand), you need lazy loading per thread — a separate fetch per comment when expanded.
>
> This shapes the API contract and the loading state per comment.

---

**Q4. Should users be able to edit and delete their own comments?**

> **Why ask this:**
> Delete is non-trivial if the comment has replies — you can't remove it from the tree or the replies lose their context. The standard solution is a "tombstone" — mark as deleted, show "[deleted]", keep the replies. This is a product decision worth confirming.

---

**Interviewer:**

Good. Here's the scope:

- Max 6 levels of nesting. Show "Continue thread →" beyond that.
- Yes, upvote and downvote per comment.
- Top-level comments loaded on page load. Replies loaded on demand when expanded.
- Yes, edit and delete. Deleted comments show as "[deleted]".

---

**Candidate:**

Perfect. The on-demand reply loading and the delete tombstone are the two most interesting constraints. Let me start with the data model — this shapes everything.

---

## ─────────────────────────────────────
## PHASE 2 — The Data Model Choice
## ─────────────────────────────────────

---

**Interviewer:**

How do you structure the comment data? Walk me through your thinking.

---

**Candidate:**

There are two approaches. Let me show both and explain why I choose the flat one.

**Approach A — Nested tree from API:**

```javascript
{
  id: "c1", text: "Great article!", depth: 0,
  replies: [
    { id: "c2", text: "I agree!", depth: 1,
      replies: [
        { id: "c3", text: "Me too!", depth: 2, replies: [] }
      ]
    }
  ]
}
```

This looks natural and is easy to render recursively. But watch what happens when you try to update a single comment — say, the user votes on `c3`:

```javascript
// To update c3, you must deep-traverse the tree:
const updateNestedComment = (comments, targetId, update) => {
  return comments.map(comment => {
    if (comment.id === targetId) return { ...comment, ...update };
    if (comment.replies?.length) {
      return {
        ...comment,
        replies: updateNestedComment(comment.replies, targetId, update)
      };
    }
    return comment;
  });
};
// O(n) traversal every time any comment changes — scales badly
```

**Approach B — Flat list with parentId (what I use):**

```javascript
[
  { id: "c1", parentId: null, text: "Great article!", depth: 0, upvotes: 234 },
  { id: "c2", parentId: "c1", text: "I agree!",       depth: 1, upvotes: 45  },
  { id: "c3", parentId: "c2", text: "Me too!",        depth: 2, upvotes: 12  },
  { id: "c4", parentId: "c1", text: "Also great...",  depth: 1, upvotes: 23  }
]
```

Updating `c3`'s vote count:

```javascript
setCommentsMap(prev => {
  const next = new Map(prev);
  next.set("c3", { ...next.get("c3"), upvotes: newCount });
  return next;
});
// O(1) — direct Map lookup. No tree traversal. ✅
```

Adding a new reply to `c1`:

```javascript
setCommentsMap(prev => {
  const next = new Map(prev);
  next.set(newComment.id, newComment); // { parentId: "c1", ... }
  return next;
});
// O(1) — just insert into Map. ✅
```

The flat model treats every comment as an independent record. Relationships are described by `parentId` — same as how a relational database stores tree structures. It's always the better choice for mutable state.

---

**Interviewer:**

But the flat list doesn't tell you the children of a comment. How do you build the rendering tree?

---

**Candidate:**

I derive the children map once from the flat list using `useMemo`:

```javascript
const childrenMap = useMemo(() => {
  const map = {};
  commentsMap.forEach((comment) => {
    if (!comment.parentId) return;
    if (!map[comment.parentId]) map[comment.parentId] = [];
    map[comment.parentId].push(comment.id);
  });
  return map;
}, [commentsMap]);

// childrenMap["c1"] = ["c2", "c4"]
// childrenMap["c2"] = ["c3"]
```

This only recomputes when `commentsMap` changes — which is when a new comment is added or when lazy-loaded replies arrive. During voting or editing (which don't change the tree structure), `childrenMap` is served from cache.

---

## ─────────────────────────────────────
## PHASE 3 — Normalised State
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the full state structure.

---

**Candidate:**

```javascript
// All loaded comments in one flat Map
const [commentsMap, setCommentsMap] = useState(new Map());
// { "c1": { id, parentId, text, upvotes, voteState, depth, ... }, ... }

// IDs of top-level comments in display order
const [rootIds, setRootIds] = useState([]);
// ["c1", "c5", "c8", ...]  — sorted by "top" or "new"

// Which comments have their replies collapsed
const [collapsedIds, setCollapsedIds] = useState(new Set());
// Collapsed means: the comment is visible but its children are hidden

// Which comment is currently replying (shows inline reply input)
const [replyingToId, setReplyingToId] = useState(null);

// Which threads have been expanded (replies fetched)
const [expandedIds, setExpandedIds] = useState(new Set());

// Pagination cursors per parent ID
const [cursors, setCursors] = useState({});
// { "c1": "eyJhbGciO...", "c5": null }
```

When top-level comments load on mount:

```javascript
useEffect(() => {
  fetch(`/api/posts/${postId}/comments?sort=top&limit=20`)
    .then(r => r.json())
    .then(data => {
      const map = new Map(data.comments.map(c => [c.id, c]));
      setCommentsMap(map);
      setRootIds(data.comments.map(c => c.id));
      setCursors({ root: data.nextCursor });
    });
}, [postId]);
```

---

## ─────────────────────────────────────
## PHASE 4 — Recursive Component
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the component that renders a comment and its replies.

---

**Candidate:**

```jsx
function CommentNode({ commentId, depth = 0 }) {
  const comment     = commentsMap.get(commentId);
  const childrenIds = childrenMap[commentId] || [];
  const isCollapsed = collapsedIds.has(commentId);
  const isExpanded  = expandedIds.has(commentId);
  const isReplying  = replyingToId === commentId;

  if (!comment) return null;

  return (
    <div className="comment-node" style={{ marginLeft: depth * 20 }}>

      {/* The comment itself */}
      <CommentBody
        comment={comment}
        onVote={(dir) => handleVote(commentId, dir)}
        onReply={() => setReplyingToId(commentId)}
        onCollapse={() => toggleCollapse(commentId)}
        onDelete={() => handleDelete(commentId)}
      />

      {/* Inline reply input */}
      {isReplying && (
        <ReplyInput
          onSubmit={(text) => submitReply(commentId, text)}
          onCancel={() => setReplyingToId(null)}
        />
      )}

      {/* Children — only if not collapsed */}
      {!isCollapsed && (
        <>
          {childrenIds.map(childId => (
            <CommentNode
              key={childId}
              commentId={childId}
              depth={depth + 1}  // ← recursion with incremented depth
            />
          ))}

          {/* Load more replies button */}
          {comment.replyCount > childrenIds.length && isExpanded && (
            <LoadMoreReplies
              parentId={commentId}
              cursor={cursors[commentId]}
              onLoad={(newComments, nextCursor) => {
                addCommentsToMap(newComments);
                setCursors(prev => ({ ...prev, [commentId]: nextCursor }));
              }}
            />
          )}

          {/* Expand replies button (if not yet fetched) */}
          {comment.replyCount > 0 && !isExpanded && (
            <button onClick={() => expandReplies(commentId)}>
              ▸ {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </>
      )}

      {/* Depth cap — show "Continue thread" link */}
      {depth >= MAX_DEPTH && childrenIds.length > 0 && (
        <a href={`/comments/${commentId}`}>Continue thread →</a>
      )}
    </div>
  );
}
```

The recursion is natural: `CommentNode` renders zero or more `CommentNode` children. React handles this well as long as every node has a stable `key`.

---

## ─────────────────────────────────────
## PHASE 5 — Collapse Logic
## ─────────────────────────────────────

---

**Interviewer:**

User clicks "Collapse" on comment c1. c2, c3, c4 are all children of c1. How do you hide them without mutating the tree?

---

**Candidate:**

The simplest approach: add `c1` to `collapsedIds`. In the render function, before rendering children, check if the comment is collapsed:

```javascript
{!isCollapsed && childrenIds.map(childId => (
  <CommentNode key={childId} commentId={childId} depth={depth + 1} />
))}
```

When `c1` is collapsed, its children simply don't render. No mutation needed — the data is unchanged, just the visibility state changes.

But there's a subtlety: what if `c2` was also collapsed before the user collapsed `c1`? When `c1` is re-expanded, should `c2` still be collapsed?

```
c1 (collapsed) → c2 (also collapsed) → c3

User expands c1:
  c2 and c4 should appear
  c2 is still collapsed → c2 visible, c3 hidden ✅
  (the nested collapse state is preserved)
```

This works naturally with the `Set` approach — each comment's collapse state is independent. `collapsedIds = {"c1", "c2"}`. Removing `c1` from the set doesn't affect `c2`.

Toggle:

```javascript
const toggleCollapse = (commentId) => {
  setCollapsedIds(prev => {
    const next = new Set(prev);
    if (next.has(commentId)) next.delete(commentId);
    else next.add(commentId);
    return next;
  });
};
```

---

**Interviewer:**

What if a deeply nested comment c3 is visible. User scrolls up and collapses c1 (c3's grandparent). Does c3 correctly hide?

---

**Candidate:**

Yes — because `CommentNode` for c2 is a child of `CommentNode` for c1. When c1 is collapsed, React unmounts c1's children subtree entirely. c2 and c3 are simply not in the DOM. No special check needed.

The recursive structure handles this: when `!isCollapsed` returns false for c1, the `childrenIds.map(...)` block never executes, so c2's `CommentNode` is never called, so c3 is never called.

```
c1: isCollapsed = true → children NOT rendered
    → c2's CommentNode is never called
       → c3's CommentNode is never called
```

---

## ─────────────────────────────────────
## PHASE 6 — Optimistic Reply
## ─────────────────────────────────────

---

**Interviewer:**

User submits a reply. Walk me through what happens.

---

**Candidate:**

```javascript
const submitReply = async (parentId, text) => {
  const tempId = `temp_${Date.now()}`;
  const optimisticComment = {
    id: tempId,
    parentId,
    text,
    authorName: currentUser.name,
    authorAvatar: currentUser.avatar,
    upvotes: 0,
    voteState: "none",
    depth: (commentsMap.get(parentId)?.depth ?? 0) + 1,
    createdAt: new Date().toISOString(),
    replyCount: 0,
    isTemp: true  // flag to show pending indicator
  };

  // 1. Add to map immediately
  setCommentsMap(prev => new Map(prev).set(tempId, optimisticComment));
  // 2. Mark parent as expanded (so children are visible)
  setExpandedIds(prev => new Set(prev).add(parentId));
  // 3. Close the reply input
  setReplyingToId(null);

  try {
    const real = await fetch(`/api/comments`, {
      method: "POST",
      body: JSON.stringify({ postId, parentId, text })
    }).then(r => r.json());

    // 4. Replace temp with real comment
    setCommentsMap(prev => {
      const next = new Map(prev);
      next.delete(tempId);
      next.set(real.id, real);
      return next;
    });
    // 5. Update parent's replyCount
    setCommentsMap(prev => {
      const next = new Map(prev);
      const parent = next.get(parentId);
      if (parent) next.set(parentId, { ...parent, replyCount: parent.replyCount + 1 });
      return next;
    });
  } catch {
    // Remove the optimistic comment on failure
    setCommentsMap(prev => {
      const next = new Map(prev);
      next.delete(tempId);
      return next;
    });
    showToast("Failed to post reply.");
  }
};
```

---

## ─────────────────────────────────────
## PHASE 7 — Voting
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the vote handler — upvote and downvote on a comment.

---

**Candidate:**

Vote state is an enum — same reasoning as YouTube like/dislike:

```javascript
const handleVote = async (commentId, direction) => {
  const comment  = commentsMap.get(commentId);
  const prevState = comment.voteState; // "none" | "up" | "down"

  // Compute new state
  let newVoteState, upvoteDelta, downvoteDelta;

  if (direction === "up") {
    if (prevState === "up")   { newVoteState="none"; upvoteDelta=-1; downvoteDelta=0; }
    else if (prevState === "down") { newVoteState="up"; upvoteDelta=+1; downvoteDelta=-1; }
    else                     { newVoteState="up"; upvoteDelta=+1; downvoteDelta=0; }
  } else { // "down"
    if (prevState === "down") { newVoteState="none"; upvoteDelta=0;  downvoteDelta=-1; }
    else if (prevState === "up")   { newVoteState="down"; upvoteDelta=-1; downvoteDelta=+1; }
    else                     { newVoteState="down"; upvoteDelta=0;  downvoteDelta=+1; }
  }

  // Optimistic update
  setCommentsMap(prev => {
    const next = new Map(prev);
    const c = next.get(commentId);
    next.set(commentId, {
      ...c,
      voteState: newVoteState,
      upvotes:   c.upvotes   + upvoteDelta,
      downvotes: c.downvotes + downvoteDelta
    });
    return next;
  });

  try {
    await fetch(`/api/comments/${commentId}/vote`, {
      method: "POST",
      body: JSON.stringify({ direction: newVoteState === "none" ? null : newVoteState })
    });
  } catch {
    // Rollback: restore previous state
    setCommentsMap(prev => {
      const next = new Map(prev);
      next.set(commentId, comment); // restore original
      return next;
    });
  }
};
```

---

## ─────────────────────────────────────
## PHASE 8 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

Comment c1 has 50 replies. User has only loaded the first 5. User deletes c1. What shows?

---

**Candidate:**

Deleting c1 can't physically remove it — its 50 replies reference it as their parent. Removing it would orphan them. The solution is a tombstone:

```javascript
const handleDelete = async (commentId) => {
  // Optimistic tombstone — mark as deleted but don't remove
  setCommentsMap(prev => {
    const next = new Map(prev);
    next.set(commentId, { ...next.get(commentId), isDeleted: true, text: null });
    return next;
  });

  try {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
  } catch {
    // Restore original
    setCommentsMap(prev => {
      const next = new Map(prev);
      next.set(commentId, original);
      return next;
    });
  }
};
```

Rendering a tombstone:

```jsx
{comment.isDeleted ? (
  <div className="comment-deleted">
    <span>[deleted]</span>
    {/* Still render children — replies remain visible */}
  </div>
) : (
  <CommentBody comment={comment} />
)}
```

---

**Interviewer:**

Thread is 6 levels deep. User tries to reply to the deepest comment. What shows?

---

**Candidate:**

At `depth >= MAX_DEPTH`, I don't render the Reply button:

```jsx
{!comment.isDeleted && depth < MAX_DEPTH && (
  <button onClick={() => setReplyingToId(commentId)}>Reply</button>
)}
{depth >= MAX_DEPTH && comment.replyCount > 0 && (
  <a href={`/thread/${commentId}`} className="continue-thread">
    Continue thread →
  </a>
)}
```

The "Continue thread" link navigates to a page where that comment is the root — effectively the same comment system but with this comment as the top-level item, allowing unlimited further nesting relative to it.

---

## ─────────────────────────────────────
## PHASE 9 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

A popular article has 5,000 loaded comments. Voting on one causes the commentsMap to update. Does everything re-render?

---

**Candidate:**

Without `React.memo`, yes — any `commentsMap` change re-renders all `CommentNode` components. With the normalised Map approach, each `CommentNode` only receives its own `commentId` as a prop. I use `React.memo` with a comparison that checks if the specific comment changed:

```javascript
const CommentNode = React.memo(({ commentId, depth }) => {
  const comment = commentsMap.get(commentId);
  // ...
}, (prev, next) => prev.commentId === next.commentId);
// Only re-render if the commentId prop itself changes
// The comment data is read inside via commentsMap — but we need context for that
```

Better pattern: pass the comment object directly as a prop, letting `React.memo`'s default shallow comparison work:

```javascript
// In parent, pass comment data so memo can compare
<CommentNode
  key={childId}
  comment={commentsMap.get(childId)}  // pass object
  depth={depth + 1}
/>

const CommentNode = React.memo(({ comment, depth }) => {
  // Only re-renders when comment object reference changes
  // Voting on c3 creates a new c3 reference, but c1, c2, c4 references are unchanged
});
```

For very large threads (1,000+ comments), I'd also add virtual scrolling at the root comment list level — only render the visible top-level comments with `react-virtuoso`.

---

## ─────────────────────────────────────
## POST-INTERVIEW ANALYSIS
## ─────────────────────────────────────

```
✅  Flat list with parentId over nested tree — with explicit O(1) vs O(n) justification
✅  Normalised Map<id, comment> for O(1) updates
✅  childrenMap derived via useMemo (not stored in state)
✅  Recursive CommentNode with depth limit + "Continue thread"
✅  Collapse via Set — no tree mutation, preserves nested collapse state
✅  Optimistic reply with temp ID → real ID swap
✅  Vote as enum (not two booleans) — same pattern as YouTube
✅  Delete as tombstone — keeps replies intact
✅  React.memo with comment object as prop (not just ID)
✅  Load more per thread using cursor per parentId
```

## 11 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Flat vs nested data model | "How do you structure comment data?" |
| 2 | Map<id,comment> O(1) updates | "Update c3's vote — how?" |
| 3 | childrenMap via useMemo | "Flat list has no children — how do you render tree?" |
| 4 | Recursive component | "Walk me through the component" |
| 5 | Depth cap + continue thread | "Max 6 levels — user tries to reply beyond" |
| 6 | Collapse via Set (no mutation) | "How do you hide a subtree?" |
| 7 | Nested collapse preserved | "c2 was collapsed, user re-expands c1" |
| 8 | Temp ID optimistic reply | "User submits reply — walk through it" |
| 9 | Vote as enum not booleans | "Walk through upvote/downvote handler" |
| 10 | Delete as tombstone | "User deletes c1 which has 50 replies" |
| 11 | React.memo with comment object | "5,000 comments — vote on one — what re-renders?" |
