# Netflix UI Clone — Interview Overview

---

## What Problem Are We Solving?

Design the Netflix homepage and browsing experience — the content discovery layer that helps users find and start watching shows and movies.

```
┌─────────────────────────────────────────────────────────────────┐
│  N E T F L I X          Search  🔔  Avatar                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │   STRANGER THINGS                                        │  │
│   │   Sci-fi · Horror · 4 Seasons                           │  │
│   │   [▶ Play]  [+ My List]                                 │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Trending Now                                               ❯   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │      │ │  ◀▶  │ │      │ │      │ │      │ │      │        │
│  │ 🎬  │ │HOVER │ │ 🎬  │ │ 🎬  │ │ 🎬  │ │ 🎬  │        │
│  │      │ │CARD  │ │      │ │      │ │      │ │      │        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                                                 │
│  Continue Watching                                          ❯   │
│  ┌──────┐ ┌──────┐ ┌──────┐                                    │
│  │ 🎬  │ │ 🎬  │ │ 🎬  │                                    │
│  │▓▓▓░░│ │▓▓░░░│ │▓░░░░│  ← progress bars                    │
│  └──────┘ └──────┘ └──────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Makes Netflix's UI Hard to Build

```
EASY part:  Render a grid of images.

HARD parts:
  1. Hover card — 500ms intent delay, expand animation,
     then trailer video autoplays after 1 more second.
     Position must flip near screen edges.

  2. Row lazy loading — 20 rows × 20 posters = 400 images.
     Loading all at once: slow initial load, wasted bandwidth.
     Load each row only when it scrolls into view.

  3. Horizontal scroll — smooth custom scroll with arrows,
     scroll snap, showing partial last card as affordance.

  4. Performance — 400 posters, 20+ video elements,
     shimmer skeletons, smooth 60fps animations everywhere.

  5. Image optimization — same poster at 3 different sizes
     depending on viewport (mobile / tablet / desktop).
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Full clone or specific features?        │
│  2. Architecture    →  Page structure, data flow               │
│  3. Content rows    →  Horizontal scroll, arrow navigation     │
│  4. Lazy loading    →  IntersectionObserver per row            │
│  5. Hover card      →  The centrepiece — intent delay,         │
│                         expand animation, edge detection        │
│  6. Trailer preview →  Autoplay on hover, muted, cleanup       │
│  7. Continue Watching→ Progress bars, watch state              │
│  8. My List         →  Optimistic add/remove, persistence      │
│  9. Search          →  Debounce, categorised results           │
│  10. Performance    →  Images, skeletons, virtual rows         │
│  11. Edge cases     →  No internet, autoplay blocked, errors   │
└────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       USER'S BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      <NetflixApp>                          │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  <Navbar>  Search · Notifications · Profile          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  <HeroBanner>  featured title + play/info buttons    │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  <ContentRows>  (one row per category)               │  │  │
│  │  │    <ContentRow> ← lazy loaded via IntersectionObserver│  │  │
│  │  │    <ContentRow> ← skeleton until visible             │  │  │
│  │  │    <ContentRow> ← not yet fetched                    │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  <HoverCard> (portal, position calculated)                 │  │  
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
        │                    │                    │
  GET /api/rows         GET /api/row/:id    GET /api/search?q=
  (row metadata)        (row titles)        (search results)
        │
  ┌─────▼──────────────────────────────────────────────────────┐
  │                    NETFLIX BACKEND                         │
  │  - Personalisation engine (rows ordered per user)          │
  │  - Title metadata (posters, synopsis, genres)              │
  │  - Watch history + progress (continue watching)            │
  │  - My List (saved titles)                                  │
  └────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
<NetflixApp>
│
├── <Navbar>
│     ├── <Logo>
│     ├── <NavLinks>        (Home, TV Shows, Movies, New & Popular)
│     ├── <SearchBar>       (expands on icon click, debounced)
│     ├── <NotificationBell>
│     └── <ProfileMenu>
│
├── <HeroBanner featuredTitle={...}>
│     ├── Background image (full bleed, gradient overlay)
│     ├── Title logo image
│     ├── Metadata (genres, year, rating)
│     ├── Synopsis (2–3 lines, truncated)
│     ├── [▶ Play] button
│     └── [ℹ More Info] button
│
├── <ContentRows>
│     └── <ContentRow key={rowId}> × N    ← one per category
│           ├── <RowHeader>               (title + "Explore All" link)
│           ├── <PrevArrow>               (shows on hover)
│           ├── <ScrollTrack ref={trackRef}>
│           │     └── <PosterCard key={titleId}> × 20
│           │           └── <HoverCard>  (portal, on hover intent)
│           └── <NextArrow>
│
└── <HoverCardPortal>       (rendered into document.body, one global)
      ├── <TrailerVideo>    (muted, autoplays after 1s)
      ├── <HoverMetadata>   (match %, year, rating, genres)
      └── <HoverActions>    ([▶ Play] [+ My List] [👍] [⌄ More])
```

---

## Hover Card — The Most Important Feature

```
TIMELINE of a hover interaction:

t=0ms     Mouse enters poster
t=0–500ms Nothing happens (intent delay)
           ← prevents triggering when mouse moves across row

t=500ms   Timer fires
          → HoverCard begins expanding (CSS scale animation)
          → Fetch trailer URL if not cached
          → Position HoverCard above/below poster

t=500–1500ms HoverCard visible, static image shown

t=1500ms  Start playing muted trailer (autoplay)

Mouse leaves poster at any point:
  → clearTimeout (if before 500ms) → nothing shown
  → close HoverCard, pause/unload video

