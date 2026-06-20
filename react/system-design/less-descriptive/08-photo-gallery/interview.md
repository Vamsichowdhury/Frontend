# Photo Gallery with Filters — Interview Transcript

**Level:** Medium | **Duration:** 50-60 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Architecture & Data Structure | ⏹️ |
| 3 | Filter Logic & Derived State | ⏹️ |
| 4 | URL Sync & Sorting | ⏹️ |
| 5 | Performance & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a photo gallery with filtering and sorting. What do you need to clarify?"

**What candidate should ask:**
- [ ] Client-side or server-side filtering?
- [ ] How many photos total? (100 or 100,000?)
- [ ] What filter dimensions? (category, color, orientation?)
- [ ] Can filters be combined? (category AND color)
- [ ] Should URL reflect applied filters?
- [ ] Lazy load images?

**Interviewer answers:**
> "Client-side filtering. ~500 photos. Category + orientation. Yes, combinable. Yes, URL sync. Yes, lazy load."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Architecture & Data Structure

**Interviewer:**
> "Walk me through your components and how you'd model the filter state."

**Expected components:**
```
<GalleryPage>
├── <FilterBar>
│   ├── <CategoryFilter>
│   ├── <OrientationFilter>
│   ├── <SortDropdown>
│   └── <ActivePills>  (show + clear each filter)
├── <ResultCount>  ("Showing 42 of 500")
└── <PhotoGrid>
    └── <PhotoCard> × N
```

**Expected state:**
```javascript
const [filters, setFilters] = useState({
  categories: [],       // multi-select
  orientation: "all",   // single-select
  sortBy: "newest"
});
const [photos, setPhotos] = useState([]);  // raw data, fetched once
```

**Interviewer pushback:**
> "Why store `photos` separately from `filteredPhotos`?"

**Expected:** `photos` is the source of truth from API. `filteredPhotos` is derived — computed from `photos + filters` via `useMemo`. Never duplicate data in state.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Filter Logic & Derived State

**Interviewer:**
> "Show me how filtering and sorting work together."

**Expected:**
```javascript
const filteredPhotos = useMemo(() => {
  let result = photos;

  if (filters.categories.length > 0) {
    result = result.filter(p => filters.categories.includes(p.category));
  }

  if (filters.orientation !== "all") {
    result = result.filter(p => p.orientation === filters.orientation);
  }

  result = [...result].sort((a, b) => {
    if (filters.sortBy === "newest") return b.createdAt - a.createdAt;
    if (filters.sortBy === "popular") return b.likes - a.likes;
    return 0;
  });

  return result;
}, [photos, filters]);
```

**Interviewer pushback:**
> "Why `[...result].sort()` instead of `result.sort()`?"

**Expected:** `Array.sort()` mutates in place. Mutating a variable that came from `photos` (state) is dangerous. Spread creates a copy first.

**Candidate response:** *(write your response here)*

---

# Phase 4 — URL Sync

**Interviewer:**
> "How do you make the filters persist in the URL?"

**Expected:**
```javascript
const [searchParams, setSearchParams] = useSearchParams();

// Read from URL on mount
const [filters, setFilters] = useState({
  categories: searchParams.getAll("category"),
  orientation: searchParams.get("orientation") || "all",
  sortBy: searchParams.get("sort") || "newest"
});

// Write to URL on change
useEffect(() => {
  const params = new URLSearchParams();
  filters.categories.forEach(c => params.append("category", c));
  if (filters.orientation !== "all") params.set("orientation", filters.orientation);
  params.set("sort", filters.sortBy);
  setSearchParams(params, { replace: true });
}, [filters]);
```

**Interviewer pushback:**
> "Why `replace: true` in setSearchParams?"

**Expected:** Without it, every filter change adds to browser history. User would need 10 back-clicks to get to the previous page. `replace` replaces current history entry instead.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Performance & Follow-ups

**Interviewer:**
> "500 photos all rendered at once. Each is a high-res image. What's the impact?"

**Expected:**
1. Lazy load images — only load when visible (IntersectionObserver or `loading="lazy"`)
2. Thumbnails in grid, full image on click
3. Virtual scroll if 500+ items causes render performance issues
4. `React.memo` on PhotoCard

**Interviewer:**
> "Filter returns 0 results. What does the user see?"

**Expected:** Empty state: "No photos match your filters" with a "Clear all filters" button. Don't show blank grid.

**Interviewer final question:**
> "If this were server-side filtering, what changes?"

**Expected:** API call on every filter change (with debounce). URL still syncs. `useMemo` not needed — server does the filtering. Trade-off: more API calls but handles large datasets better.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
