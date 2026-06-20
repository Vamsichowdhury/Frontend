# Nested Comments System — Interview Overview

---

## What Problem Are We Solving?

Build a threaded comment system where users can reply to any comment, creating a tree of nested discussions. Users can vote, collapse threads, and load more replies on demand.

```
┌────────────────────────────────────────────────────────────────┐
│  1,234 Comments  Sort by: [Top ▾]                              │
│  ─────────────────────────────────────────────────────────────  │
│  [avatar] Add a comment...                                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                │
│  [A] Alice Johnson  ·  2 hours ago            ▲ 234   ▼       │
│      Great article! Really enjoyed the depth here.            │
│      [Reply]  [Edit]  [···]                                    │
│      ─────────────────────────────────────────────────        │
│      │ [B] Bob  · 1 hour ago                  ▲ 45    ▼       │
│      │     I agree! Especially the third point.               │
│      │     [Reply]                                            │
│      │     ─────────────────────────────────────────         │
│      │     │ [C] Charlie  · 30 min ago         ▲ 12   ▼      │
│      │     │     @Bob which point specifically?              │
│      │     │     [Reply]                                      │
│      │     └─────────────────────────────────────────        │
│      │ [D] Diana  · 45 min ago                 ▲ 23   ▼      │
│      │     The section on performance was eye-opening.        │
│      └─────────────────────────────────────────────────────   │
│      [▴ Collapse]                                             │
│                                                                │
│  [E] Eve  · 3 hours ago                        ▲ 89   ▼       │
│      [This comment was deleted]                                │
│      ─────────────────────────────────────────────────        │
│      │ [F] Frank  · 2 hours ago                ▲ 31   ▼      │
│      └─────────────────────────────────────────────────────   │
└────────────────────────────────────────────────────────────────┘
```

Used in: Reddit, Hacker News, YouTube, GitHub PRs, Stack Overflow, Medium

---

## What Makes Nested Comments Hard to Build

```
1. Tree data model — flat list with parentId vs nested tree object
   API returns data in one shape; rendering needs another.
   Choice has real performance and update complexity tradeoffs.

2. Recursive component rendering
   A comment renders itself, which renders its replies,
   which each render their replies — arbitrary depth.

3. Collapse/expand subtrees
   Collapsing a comment hides ALL descendants, not just direct replies.
   Need to efficiently know "is this comment a descendant of a collapsed one?"

4. Load more replies on demand
   Top-level comments load with the page.
   Replies are fetched separately only when user expands.
   Prevents loading thousands of nested replies upfront.

5. Optimistic add/vote
   New reply appears immediately without waiting for API.
   Vote count updates instantly.
   Both need rollback on failure.

6. Deleted comment with existing replies
   Can't remove the comment — breaks the thread.
   Show "[deleted]" placeholder, keep replies visible.
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Depth limit? Voting? Moderation?        │
│  2. Data model      →  THE centrepiece:                        │
│                         Flat (parentId) vs nested tree         │
│  3. Normalised state→  Map<id, comment> for O(1) updates       │
│  4. Recursive render→  CommentNode renders CommentNode         │
│  5. Collapse logic  →  Hide subtree without mutating tree      │
│  6. Load more       →  Pagination per thread, cursor-based     │
│  7. Optimistic reply→  Temp ID, replace on ACK                 │
│  8. Voting          →  Mutual exclusion (up removes down)      │
│  9. Sorting         →  Top / New / Controversial               │
│  10. Performance    →  Virtual scroll, React.memo              │
│  11. Edge cases     →  Deleted, max depth, very long threads   │
│  12. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Two Data Approaches — The Core Decision

```
APPROACH 1: Nested Tree (from API)
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

✅ Easy to render recursively — just pass replies as children
❌ Updating a deeply nested comment requires traversal
❌ Adding a reply means finding the parent in the tree
❌ Normalizing for React state is complex

─────────────────────────────────────────────────────────────────

APPROACH 2: Flat with parentId (RECOMMENDED)
[
  { id: "c1", parentId: null, text: "Great article!",  depth: 0 },
  { id: "c2", parentId: "c1", text: "I agree!",        depth: 1 },
  { id: "c3", parentId: "c2", text: "Me too!",         depth: 2 },
  { id: "c4", parentId: "c1", text: "Also great...",   depth: 1 }
]

✅ Any comment update is a simple array map — O(1) by ID
✅ Adding a reply is array.push — no tree traversal
✅ Works naturally with API pagination (cursor-based)
✅ Easy to normalise into a Map<id, comment>
❌ Must build children relationships for rendering
```

---

## Normalised State — The Smart State Shape

```javascript
// Store comments in a Map<id, comment> — O(1) lookups and updates
const [commentsMap, setCommentsMap] = useState(new Map());
// "c1" → { id:"c1", parentId:null, text:"...", upvotes:234, ... }

// Also store root comment IDs in order (for top-level list)
const [rootIds, setRootIds] = useState([]);
// ["c1", "c5", "c8"] — top-level comments in display order

// Get children of a comment O(1) via childrenMap
// Build once: { "c1": ["c2", "c4"], "c2": ["c3"] }
const childrenMap = useMemo(() => {
  const map = {};
  commentsMap.forEach((comment) => {
    if (comment.parentId) {
      map[comment.parentId] = [...(map[comment.parentId] || []), comment.id];
    }
  });
  return map;
}, [commentsMap]);

// Update a single comment — O(1):
setCommentsMap(prev => new Map(prev).set(commentId, updatedComment));
```

---

## Recursive Component

```
<CommentNode id="c1" depth={0}>
  <CommentNode id="c2" depth={1}>
    <CommentNode id="c3" depth={2} />
  </CommentNode>
  <CommentNode id="c4" depth={1} />
</CommentNode>
```

---

## Collapse State

```
collapsedIds = new Set()  ← IDs of comments whose subtree is hidden

User collapses c1:
  collapsedIds.add("c1")
  → c1 itself stays visible (shows "▶ 3 replies" indicator)
  → c2, c3, c4 are hidden

To check if a comment should render:
  isHidden(id) → walk up parent chain
                 if any ancestor is in collapsedIds → return true
```

---

## Vote State (Mutual Exclusion)

```
"none" | "up" | "down"   ← enum, not two booleans

press ▲ while "none"  → "up",   upvotes+1
press ▲ while "up"    → "none", upvotes-1   (toggle off)
press ▲ while "down"  → "up",   upvotes+1, downvotes-1
press ▼ while "none"  → "down", downvotes+1
press ▼ while "down"  → "none", downvotes-1 (toggle off)
press ▼ while "up"    → "down", downvotes+1, upvotes-1
```

---

## What You Will Learn

| Concept | Why It Matters |
|---------|----------------|
| Flat vs nested data model | Flat is always better for mutable state |
| Normalised Map<id, comment> | O(1) updates vs O(n) tree traversal |
| childrenMap derived from flat list | Build tree relationships without storing them |
| Recursive React component | CommentNode renders CommentNode |
| Collapse via ancestor check | No mutation — just a Set of collapsed IDs |
| Temp ID optimistic reply | Same pattern as chat app messages |
| Vote as enum (not 2 booleans) | Same pattern as YouTube like/dislike |
| Load more per thread | Cursor-based pagination scoped to a parent |
| Depth cap (e.g. 6 levels) | Reddit caps at 6 — UX and performance |
| Deleted comment placeholder | Keep thread integrity, show tombstone |
