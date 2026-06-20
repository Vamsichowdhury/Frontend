# Photo Gallery with Filters & Sorting - System Design Overview

**Level:** Medium  
**Time to Solve:** 50-60 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a photo gallery where:
- Photos fetched from API and displayed in a grid
- User can filter by category, color, orientation
- User can sort by (newest, oldest, most popular)
- Filters can be combined (category AND color)
- Active filter pills show applied filters
- URL syncs with applied filters (shareable links)
- Lazy load images as they scroll into view

---

## Real-World Examples

- Unsplash photo search
- Pinterest board
- Adobe Stock
- Shutterstock
- E-commerce product grid

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Multiple state coordination | Filters + sort + data all interact |
| URL synchronization | Shareable, bookmarkable state |
| Derived state | Filter/sort applied to base data |
| Performance | Memoizing filtered results |
| Lazy loading | Images loaded only when visible |
| Component design | Reusable filter components |

---

## What You'll Learn

- Managing multiple independent filter states cleanly
- Derived state vs stored state (when to compute vs store)
- URL query param synchronization for filters
- `useMemo` for expensive filter/sort operations
- Image lazy loading with IntersectionObserver
- Masonry/grid layout patterns
- How to design a clean filter API

---

## High-Level Architecture

```
<GalleryPage />
├── <FilterBar />
│   ├── <CategoryFilter />     (Art, Nature, Architecture...)
│   ├── <ColorFilter />        (Red, Blue, Black...)
│   ├── <OrientationFilter />  (Landscape, Portrait, Square)
│   ├── <SortDropdown />       (Newest, Popular, Oldest)
│   └── <ActiveFilterPills />  (show + clear applied filters)
├── <ResultsCount />           ("Showing 42 of 200 photos")
└── <PhotoGrid />
    └── <PhotoCard /> × N
        ├── <LazyImage />
        └── <PhotoMeta />  (author, likes)
```

---

## Data Structure

```javascript
// Filter state
const [filters, setFilters] = useState({
  category: [],           // ["nature", "architecture"]
  color: [],              // ["blue", "black"]
  orientation: "all",     // "all" | "landscape" | "portrait"
  sortBy: "newest"        // "newest" | "oldest" | "popular"
});

// Photos state
const [photos, setPhotos] = useState([]);      // raw data from API
const [loading, setLoading] = useState(false);

// Derived (computed, not stored)
const filteredPhotos = useMemo(() => {
  return applyFilters(photos, filters);
}, [photos, filters]);

// Photo shape
{
  id: "abc123",
  url: "https://...",
  thumb: "https://...",
  category: "nature",
  color: "green",
  orientation: "landscape",
  likes: 450,
  author: "John Doe",
  createdAt: "2024-01-15"
}
```

---

## Data Flow

```
On mount:
  → read filters from URL query params
  → fetch all photos (or first page)
  → apply filters client-side

User selects "Nature" category:
  → setFilters({ ...filters, category: [...filters.category, "nature"] })
  → filteredPhotos recomputed via useMemo
  → URL updated: ?category=nature
  → PhotoGrid re-renders with filtered list

User adds "Blue" color filter:
  → setFilters({ ...filters, color: [...filters.color, "blue"] })
  → Both filters applied: category=nature AND color=blue
  → URL: ?category=nature&color=blue

User removes a filter (X on pill):
  → remove that value from filters state
  → URL updates accordingly

User changes sort:
  → filteredPhotos re-sorted via useMemo
```

---

## Key Concepts to Learn

### 1. Derived State with useMemo
```javascript
// Don't store filtered results — compute from source
const filteredPhotos = useMemo(() => {
  let result = [...photos];

  // Apply category filter
  if (filters.category.length > 0) {
    result = result.filter(p => filters.category.includes(p.category));
  }

  // Apply color filter
  if (filters.color.length > 0) {
    result = result.filter(p => filters.color.includes(p.color));
  }

  // Apply orientation
  if (filters.orientation !== "all") {
    result = result.filter(p => p.orientation === filters.orientation);
  }

  // Apply sort
  result.sort((a, b) => {
    if (filters.sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (filters.sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (filters.sortBy === "popular") return b.likes - a.likes;
    return 0;
  });

  return result;
}, [photos, filters]);
```

### 2. URL Sync for Filters
```javascript
// Read from URL on mount
const [searchParams, setSearchParams] = useSearchParams();

const [filters, setFilters] = useState({
  category: searchParams.getAll("category"),
  color: searchParams.getAll("color"),
  sortBy: searchParams.get("sort") || "newest"
});

// Sync to URL when filters change
useEffect(() => {
  const params = new URLSearchParams();
  filters.category.forEach(c => params.append("category", c));
  filters.color.forEach(c => params.append("color", c));
  params.set("sort", filters.sortBy);
  setSearchParams(params);
}, [filters]);
```

### 3. Image Lazy Loading
```jsx
function LazyImage({ src, alt }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        imgRef.current.src = src;
        setLoaded(true);
        observer.disconnect();
      }
    });
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} alt={alt} className={loaded ? "loaded" : "placeholder"} />;
}
```

---

## Implementation Phases

### Phase 1 — Gallery Grid
- Fetch photos on mount
- Display in CSS grid
- Basic photo card

### Phase 2 — Filter UI
- FilterBar component
- Category/color/orientation toggles
- Sort dropdown

### Phase 3 — Filter Logic
- useMemo for filtering + sorting
- Active filter tracking
- Clear individual/all filters

### Phase 4 — URL Synchronization
- Read filters from URL on mount
- Update URL when filters change
- Shareable links work

### Phase 5 — Performance
- Lazy load images
- React.memo on PhotoCard
- Virtual scroll for 500+ items

---

## Performance Considerations

- useMemo prevents re-filtering on every render
- React.memo on PhotoCard (only re-renders if photo changes)
- Lazy load all images (saves bandwidth)
- Virtualize grid for 500+ items

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| No results after filtering | "No photos match your filters" + clear button |
| URL with invalid filter values | Ignore invalid, fallback to defaults |
| Filters changed while loading | Cancel previous fetch, restart |
| Very large image files | Show thumbnail, lazy load full |
| Filter combination yields 0 | Show zero state, don't break |

---

## Interview Tips for This Question

- Ask: "Is filtering client-side or server-side?" — big architectural decision
- If server-side: API call on every filter change (with debounce)
- If client-side: fetch all once, filter in memory (useMemo)
- Mention URL sync early — shows full-stack thinking
