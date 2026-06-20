# Netflix UI Clone - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React  

---

## Problem Statement

Design the Netflix frontend experience:
- Homepage with content rows (Trending, New, My List)
- Continue watching row (progress per title)
- Hover card preview (trailer autoplay, metadata)
- Search with instant results
- Title detail page (synopsis, episodes, cast)
- Video playback (see video-player question for deep dive)
- Genre/category browsing

---

## Real-World Examples

- Netflix.com
- Disney+
- HBO Max
- Prime Video
- Apple TV+

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Horizontal scroll / row UX | Core Netflix pattern |
| Lazy loading at scale | 100s of rows × 20 posters each |
| Hover interaction + preview | Delayed hover, autoplaying trailer |
| State management at scale | Watchlist, continue watching, ratings |
| Search with instant results | Debounce + categorized results |
| Client-side routing | Row → detail page transitions |

---

## What You'll Learn

- Horizontal scroll row pattern (overflow-x: scroll)
- Intersection Observer for lazy row loading
- Hover intent delay (don't trigger on accidental mouse-over)
- Autoplay video preview on hover (muted)
- Virtualizing poster grids for performance
- How to structure a large app with many data types
- Image optimization (webp, srcset, lazy)

---

## High-Level Architecture

```
<NetflixApp />
├── <Navbar />               (logo, nav links, search icon, avatar)
│   └── <SearchOverlay />    (appears when search icon clicked)
│
└── <HomePage />
    ├── <HeroBanner />       (featured title with play button)
    └── <ContentRows />
        └── <ContentRow title="Trending Now" />  × N
            ├── <RowHeader />   (title + see all)
            ├── <ScrollTrack /> (horizontal scroll container)
            │   └── <PosterCard /> × 20
            │       └── <HoverCard /> (appears on hover)
            └── <ScrollArrows /> (left/right nav buttons)
```

---

## Data Structure

```javascript
// Title shape
{
  id: "tt1234",
  title: "Stranger Things",
  type: "series" | "movie",
  thumbnail: "https://...",
  backdropImage: "https://...",
  trailerUrl: "https://...",
  genres: ["Sci-Fi", "Horror"],
  rating: "TV-14",
  year: 2016,
  matchScore: 97,           // personalized match %
  duration: "50m",          // for movies
  seasons: 4,               // for series
  synopsis: "...",
  cast: ["Millie Bobby Brown", ...]
}

// Continue watching item
{
  ...title,
  progressPercent: 65,      // how far through
  episodeInfo: "S3:E5"
}

// App state
const [rows, setRows] = useState([]);           // homepage rows
const [myList, setMyList] = useState([]);       // user's saved list
const [continueWatching, setContinueWatching] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);
```

---

## Data Flow

```
App loads:
  → fetch user's personalized rows from API
  → lazy load each row's posters as they scroll into view

User hovers a poster:
  → 500ms delay (prevents accidental triggers)
  → expand HoverCard (scale up)
  → after 1s: start playing muted trailer
  → show metadata (match %, rating, year, genres)
  → show action buttons (Play, + Add, 👍)

User clicks Play:
  → navigate to /watch/:titleId
  → load video player

User clicks "+ My List":
  → optimistic: add to myList state immediately
  → POST /api/mylist/:titleId
  → revert if API fails

User types in search:
  → debounce 300ms
  → fetch /api/search?q=query
  → show categorized results (Movies / Series / People)
  → clear on Escape or clicking outside
```

---

## Key Concepts to Learn

### 1. Horizontal Scroll Row
```css
.scroll-track {
  display: flex;
  gap: 4px;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none; /* hide scrollbar */
}
.poster-card {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 200px;
}
```

### 2. Hover Intent (Delay Before Expanding)
```javascript
const hoverTimeout = useRef(null);

const onMouseEnter = () => {
  hoverTimeout.current = setTimeout(() => {
    setHovered(true);
  }, 500); // only trigger after 500ms hover
};

const onMouseLeave = () => {
  clearTimeout(hoverTimeout.current);
  setHovered(false);
};
```

### 3. Scroll Arrow Navigation
```javascript
const scrollRow = (direction) => {
  const track = trackRef.current;
  const scrollAmount = track.clientWidth * 0.8; // scroll 80% of visible width
  track.scrollBy({
    left: direction === "right" ? scrollAmount : -scrollAmount,
    behavior: "smooth"
  });
};
```

### 4. Lazy Load Rows
```javascript
// Only fetch row data when the row scrolls into view
const rowRef = useRef(null);
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setIsVisible(true);
      observer.disconnect();
    }
  });
  observer.observe(rowRef.current);
  return () => observer.disconnect();
}, []);

// Only fetch when visible
useEffect(() => {
  if (isVisible) fetchRowData(rowId);
}, [isVisible]);
```

---

## Implementation Phases

### Phase 1 — Layout & Rows
- Navbar component
- Hero banner
- Static content rows with dummy data
- Horizontal scroll behavior

### Phase 2 — Poster Cards
- Thumbnail rendering
- Hover state expansion
- Hover intent delay
- Action buttons (Play, Add, Like)

### Phase 3 — Data & API
- Fetch personalized row data
- Continue watching with progress bars
- My List (add/remove with optimistic update)

### Phase 4 — Search
- Debounced search input
- Categorized results overlay
- Keyboard navigation through results

### Phase 5 — Performance
- Lazy load rows with IntersectionObserver
- Lazy load images (loading="lazy")
- Memoize PosterCard with React.memo

---

## Performance Considerations

- Lazy load rows — don't fetch all 20 rows on mount
- Lazy load poster images — `loading="lazy"` or IntersectionObserver
- Virtual scroll if rows have 200+ posters
- Preload next episode when current reaches 80%
- Use WebP images + responsive srcset

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Hover card position near edge | Flip to opposite side |
| Trailer autoplay blocked by browser | Catch promise, skip trailer |
| Row with 0 items | Don't render that row |
| Search during row loading | Debounce prevents excess calls |
| Scroll arrows at list boundaries | Hide left arrow at start, hide right at end |
| Continue watching — title deleted | Filter out missing titles |

---

## Interview Tips

- Ask: "Personalized recommendations or static rows?" (changes architecture)
- Ask: "Should hover card show trailers?" (adds video complexity)
- Mention hover intent delay — shows UX awareness
- Discuss lazy loading rows — shows performance thinking
- You don't need to build the video player — reference that question separately
