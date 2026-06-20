# Infinite Scroll — Interview Transcript

**Level:** Medium | **Duration:** 50-60 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Scroll Detection Strategy | ⏹️ |
| 3 | Pagination & Data Accumulation | ⏹️ |
| 4 | Performance & Virtual Scroll | ⏹️ |
| 5 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Build an infinite scroll feed. What questions do you have?"

**What candidate should ask:**
- [ ] What data is in the feed? (posts, products, images?)
- [ ] How many items per batch?
- [ ] Is there a max total items or truly infinite?
- [ ] Should the URL preserve scroll position on back?
- [ ] What happens at the very end of the list?
- [ ] Expected dataset size? (100 items or 100,000?)

**Interviewer answers:**
> "Social media posts. 20 per batch. Assume 10,000 total. Show 'end of feed' message when done. No URL scroll needed."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Scroll Detection Strategy

**Interviewer:**
> "How do you detect when the user has scrolled to the bottom?"

**Common wrong answer:** `window.addEventListener("scroll", ...)` — interviewer will push back.

**Expected right answer:** Intersection Observer API

**Why Intersection Observer is better:**
```
Scroll events: fire ~60 times per second while scrolling
              → massive performance cost
              → need manual throttle/debounce

IntersectionObserver: fires ONLY when sentinel element enters/leaves viewport
                     → browser-native, off main thread
                     → zero performance cost while scrolling
```

**Expected implementation:**
```javascript
const sentinelRef = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting && hasMore && !loading) loadMore(); },
    { threshold: 0.1 }
  );
  if (sentinelRef.current) observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, loading]);

return (
  <div>
    {items.map(item => <PostCard key={item.id} {...item} />)}
    <div ref={sentinelRef} style={{ height: 1 }} />  {/* invisible trigger */}
  </div>
);
```

**Interviewer pushback:**
> "Why place the sentinel inside the list and not at window bottom?"

**Expected:** More reliable — triggers before actual bottom, giving time to fetch before user runs out of content.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Pagination & Data Accumulation

**Interviewer:**
> "How do you handle the API calls and accumulate data?"

**Expected cursor-based vs offset-based discussion:**
```
Offset: ?page=3&limit=20
Problem: New post inserted → all offsets shift → user sees duplicate

Cursor: ?after=post_id_60&limit=20
Advantage: Stable regardless of insertions
```

**Expected state management:**
```javascript
const [items, setItems] = useState([]);
const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  setLoading(true);
  const data = await fetch(`/api/posts?after=${cursor}&limit=20`).then(r => r.json());
  setItems(prev => [...prev, ...data.items]);   // APPEND, not replace
  setCursor(data.nextCursor);
  setHasMore(data.hasMore);
  setLoading(false);
};
```

**Interviewer pushback:**
> "What's rendered at the very end of the list?"

**Expected:** When `hasMore = false` — show "You're all caught up!" message. Disconnect the observer.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Performance & Virtual Scroll

**Interviewer:**
> "User scrolls through 5,000 posts. Now there are 5,000 DOM nodes. What happens?"

**Expected problem:** Memory grows, scrolling slows, browser may crash.

**Expected solution: Virtual Scrolling**
```
Only render ~20 visible items
As user scrolls: remove off-screen items, add new ones
DOM is always ~20 nodes, not 5,000

Libraries: react-window, react-virtual, @tanstack/virtual
```

**Candidate explains concept:**
```javascript
// Concept: only render items in visible range
const ITEM_HEIGHT = 80;
const visibleStart = Math.floor(scrollTop / ITEM_HEIGHT);
const visibleEnd = visibleStart + Math.ceil(containerHeight / ITEM_HEIGHT);
const visibleItems = allItems.slice(visibleStart, visibleEnd);
```

**Interviewer pushback:**
> "When would you use virtual scrolling vs regular scroll?"

**Expected:** Regular scroll: < ~500 items, variable height items. Virtual scroll: 500+ fixed-height items, noticeable performance issues.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Edge Cases & Follow-ups

**Interviewer:**
> "New posts added while user is scrolling. How do they see them?"

**Expected:**
- Show "3 new posts available" banner at top
- Don't auto-insert (would disrupt user's reading position)
- User clicks banner to refresh and scroll to top

**Interviewer:**
> "Network error loading the next batch. What shows?"

**Expected:** Error banner at bottom of list with "Retry" button. Reconnect observer when retry succeeds.

**Interviewer final question:**
> "Compare infinite scroll to pagination. When would you choose each?"

**Expected:**
- Infinite scroll: social feeds, image galleries, mobile-first (no "page 5" concept)
- Pagination: e-commerce tables, search results, anything users need to revisit by page number

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
