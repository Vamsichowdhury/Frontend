# Infinite Scroll / Virtual Scroll - System Design Overview

**Level:** Medium  
**Time to Solve:** 50-60 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a feed/list that:
- Loads first batch on mount
- Automatically loads more as user scrolls to bottom
- Shows loading indicator when fetching next batch
- Handles errors gracefully with retry
- Doesn't re-render all items on each load
- Optionally: virtual scroll for large datasets

---

## Real-World Examples

- Twitter/X feed
- Facebook timeline
- Instagram explore page
- Pinterest masonry grid
- Reddit posts

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Intersection Observer API | Detect when sentinel element is visible |
| Pagination with accumulation | Append, not replace data |
| Performance optimization | Don't re-render entire list |
| Virtual scrolling concept | Render only visible items |
| Memory management | Clean up observers |
| API cursor/offset patterns | Server-side pagination |

---

## What You'll Learn

- Intersection Observer API (better than scroll event listeners)
- Sentinel element pattern (last item as trigger)
- Cursor-based vs offset-based pagination
- `useCallback` for stable observer references
- Virtual scrolling/windowing concept
- Why scroll event listeners are bad for performance
- Memory leak prevention (disconnect observer)

---

## High-Level Architecture

```
<InfiniteFeed />
├── <FeedList>
│   ├── <FeedItem /> × N   (rendered items)
│   └── <SentinelDiv />    (last element, triggers load)
├── <LoadingSpinner />      (when fetching next page)
└── <ErrorBanner />         (on fetch failure + retry)
```

---

## Data Structure

```javascript
// State
const [items, setItems] = useState([]);
const [page, setPage] = useState(1);     // offset-based
// OR
const [cursor, setCursor] = useState(null); // cursor-based (better)
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// API Response (cursor-based)
{
  "items": [...],
  "nextCursor": "eyJpZCI6MTAwfQ==",  // null if no more items
  "hasMore": true
}
```

---

## Data Flow

```
Component mounts:
  → fetch page 1 / first cursor
  → render items
  → attach IntersectionObserver to sentinel div

User scrolls down:
  → sentinel div enters viewport
  → IntersectionObserver fires callback
  → if hasMore && !loading: fetch next page
  → append new items to existing list
  → update cursor/page

API returns last page:
  → hasMore = false
  → detach IntersectionObserver
  → show "You've reached the end"

Component unmounts:
  → observer.disconnect() — prevent memory leak
```

---

## Key Concepts to Learn

### 1. Intersection Observer (NOT scroll event!)
```javascript
// ❌ Bad: scroll event fires 60x per second
window.addEventListener("scroll", () => {
  if (scrolledToBottom()) loadMore();
});

// ✅ Good: IntersectionObserver fires only when element enters viewport
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting && hasMore && !loading) {
      loadMore();
    }
  },
  { threshold: 0.1 } // fire when 10% visible
);

observer.observe(sentinelRef.current);
```

### 2. Sentinel Element Pattern
```jsx
function Feed() {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect);
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect(); // cleanup!
  }, [loading, hasMore]);

  return (
    <div>
      {items.map(item => <FeedItem key={item.id} item={item} />)}
      <div ref={sentinelRef} />  {/* invisible trigger element */}
      {loading && <Spinner />}
    </div>
  );
}
```

### 3. Accumulate Items (Append, Not Replace)
```javascript
const loadMore = async () => {
  setLoading(true);
  const data = await fetchItems(cursor);
  setItems(prev => [...prev, ...data.items]); // append!
  setCursor(data.nextCursor);
  setHasMore(data.hasMore);
  setLoading(false);
};
```

### 4. Cursor vs Offset Pagination
```
Offset: GET /posts?page=3&limit=10
Problem: New item added → everything shifts → duplicate items

Cursor: GET /posts?after=eyJpZCI6MzB9&limit=10
Advantage: Stable even if items are added/deleted
```

---

## Virtual Scrolling Concept

### The Problem
```
100,000 items × 100px each = 10,000,000px DOM height
Browser struggles with millions of DOM nodes
```

### The Solution: Windowing
```
Only render ~20 visible items at once
Calculate positions mathematically
Recycle DOM nodes as user scrolls

Libraries: react-window, react-virtual
```

### When to Use Virtual Scrolling
- 500+ items in a list
- Items have fixed height (easier to calculate)
- Performance is noticeably slow

---

## Implementation Phases

### Phase 1 — Basic List
- Fetch initial data
- Render items
- Loading state

### Phase 2 — Intersection Observer
- Create sentinel div
- Attach observer
- Trigger loadMore on intersection

### Phase 3 — Pagination
- Cursor-based pagination
- Append new items
- hasMore flag

### Phase 4 — Error Handling
- Catch fetch errors
- Show retry button
- Re-attempt on retry

### Phase 5 — Performance (Virtual Scroll)
- Discuss react-window
- Implement basic windowing concept

---

## Performance Considerations

- Use `useCallback` for loadMore to stabilize observer dependency
- Debounce observer callback if needed
- Keys must be unique item IDs (not index)
- `React.memo` on FeedItem to prevent re-renders

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| New items added at top | Cursor-based paging prevents duplicates |
| User scrolls back up fast | Virtual scroll handles this |
| Network error mid-feed | Error state + retry button at bottom |
| Empty feed on first load | Empty state illustration |
| Items deleted from server | Periodic refresh or WebSocket updates |
| Very fast scroll | Debounce intersection callback |

---

## Interview Tips for This Question

- Immediately say "Intersection Observer" — not scroll event listeners
- Explain why cursor-based is better than offset pagination
- Mention virtual scrolling for large lists — shows performance awareness
- Ask: "What's the data? Feed items? Products? Each has different design implications."

---

## Infinite Scroll vs Pagination

| Feature | Infinite Scroll | Pagination |
|---------|----------------|-----------|
| Mobile UX | Excellent | Awkward |
| URL shareable | Hard | Easy (?page=5) |
| Skip to end | Impossible | Jump to last page |
| Feeds/timelines | Perfect | Not ideal |
| Tables/search | Not ideal | Perfect |
