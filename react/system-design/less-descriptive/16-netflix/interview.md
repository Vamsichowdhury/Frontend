# Netflix UI — Interview Transcript

**Level:** Medium-Hard | **Duration:** 60-75 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Homepage Architecture | ⏹️ |
| 3 | Hover Card & Interactions | ⏹️ |
| 4 | Search & Navigation | ⏹️ |
| 5 | Performance & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design the Netflix homepage. What do you need to know?"

**What candidate should ask:**
- [ ] How many content rows? Fixed or dynamic?
- [ ] Does the hover card show a trailer? (video complexity)
- [ ] Should the hero banner be static or auto-rotating?
- [ ] Do we include My List / Continue Watching rows?
- [ ] Mobile responsive required?
- [ ] Personalized recommendations or static rows?

**Interviewer answers:**
> "Dynamic rows from API. Yes hover card with trailer. Auto-rotating hero. Yes both custom rows. Desktop first. Personalized is a bonus."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Homepage Architecture

**Interviewer:**
> "Walk me through your component hierarchy for the homepage."

**Expected:**
```
<NetflixApp>
├── <Navbar>
├── <HeroBanner>     (featured title, play button, my list)
└── <ContentRows>
    └── <ContentRow title="Trending Now"> × N
        ├── <RowTitle>
        ├── <ScrollTrack>    (overflow-x: scroll)
        │   └── <PosterCard> × 20
        └── <ScrollArrows>   (left/right)
```

**Interviewer pushback:**
> "Why not load all rows at once on page load?"

**Expected:** Too slow — 20 rows × API calls = bad performance. Use lazy loading: fetch each row only when it scrolls into the viewport using IntersectionObserver. Show a skeleton loader while data loads.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Hover Card

**Interviewer:**
> "A user hovers over a poster. What happens? Walk me through the UX and implementation."

**Expected UX description:**
- 500ms delay before expanding (prevents accidental triggers)
- Card scales up and floats above others
- After 1 second: muted trailer starts playing
- Metadata shown: match %, rating, year, genres
- Action buttons: Play, Add to My List, Like, More Info

**Expected hover intent:**
```javascript
const hoverTimer = useRef(null);

const onMouseEnter = () => {
  hoverTimer.current = setTimeout(() => setHovered(true), 500);
};
const onMouseLeave = () => {
  clearTimeout(hoverTimer.current);
  setHovered(false);
};
```

**Interviewer pushback:**
> "Why 500ms? Why not immediately on hover?"

**Expected:** Netflix's own research shows users accidentally trigger hover as they scroll past. 500ms filters out accidental hovers without feeling sluggish.

**Candidate response:** *(write your response here)*

---

# Phase 4 — My List & Continue Watching

**Interviewer:**
> "How does 'Add to My List' work across the UI?"

**Expected:**
- My List is global state (Context or Redux)
- `+` button on hover card: optimistic add to myList
- My List row shows added titles
- Heart icon toggles between + and ✓

**Expected optimistic update:**
```javascript
const toggleMyList = async (titleId) => {
  const isAdded = myList.includes(titleId);
  setMyList(prev => isAdded ? prev.filter(id => id !== titleId) : [...prev, titleId]);
  try {
    await fetch(`/api/mylist/${titleId}`, { method: isAdded ? "DELETE" : "POST" });
  } catch {
    setMyList(prev => isAdded ? [...prev, titleId] : prev.filter(id => id !== titleId));
  }
};
```

**Interviewer:**
> "Continue Watching row shows progress per title. How do you store that?"

**Expected:** Per user, per title: percentage watched and last episode. Fetched from API on load. Updated periodically while watching (every 10-15 seconds, debounced).

**Candidate response:** *(write your response here)*

---

# Phase 5 — Performance & Follow-ups

**Interviewer:**
> "Netflix has millions of users watching simultaneously. What frontend performance considerations matter most?"

**Expected:**
- Lazy load rows with IntersectionObserver
- `loading="lazy"` on all poster images
- WebP image format + responsive srcset
- CDN for all static assets
- React.memo on PosterCard
- Pause trailer when tab is not focused (visibilitychange event)

**Interviewer:**
> "How do you handle the hero banner auto-rotation?"

**Expected:** `setInterval` cycling through featured titles. Pause on hover (clearInterval + restart on mouseleave). `useRef` for interval ID (same as carousel pattern).

**Interviewer final question:**
> "Search on Netflix shows results grouped by Movies, Shows, People. How do you design that?"

**Expected:** Debounced search, API returns categorized results, render in sections. Click result navigates to `/title/:id` or `/search/:query`.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