EDGE CASE: poster near right edge
  Default:   HoverCard expands to the right
  Near edge: HoverCard flips to expand LEFT
             (detect using getBoundingClientRect)
```

---

## Row Lazy Loading Strategy

```
20 rows × GET /api/row/:id = 20 API calls on page load = SLOW ❌

Instead:

Phase 1 (on page load):
  Fetch row metadata only: [{ id, title, order }] × 20
  Show 20 row title headers + shimmer skeletons

Phase 2 (IntersectionObserver):
  When a row scrolls into viewport:
    → fetch that row's content: GET /api/row/:id
    → replace shimmer with real poster cards

Result:
  Initial load: 1 API call (row list)
  Row loads: on demand as user scrolls
  User only sees rows they scroll to
  Bandwidth saved: ~80% on average session
```

---

## Skeleton / Shimmer Loading

```
Before data loads:                 After data loads:
┌──────┐ ┌──────┐ ┌──────┐        ┌──────┐ ┌──────┐ ┌──────┐
│▒▒▒▒▒▒│ │▒▒▒▒▒▒│ │▒▒▒▒▒▒│   →    │      │ │      │ │      │
│▒▒▒▒▒▒│ │▒▒▒▒▒▒│ │▒▒▒▒▒▒│        │  🎬  │ │  🎬  │ │  🎬  │
│▒▒▒▒▒▒│ │▒▒▒▒▒▒│ │▒▒▒▒▒▒│        │      │ │      │ │      │
└──────┘ └──────┘ └──────┘        └──────┘ └──────┘ └──────┘

Shimmer = animated gradient sweep left to right
Better UX than spinner — user sees the layout before content
```

---

## Continue Watching — Progress Bar

```
Title card with watch progress:
┌────────────────────────┐
│                        │
│      [ poster ]        │
│                        │
│  S3:E5 · 42 min left   │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░   │ ← 52% watched
└────────────────────────┘

Data:
{
  titleId: "stranger-things",
  episodeId: "S03E05",
  progressSeconds: 1842,
  totalSeconds:    3558,
  progressPercent: 51.8,
  lastWatchedAt:   "2024-01-15T20:34:00Z"
}

Sorted by lastWatchedAt DESC → most recently watched first
```

---

## My List — Optimistic Update Pattern

```
User clicks [+ My List] on a poster:

  1. Immediately: flip icon to ✓, move title to My List row
     (optimistic — user sees change instantly)

  2. POST /api/mylist { titleId }  (background)

  3. Success → nothing extra needed, state already correct
     Failure → revert: flip icon back to +, remove from row
               show toast: "Failed to save. Try again."
```

---

## Data Structures

```javascript
// Row metadata (fetched on page load)
{
  id: "trending-now",
  title: "Trending Now",
  type: "standard",        // "standard" | "continue-watching" | "my-list"
  order: 2,
  titleCount: 20
}

// Title (fetched per row, lazily)
{
  id: "tt1234567",
  title: "Stranger Things",
  type: "series",          // "series" | "movie"
  posterUrl: "https://img.nflximg.com/...",     // 16:9 thumbnail
  logoUrl:   "https://img.nflximg.com/...",     // title treatment
  backdropUrl: "https://img.nflximg.com/...",   // hero image
  trailerUrl: "https://...",
  matchScore: 97,
  maturityRating: "TV-14",
  genres: ["Sci-Fi", "Horror", "Drama"],
  seasons: 4,
  year: 2016,
  synopsis: "When a young boy vanishes, a small town uncovers..."
}
```

---

## Image Optimization Strategy

```
One poster, three sizes:

Mobile  (< 640px):   poster_w200.jpg   (~15KB)
Tablet  (< 1024px):  poster_w300.jpg   (~30KB)
Desktop (≥ 1024px):  poster_w400.jpg   (~50KB)

HTML implementation:
<img
  src="poster_w400.jpg"
  srcset="poster_w200.jpg 200w, poster_w300.jpg 300w, poster_w400.jpg 400w"
  sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px"
  loading="lazy"
  alt="Stranger Things"
/>

Netflix also uses WebP format (30–40% smaller than JPEG)
with JPEG fallback via <picture> element.
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|----------------|
| Hover intent delay | Prevents false triggers while scrolling across rows |
| HoverCard position flip | Edge detection via getBoundingClientRect |
| Portal for HoverCard | Escapes overflow:hidden on parent scroll track |
| Row lazy loading | 20 API calls on load → 1 call + on-demand |
| IntersectionObserver per row | Trigger API call only when row enters viewport |
| Autoplay restrictions | Browsers block autoplay with sound |
| Trailer preload strategy | Fetch URL on hover, start playing after 1s |
| Shimmer skeleton pattern | Better perceived performance than spinner |
| Continue watching sort | Most recently watched first, progress bars |
| Optimistic My List | Instant feedback without waiting for API |
| Horizontal scroll + arrows | Custom scroll, scroll snap, arrow visibility |
| Image srcset + lazy loading | Correct image size per device, lazy below fold |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Renders rows with images. Knows API is needed.
Mid-level →   Lazy loads rows. Describes hover card basics.
              Mentions debounce for search.
Senior    →   Hover intent delay + edge flip logic.
              Portal for HoverCard (escapes overflow:hidden).
              Trailer autoplay lifecycle + cleanup.
              Image srcset + skeleton loading.
              IntersectionObserver per row.
Staff     →   Personalization architecture, A/B testing rows,
              CDN image delivery, prefetch on hover.
```
