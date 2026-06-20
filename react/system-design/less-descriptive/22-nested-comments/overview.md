# Nested Comments System - System Design Overview

**Level:** Medium  
**Time to Solve:** 50-60 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a nested comments system (Reddit/YouTube style):
- Top-level comments on a post
- Threaded replies (N levels deep)
- Collapse/expand a comment thread
- Upvote/downvote
- Load more replies (pagination)
- Add/edit/delete comments
- Sort by: Best, New, Top, Controversial

---

## Real-World Examples

- Reddit comment threads
- YouTube comments with replies
- Hacker News discussion threads
- GitHub PR review comments
- Stack Overflow answers

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Recursive/tree data structure | Comments as nested trees |
| Recursive component rendering | CommentNode renders CommentNode |
| Collapse/expand subtrees | State per comment node |
| Pagination of nested data | Load more replies |
| Optimistic add/delete/vote | Instant feedback |

---

## What You'll Learn

- Tree data structure for comments (parent-child relationship)
- Recursive React components
- Two data shape approaches: nested tree vs flat list with parentId
- Collapse state management (local per node or global)
- Depth-based visual indentation
- Optimistic mutations in tree structures

---

## Two Data Approaches

```
Approach 1: Nested Tree (from API)
{
  id: "c1", text: "Great post!",
  replies: [
    { id: "c2", text: "Agreed!", replies: [] },
    { id: "c3", text: "Disagree.", replies: [
      { id: "c4", text: "Why?", replies: [] }
    ]}
  ]
}
✅ Easy to render recursively
❌ Deep nesting makes updates complex
❌ Load more replies is hard

Approach 2: Flat with parentId (normalized)
[
  { id: "c1", parentId: null, text: "Great post!", depth: 0 },
  { id: "c2", parentId: "c1", text: "Agreed!", depth: 1 },
  { id: "c3", parentId: "c1", text: "Disagree.", depth: 1 },
  { id: "c4", parentId: "c3", text: "Why?", depth: 2 }
]
✅ Easy to add/remove/update (flat array operations)
✅ Works well with APIs
❌ Need to build tree for rendering
```

---

## High-Level Architecture

```
<CommentsSection postId={id} />
├── <CommentComposer />         (add top-level comment)
├── <SortBar />                 (Best / New / Top)
└── <CommentList />
    └── <CommentNode comment={c} depth={0} /> × N  [recursive]
        ├── <CommentHeader />   (avatar, username, time, vote)
        ├── <CommentBody />     (text content)
        ├── <CommentActions />  (Reply, Edit, Delete, Collapse)
        ├── <ReplyComposer />   (inline, shows when replying)
        └── <CommentList replies={c.replies} depth={depth+1} />
            └── <CommentNode /> ...  [recursive]
```

---

## Data Structure

```javascript
// Flat comment (normalized — recommended)
{
  id: "c_abc",
  postId: "post_1",
  parentId: null,         // null = top-level
  authorId: "user_1",
  authorName: "Alice",
  authorAvatar: "https://...",
  text: "Really interesting perspective!",
  upvotes: 245,
  downvotes: 12,
  userVote: null,         // "up" | "down" | null
  depth: 0,
  replyCount: 5,
  loadedReplies: 2,       // how many replies currently shown
  createdAt: "2024-01-15T10:00:00Z",
  isDeleted: false,
  isCollapsed: false
}

// State
const [comments, setComments] = useState([]);   // flat array
const [collapsedIds, setCollapsedIds] = useState(new Set());
const [replyingTo, setReplyingTo] = useState(null); // commentId
```

---

## Data Flow

```
Load comments:
  → fetch /api/posts/:id/comments?sort=best&limit=10
  → top-level only, with replyCount per comment

User clicks "4 replies":
  → fetch /api/comments/:id/replies?limit=5
  → append replies to flat list (parentId = commentId)
  → update loadedReplies count

User clicks Collapse on a comment:
  → add commentId to collapsedIds Set
  → hide that comment's children (filter by parentId not in collapsedIds)

User votes Up:
  → optimistic: update userVote, increment upvotes
  → POST /api/comments/:id/vote { direction: "up" }
  → rollback on error

User clicks Reply on comment C:
  → setReplyingTo(c.id)
  → show inline composer below C

User submits reply:
  → optimistic: add new comment to flat list with parentId = c.id
  → POST /api/comments { postId, parentId: c.id, text }
  → update with real ID from response

Sorting changes:
  → re-fetch top-level comments with new sort param
  → reset loaded replies state
```

---

## Key Concepts to Learn

### 1. Recursive Component
```jsx
function CommentNode({ comment, depth = 0, allComments }) {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const isCollapsed = collapsedIds.has(comment.id);

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <CommentHeader {...comment} />
      <CommentBody text={comment.text} />
      <CommentActions onReply={() => setReplyingTo(comment.id)} />

      {!isCollapsed && replies.map(reply => (
        <CommentNode
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          allComments={allComments}
        />
      ))}
    </div>
  );
}
```

### 2. Collapse Subtree
```javascript
const toggleCollapse = (commentId) => {
  setCollapsedIds(prev => {
    const next = new Set(prev);
    if (next.has(commentId)) {
      next.delete(commentId);
    } else {
      next.add(commentId);
    }
    return next;
  });
};

// Filter out children of collapsed comments
const getVisibleComments = () => {
  const collapsedAncestorIds = getCollapsedAncestorIds(comments, collapsedIds);
  return comments.filter(c => !collapsedAncestorIds.has(c.parentId));
};
```

### 3. Optimistic Reply
```javascript
const submitReply = async (parentId, text) => {
  const tempComment = {
    id: `temp_${Date.now()}`,
    parentId,
    text,
    authorName: currentUser.name,
    upvotes: 0,
    createdAt: new Date().toISOString(),
    isTemp: true
  };
  setComments(prev => [...prev, tempComment]);

  const realComment = await postComment({ parentId, text });
  setComments(prev => prev.map(c =>
    c.id === tempComment.id ? realComment : c
  ));
};
```

### 4. Vote State
```javascript
const handleVote = (commentId, direction) => {
  setComments(prev => prev.map(c => {
    if (c.id !== commentId) return c;
    const wasSameVote = c.userVote === direction;
    return {
      ...c,
      userVote: wasSameVote ? null : direction,
      upvotes: c.upvotes + (direction === "up" ? (wasSameVote ? -1 : 1) : 0),
      downvotes: c.downvotes + (direction === "down" ? (wasSameVote ? -1 : 1) : 0)
    };
  }));
};
```

---

## Implementation Phases

### Phase 1 — Flat Comment List
- Fetch and render top-level comments
- Avatar, username, text, vote count

### Phase 2 — Recursive Replies
- Nested rendering with depth indentation
- Load replies on demand

### Phase 3 — Collapse/Expand
- Toggle collapse on comment
- Hide all descendants when collapsed

### Phase 4 — Voting & Reply
- Upvote/downvote with optimistic update
- Inline reply composer
- Submit and add to tree

### Phase 5 — Sorting & Load More
- Sort bar (Best, New, Top)
- Load more top-level comments
- Load more replies per thread

---

## Edge Cases

| Edge Case | How to Handle |
|-----------|--------------|
| Very deep nesting (20+ levels) | Cap depth (Reddit caps at ~6), show "continue thread" link |
| Deleted comment with replies | Show "[deleted]" placeholder, keep replies visible |
| Self-vote | Disable voting on own comments |
| Edit after replies | Show "(edited)" indicator |
| Max depth reached | Don't show reply button at max depth |
