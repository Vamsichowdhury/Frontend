# Netflix UI Clone — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Will push hard on the hover card — that's the most Netflix-specific feature. Will also probe performance: "you have 400 posters, 20 rows, how do you make it fast?"

---

> **How to use this file:**
> The hover card discussion (Phase 5 and 6) is the dramatic centre of this interview. It's the most distinctly Netflix feature and the one that separates strong candidates from average ones. Pay close attention to the portal explanation, the intent delay reasoning, and the autoplay browser restriction.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design the Netflix homepage — the content browsing experience. Go ahead.

---

**Candidate:**

Before I dive in — a few clarifying questions.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why clarify scope for Netflix specifically
> Netflix is a massive product with dozens of distinct experiences. The homepage alone is different from the browse page, the search page, the title detail page, and the watch page. The interviewer saying "Netflix homepage" likely means the content row browsing experience — but confirming this prevents designing the wrong thing and using the time well.

---

**Q1. Are we designing the full product or a specific part — homepage, video player, search?**

> **Why ask this:**
> The homepage (content rows, hover cards) is an entirely different design problem from the video player (see the video-player question separately). If both are in scope, that's 2+ hours of work. In a 45-minute interview, you can go deep on one or shallow on many.
>
> Clarifying this lets you pick the highest-signal area to focus on. The homepage browsing experience — rows, hover cards, lazy loading — is the most Netflix-specific and most interesting to interviewers. The video player is a well-known problem on its own.

---

**Q2. Desktop-first or should mobile be considered?**

> **Why ask this:**
> Netflix's desktop experience (hover cards, horizontal scroll rows) is fundamentally different from mobile (vertical scroll, tap instead of hover). The hover card — Netflix's most distinctive UI feature — doesn't exist on mobile. Touch devices have no hover state.
>
> If mobile is in scope, the hover card discussion becomes irrelevant and the design shifts to a completely different layout. Knowing this upfront avoids designing features that won't apply.

---

**Q3. Should the hover card show a trailer video preview?**

> **Why ask this:**
> This is the single biggest complexity multiplier. Without trailers, a hover card is just a CSS animation showing metadata. With trailers, you need to handle:
> - Fetching the trailer URL on hover
> - Browser autoplay restrictions (audio-triggered autoplay is blocked)
> - Video element lifecycle (create on hover, destroy on leave)
> - Buffering and load time
> - Multiple video elements if user hovers quickly across several cards
>
> Asking this upfront signals that you already know trailer preview is non-trivial. If the answer is yes, you signal to the interviewer that you'll go deep on it.

---

**Q4. How many rows are on the homepage? Do they load all at once?**

> **Why ask this:**
> This is the core performance question for the homepage. Netflix has ~20 rows on the homepage. Loading all 20 rows × 20 titles each = 400 title objects + 400 poster images on page load.
>
> The answer to "load all at once?" determines whether lazy loading is required. If the interviewer wants all rows immediately, the design is simpler but slower. If rows load as user scrolls, you need IntersectionObserver-based lazy loading — a key technical feature.

---

**Q5. Should we handle Continue Watching and My List as special rows?**

> **Why ask this:**
> Continue Watching needs progress-bar data per title (how much the user has watched). My List needs add/remove functionality with immediate visual feedback. Both are meaningfully different from standard content rows.
>
> If both are in scope, the data model needs watch history and saved list state — not just generic title objects. Asking separates the simple case (all rows are the same) from the real case (rows have different types and behaviors).

---

**Interviewer:**

Good questions. Here's the scope:

- Homepage browsing experience — rows, hover card, hero banner. Not the video player.
- Desktop-first. Mobile is a bonus.
- Yes, show trailer on hover — that's important.
- ~20 rows, don't load all at once — lazy load as user scrolls.
- Yes, include Continue Watching and My List.

---

**Candidate:**

Perfect scope. Twenty rows with lazy loading and trailer hover — those three constraints shape the whole design. Let me start with the overall architecture and then go deep on the hover card.

---

## ─────────────────────────────────────
## PHASE 2 — Overall Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the architecture.

---

**Candidate:**

The page has four main visual sections:

```
┌──────────────────────────────────────────────────────────────┐
│  <Navbar>          logo · nav links · search · profile       │
├──────────────────────────────────────────────────────────────┤
│  <HeroBanner>      featured title · play · more info         │
├──────────────────────────────────────────────────────────────┤
│  <ContentRow>      "Trending Now"       → → → → →            │
│  <ContentRow>      "Continue Watching"  → → →                │
│  <ContentRow>      "Because you watched Stranger Things"     │
│  <ContentRow>      ... × 17 more rows                        │
└──────────────────────────────────────────────────────────────┘
```

Data loading strategy — two phases:

```
Phase 1 — On page load (1 API call):
  GET /api/homepage
  Response: [
    { id: "trending",  title: "Trending Now",   order: 1 },
    { id: "continue",  title: "Continue Watching", order: 2 },
    { id: "top10",     title: "Top 10 in India", order: 3 },
    ... × 20 rows
  ]
  → Render 20 row headers with shimmer placeholders

Phase 2 — Lazy, as rows scroll into viewport:
  GET /api/row/trending  → returns 20 title objects
  GET /api/row/continue  → returns watchlist + progress data
  ...triggered by IntersectionObserver per row
```

This means the initial page load is one small API call. Posters only load when the user actually sees that row. A user who never scrolls past the third row has only triggered 3 API calls — not 20.

---

**Interviewer:**

What state does the app manage at the top level?

---

**Candidate:**

```javascript
// Top-level App state
const [rowMeta, setRowMeta] = useState([]);
// [{id, title, order}] × 20 — the row list, lightweight

const [rowData, setRowData] = useState({});
// { "trending": [title, title, ...], "continue": [...] }
// populated lazily as rows load

const [myList, setMyList] = useState(new Set());
// Set of titleIds the user has added — fast O(1) lookup

const [hoveredTitle, setHoveredTitle] = useState(null);
// The title object being hovered — drives HoverCard rendering

const [hoverAnchor, setHoverAnchor] = useState(null);
// { top, left, width } — position of the hovered poster card
// needed to position HoverCard absolutely on screen
```

I keep `myList` as a `Set` because the most common operation is checking "is this title in My List?" — O(1) with a Set, O(n) with an array.

---

## ─────────────────────────────────────
## PHASE 3 — Content Rows & Horizontal Scroll
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through a single content row. What's interesting about it?

---

**Candidate:**

A content row has three challenges: horizontal scrolling, scroll arrows, and the partial last card.

**Horizontal scroll:**

```css
.scroll-track {
  display: flex;
  gap: 4px;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;          /* hide scrollbar on Firefox */
  -webkit-overflow-scrolling: touch;
}
.scroll-track::-webkit-scrollbar { display: none; }

.poster-card {
  flex-shrink: 0;
  width: 200px;
  scroll-snap-align: start;
}
```

**Scroll arrows — left and right:**

```javascript
const trackRef = useRef(null);

const scrollRow = (direction) => {
  const track = trackRef.current;
  const scrollAmount = track.clientWidth * 0.85; // scroll 85% of visible width
  track.scrollBy({
    left: direction === "right" ? scrollAmount : -scrollAmount,
    behavior: "smooth"
  });
};

// Show/hide arrows based on scroll position
const [canScrollLeft, setCanScrollLeft] = useState(false);
const [canScrollRight, setCanScrollRight] = useState(true);

const handleScroll = () => {
  const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
  setCanScrollLeft(scrollLeft > 0);
  setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
};
```

**Partial last card — the affordance:**

Netflix deliberately shows the rightmost card cut off at about 50%. This signals to the user "there's more to see, scroll right." It's not a bug — it's intentional UX. The CSS achieves this with `overflow: hidden` on the row container rather than the scroll track.

---

**Interviewer:**

How do you lazy load each row? Walk me through the IntersectionObserver setup.

---

**Candidate:**

Each `<ContentRow>` component manages its own loading:

```javascript
function ContentRow({ rowId, title }) {
  const [titles, setTitles] = useState(null);  // null = not yet loaded
  const [loading, setLoading] = useState(false);
  const rowRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Row is visible — fetch its content
          setLoading(true);
          fetch(`/api/row/${rowId}`)
            .then(r => r.json())
            .then(data => {
              setTitles(data.titles);
              setLoading(false);
            });
          observer.disconnect(); // only need to load once
        }
      },
      {
        rootMargin: "200px 0px"  // start loading 200px BEFORE it's visible
      }
    );

    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [rowId]);

  return (
    <div ref={rowRef}>
      <RowHeader title={title} />
      {loading || titles === null
        ? <ShimmerRow />          // show skeleton while loading
        : <ScrollTrack titles={titles} />
      }
    </div>
  );
}
```

The `rootMargin: "200px 0px"` means the fetch starts 200px before the row enters the viewport. By the time the user scrolls to that row, the data is already there. No visible loading delay.

---

**Interviewer:**

What is `ShimmerRow` and why is it better than a spinner?

---

**Candidate:**

A spinner says "something is loading." A shimmer skeleton says "here is where the content will appear, and here is its shape." The user's brain can predict what they'll see — reducing the perception of wait time.

```jsx
function ShimmerRow() {
  return (
    <div className="shimmer-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shimmer-card">
          {/* The animated shimmer sweep is pure CSS */}
        </div>
      ))}
    </div>
  );
}
```

```css
.shimmer-card {
  width: 200px;
  height: 113px;     /* 16:9 aspect ratio */
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.shimmer-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

The shimmer sweep moves left to right continuously. Netflix, YouTube, Facebook all use this pattern because it feels significantly faster than a blank area or spinner.

---

## ─────────────────────────────────────
## PHASE 4 — Hover Card (Setup)
## ─────────────────────────────────────

---

**Interviewer:**

Let's talk about the hover card. This is Netflix's most distinctive UI feature. Walk me through it.

---

**Candidate:**

The hover card is the expanded preview that appears when you hover over a poster. It's more complex than it looks. Let me break it into four parts: the intent delay, the animation, the positioning, and the edge case of screen boundaries.

**Part 1 — Intent delay (500ms)**

Without a delay, the hover card would trigger every time the user's mouse passes over a poster while scrolling or moving toward the scroll arrows. That would be deeply annoying.

```javascript
const hoverTimerRef = useRef(null);

const handleMouseEnter = (title, posterElement) => {
  hoverTimerRef.current = setTimeout(() => {
    const rect = posterElement.getBoundingClientRect();
    setHoveredTitle(title);
    setHoverAnchor({
      top:   rect.top + window.scrollY,
      left:  rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
  }, 500); // wait 500ms before showing anything
};

const handleMouseLeave = () => {
  clearTimeout(hoverTimerRef.current); // cancel if mouse left before 500ms
  setHoveredTitle(null);
  setHoverAnchor(null);
};
```

If the mouse leaves before 500ms — nothing happens. The user never knew a hover was pending.

**Part 2 — Scale animation**

The hover card expands the poster to 1.3× scale with a smooth CSS transition:

```css
.hover-card {
  transform: scale(1.3);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
  z-index: 100;
}
```

---

**Interviewer:**

Why does the hover card need to be rendered in a portal? Why not just inside the `<PosterCard>` component?

---

**Candidate:**

Because `<PosterCard>` lives inside `<ScrollTrack>`, which has `overflow: hidden` or `overflow: scroll` set on it. Any child element that tries to expand beyond the scroll track's bounds gets clipped.

```
Without portal:
  <ScrollTrack overflow:hidden>
    <PosterCard>
      <HoverCard scale(1.3)>  ← CLIPPED by overflow:hidden ❌
```

The hover card, when scaled to 1.3×, extends above and below the scroll track. It needs to break out of that container and render on top of everything.

```
With portal:
  <ScrollTrack overflow:hidden>
    <PosterCard>              ← normal poster still here
  
  <document.body>
    <HoverCard>               ← rendered outside scroll track
                               Positioned absolutely over the poster ✅
```

I use `ReactDOM.createPortal`:

```javascript
function HoverCard({ title, anchor }) {
  if (!title || !anchor) return null;

  const position = calculatePosition(anchor); // accounts for edge detection

  return createPortal(
    <div className="hover-card" style={position}>
      <img src={title.posterUrl} alt={title.title} />
      <HoverMetadata title={title} />
      <HoverActions titleId={title.id} />
    </div>,
    document.body
  );
}
```

There's only ONE `<HoverCard>` in the whole app — driven by the `hoveredTitle` state in the root. Not one per poster. This means only one portal element exists at any time, not 400.

---

## ─────────────────────────────────────
## PHASE 5 — Hover Card (Edge Detection)
## ─────────────────────────────────────

---

**Interviewer:**

You mentioned edge detection. What happens when the user hovers over a poster near the right edge of the screen?

---

**Candidate:**

Without edge detection, the hover card expands to the right — outside the viewport. The user sees a card that's partially off-screen.

```
Default — expand right:
  [card][card][card][HOVERED ──────────→ off screen ❌]

Edge detected — expand left:
  [card][card][card][← ─────────── HOVERED]
```

The fix: before positioning the hover card, check how much space is available on each side:

```javascript
function calculatePosition(anchor) {
  const CARD_WIDTH  = 320;   // hover card width when expanded
  const CARD_HEIGHT = 280;   // hover card height
  const VIEWPORT_W  = window.innerWidth;
  const VIEWPORT_H  = window.innerHeight;

  const anchorCentreX = anchor.left + anchor.width / 2;
  const spaceRight = VIEWPORT_W - anchorCentreX;
  const spaceLeft  = anchorCentreX;
  const spaceBelow = VIEWPORT_H - (anchor.top - window.scrollY);

  // Horizontal: prefer centred, flip logic
  let left;
  if (spaceRight < CARD_WIDTH / 2 + 20) {
    // Near right edge — align to right edge of poster
    left = anchor.left + anchor.width - CARD_WIDTH;
  } else if (spaceLeft < CARD_WIDTH / 2 + 20) {
    // Near left edge — align to left edge of poster
    left = anchor.left;
  } else {
    // Normal — centre the card over the poster
    left = anchorCentreX - CARD_WIDTH / 2;
  }

  // Vertical: default above poster, flip below if not enough space
  const top = spaceBelow < CARD_HEIGHT + 20
    ? anchor.top + anchor.height + 8       // show below
    : anchor.top - CARD_HEIGHT - 8;        // show above

  return {
    position: "absolute",
    left: Math.max(8, left),  // never less than 8px from screen edge
    top,
    width: CARD_WIDTH
  };
}
```

---

**Interviewer:**

There are 20 posters in a row. The hover card is one global component. How does it know to animate from the right poster's position?

---

**Candidate:**

The `hoverAnchor` state stores the poster's `getBoundingClientRect()` data. When `hoveredTitle` changes to a new title, the hover card is positioned over that specific poster's coordinates.

But there's a subtle UX issue: if the user moves quickly from poster A to poster B, the hover card should feel like it "jumps" to the new poster rather than slowly fading/sliding from one to another.

The simplest approach: unmount and remount the hover card on each new hover. When `hoveredTitle` changes, the old card exits and the new one enters at the new position. The entrance animation (scale from 1.0 to 1.3) gives it the right feel.

```javascript
// When hoveredTitle changes, the key changes,
// forcing React to unmount + remount the HoverCard
<HoverCard
  key={hoveredTitle?.id}   // ← forces new instance per title
  title={hoveredTitle}
  anchor={hoverAnchor}
/>
```

---

## ─────────────────────────────────────
## PHASE 6 — Trailer Preview
## ─────────────────────────────────────

---

**Interviewer:**

After the hover card appears, a trailer plays. Walk me through that.

---

**Candidate:**

The trailer starts playing approximately 1 second after the hover card appears. This gives the user a moment to read the metadata before the video takes over visually.

```javascript
function HoverCard({ title, anchor }) {
  const [showTrailer, setShowTrailer] = useState(false);
  const trailerTimerRef = useRef(null);

  useEffect(() => {
    // Start trailer 1 second after card appears
    trailerTimerRef.current = setTimeout(() => {
      setShowTrailer(true);
    }, 1000);

    return () => {
      clearTimeout(trailerTimerRef.current);
      setShowTrailer(false); // stop trailer when card closes
    };
  }, []);

  return (
    <div className="hover-card">
      {showTrailer ? (
        <TrailerVideo src={title.trailerUrl} />
      ) : (
        <img src={title.backdropUrl} alt={title.title} />
      )}
      <HoverMetadata title={title} />
      <HoverActions titleId={title.id} />
    </div>
  );
}
```

The `<TrailerVideo>` component:

```javascript
function TrailerVideo({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    video.play().catch(err => {
      // Autoplay was blocked — browser policy
      // Fall back to showing the static image silently
      console.log("Autoplay blocked:", err);
    });

    return () => {
      video.pause();
      video.src = ""; // release memory
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      muted          // REQUIRED for autoplay to work in all browsers
      loop
      playsInline    // REQUIRED on iOS to prevent fullscreen takeover
      preload="auto"
      style={{ width: "100%", height: "180px", objectFit: "cover" }}
    />
  );
}
```

---

**Interviewer:**

Why is `muted` required for autoplay?

---

**Candidate:**

Browsers implemented an autoplay policy in 2018 to stop websites from blasting audio at users. The policy is:

```
Autoplay WITH audio:
  Blocked by default.
  Only allowed if the user has previously interacted with the page
  (clicked, tapped, scrolled) AND the site has a high media
  engagement score (user regularly plays media there).
  → Can't rely on this.

Autoplay WITHOUT audio (muted):
  Always allowed. No restrictions.
  → Netflix uses muted autoplay for trailers.
```

This is why Netflix trailers play silently with a "🔊 Unmute" button. The user has to actively opt into hearing audio — the browser won't allow the page to start audio without a user gesture.

```javascript
// Unmute button in the hover card
<button onClick={() => {
  videoRef.current.muted = !videoRef.current.muted;
}}>
  {isMuted ? "🔇" : "🔊"}
</button>
```

---

**Interviewer:**

User hovers over 5 posters quickly. Are there 5 video elements playing simultaneously?

---

**Candidate:**

No — and this is why the hover card is a single global component, not one per poster.

When the user moves to a new poster, `hoveredTitle` updates to the new title. The previous `<HoverCard>` unmounts (because of the `key` change), which runs the cleanup in its `useEffect` — `video.pause(); video.src = ""`. The new `<HoverCard>` mounts fresh with the new title's data.

```
User hovers poster A:
  → HoverCard(key="tt001") mounts
  → After 1s: video starts playing (muted)

User moves to poster B (before 500ms intent delay):
  → clearTimeout(hoverTimerRef) — intent delay cancelled
  → hoveredTitle stays as A's title
  → HoverCard still showing A's trailer

User pauses on poster B for 500ms+:
  → intent delay fires
  → hoveredTitle = B's title
  → HoverCard(key="tt001") UNMOUNTS → video paused, memory freed
  → HoverCard(key="tt002") MOUNTS → B's static image shown
  → After 1s: B's trailer starts playing

Result: At most ONE video playing at any moment. ✅
```

---

**Interviewer:**

What if the trailer URL hasn't been fetched yet when the card appears?

---

**Candidate:**

The title object already contains the `trailerUrl` — it comes with the row data from the API:

```javascript
{
  id: "tt1234",
  title: "Stranger Things",
  trailerUrl: "https://cdn.netflix.com/trailers/tt1234.mp4",
  ...
}
```

So the URL is available immediately. However, the video file itself needs to download — the first few hundred milliseconds after `<TrailerVideo>` mounts, the video is buffering. The `preload="auto"` attribute tells the browser to start downloading immediately on mount, so by the time 1 second has passed, the trailer is typically ready to play.

For a more sophisticated approach, you could start fetching the trailer as soon as the hover card appears (the static image phase), before even deciding to show the video. This pre-buffers 1 second of trailer content during the static image phase.

---

## ─────────────────────────────────────
## PHASE 7 — Continue Watching
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the Continue Watching row.

---

**Candidate:**

Continue Watching is a special row where each card shows a progress bar and episode information — not just a poster.

Data from API:

```javascript
GET /api/row/continue-watching
Response:
[
  {
    titleId: "stranger-things",
    title: "Stranger Things",
    posterUrl: "...",
    episodeId: "S03E05",
    episodeTitle: "The Source",
    progressSeconds: 1842,
    totalSeconds:    3558,
    progressPercent: 51.8,   // (1842/3558)*100
    timeRemainingLabel: "31 min left",
    lastWatchedAt: "2024-01-15T20:34:00Z"
  }
]
// Sorted by lastWatchedAt DESC — most recently watched first
```

The card renders:

```jsx
function ContinueWatchingCard({ item }) {
  return (
    <div className="poster-card">
      <img src={item.posterUrl} alt={item.title} />
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${item.progressPercent}%` }}
        />
      </div>
      <div className="episode-info">
        {item.episodeId} · {item.timeRemainingLabel}
      </div>
    </div>
  );
}
```

Visual:

```
┌────────────────────────┐
│    [ poster image ]    │
│                        │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░   │  ← red progress bar
│  S3:E5 · 31 min left   │
└────────────────────────┘
```

When the user clicks this card, the video player should start at exactly `progressSeconds` — not from the beginning. That timestamp is passed in the navigation:

```javascript
navigate(`/watch/${item.titleId}?t=${item.progressSeconds}&episode=${item.episodeId}`);
```

---

## ─────────────────────────────────────
## PHASE 8 — My List
## ─────────────────────────────────────

---

**Interviewer:**

User clicks the [+ My List] button on a hover card. What happens?

---

**Candidate:**

Optimistic update — the UI changes instantly, the API call happens in the background.

```javascript
function useMyList() {
  const [myList, setMyList] = useState(new Set());

  const toggleMyList = async (titleId) => {
    const isAdded = myList.has(titleId);

    // Step 1 — Optimistic update (instant)
    setMyList(prev => {
      const next = new Set(prev);
      isAdded ? next.delete(titleId) : next.add(titleId);
      return next;
    });

    // Step 2 — API call (background)
    try {
      await fetch(`/api/mylist/${titleId}`, {
        method: isAdded ? "DELETE" : "POST"
      });
    } catch {
      // Step 3 — Rollback on failure
      setMyList(prev => {
        const next = new Set(prev);
        isAdded ? next.add(titleId) : next.delete(titleId);
        return next;
      });
      showToast("Couldn't update My List. Try again.");
    }
  };

  return { myList, toggleMyList };
}
```

The `[+ My List]` button renders based on the Set:

```jsx
const isInMyList = myList.has(title.id);

<button onClick={() => toggleMyList(title.id)}>
  {isInMyList ? "✓" : "+"}  My List
</button>
```

The My List row itself re-renders automatically because it reads from the same `myList` state — when a title is added, it appears in the row. When removed, it disappears. All without any separate "refresh row" logic.

---

**Interviewer:**

My List is accessed across multiple pages — on the homepage row, in search results, on the title detail page. How do you make the state available everywhere?

---

**Candidate:**

Context API. The `useMyList` hook wraps a `MyListContext` that wraps the entire app:

```javascript
const MyListContext = createContext();

function MyListProvider({ children }) {
  const [myList, setMyList] = useState(new Set());

  // On mount, load saved list from API
  useEffect(() => {
    fetch("/api/mylist")
      .then(r => r.json())
      .then(data => setMyList(new Set(data.titleIds)));
  }, []);

  return (
    <MyListContext.Provider value={{ myList, toggleMyList }}>
      {children}
    </MyListContext.Provider>
  );
}

// Custom hook used anywhere in the tree
const useMyList = () => useContext(MyListContext);
```

Now every component — hover card, search result, title detail page — can call `useMyList()` and get the same state. When a title is added anywhere, the `✓` icon appears everywhere.

---

## ─────────────────────────────────────
## PHASE 9 — Search
## ─────────────────────────────────────

---

**Interviewer:**

How does search work on Netflix?

---

**Candidate:**

Netflix search is interesting because it triggers on every keystroke in real time — you don't press Enter. As soon as you start typing, results appear and update.

```javascript
function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null); // clear results when input is empty
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(data => setResults(data));
  }, [debouncedQuery]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {results && <SearchResults results={results} />}
    </div>
  );
}
```

Netflix's search results are presented differently from a list — they're shown as a content grid, grouped by category:

```
Results for "action"

Movies                    ← section header
┌──────┐ ┌──────┐ ┌──────┐
│      │ │      │ │      │
└──────┘ └──────┘ └──────┘

TV Shows
┌──────┐ ┌──────┐
│      │ │      │
└──────┘ └──────┘
```

The API returns categorised results:

```javascript
{
  movies:   [{ titleId, title, posterUrl }, ...],
  series:   [{ titleId, title, posterUrl }, ...],
  people:   [{ personId, name, photoUrl }, ...]
}
```

---

## ─────────────────────────────────────
## PHASE 10 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

The homepage has 20 rows × 20 posters = 400 images. What happens to performance?

---

**Candidate:**

Four techniques together:

**1. Lazy loading images**

Native `loading="lazy"` defers image download until the image is near the viewport:

```html
<img src="poster.webp" loading="lazy" alt="Stranger Things" />
```

With rows loading lazily via IntersectionObserver, a poster image only needs to load once the row is in view. Combining row lazy loading + image lazy loading means very few images load initially.

**2. Correct image size via srcset**

Sending a 400px image to a mobile user displaying it at 120px wastes 80% of the download:

```html
<img
  srcset="poster_w120.webp 120w, poster_w200.webp 200w, poster_w400.webp 400w"
  sizes="(max-width: 640px) 120px, (max-width: 1024px) 200px, 400px"
  loading="lazy"
  alt="Title"
/>
```

Browser picks the right size automatically.

**3. WebP format**

WebP images are 25–35% smaller than JPEG at the same quality. Netflix serves WebP with JPEG fallback for older browsers:

```html
<picture>
  <source type="image/webp" srcset="poster.webp" />
  <img src="poster.jpg" alt="Title" loading="lazy" />
</picture>
```

**4. React.memo on PosterCard**

When `myList` state updates (a title is added), the root re-renders. Without memoization, all 400 `<PosterCard>` components re-render. With `React.memo`, only the specific card whose `isInMyList` prop changed re-renders.

```javascript
const PosterCard = React.memo(({ title, isInMyList, onToggleMyList }) => {
  // ...
});
```

---

**Interviewer:**

The user's internet connection drops mid-browse. What happens to the hover card and lazy loading?

---

**Candidate:**

Three things need to handle gracefully:

**1. Row that was mid-load:**

```javascript
fetch(`/api/row/${rowId}`)
  .then(r => r.json())
  .then(data => { setTitles(data.titles); setLoading(false); })
  .catch(() => {
    setLoading(false);
    setError(true);  // show retry button in place of shimmer
  });
```

Show a "⟳ Retry" button where the shimmer was.

**2. Trailer autoplay (already muted so no sound issue):**

The video won't load. The `video.play()` call in `TrailerVideo` will fail. The `catch` block silently falls back to showing the static backdrop image — no visible error state needed.

**3. My List toggle:**

Already handled by the optimistic update pattern — the rollback fires and a toast shows "Couldn't update My List."

---

## ─────────────────────────────────────
## PHASE 11 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

Summarise the three most technically interesting decisions in this design.

---

**Candidate:**

**1. Hover card via portal with a single global instance.**
The portal escapes `overflow:hidden` on the scroll track. The single global instance (driven by `hoveredTitle` state at App level) ensures at most one video plays at a time and at most one hover card DOM node exists at any time — not 400.

**2. Intent delay + timer cancel for hover.**
The 500ms `setTimeout` with `clearTimeout` on mouse leave prevents the hover card from triggering on accidental mouse-overs while scrolling. This is the feature that makes the hover UX feel polished rather than jittery.

**3. Row lazy loading with 200px pre-fetch margin.**
One API call on page load for row metadata, then on-demand fetching per row as the user scrolls — with a 200px head start so the data arrives before the row is visible. Reduces initial API load from 20 calls to 1, and eliminates visible loading delays during scroll.

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

1. **Hero banner auto-rotation** — cycle through 3–5 featured titles every 8 seconds. Pause on hover. Same `setInterval` + `clearInterval` pattern as the carousel.

2. **Title detail page** — clicking "More Info" on the hover card navigates to `/title/:id` showing full synopsis, episodes list, cast, and "More Like This" row. A separate but important page.

3. **Profile switching** — Netflix allows multiple profiles per account (different watch history, different recommendations). Profile selection screen before the homepage, with per-profile API calls.

4. **Mature content gate** — profile settings that restrict mature content (TV-MA, R-rated). Filter applied client-side on all rows.

5. **Keyboard navigation** — Tab through posters, Enter to open hover card, arrow keys to navigate suggestions. Important accessibility feature for keyboard users.

---

**Interviewer:**

Great work. Very detailed thinking on the hover card especially.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked whether trailers were in scope upfront (signals you know it's complex)
✅  Two-phase loading: row metadata first, content lazily on scroll
✅  rootMargin: "200px" on IntersectionObserver (pre-fetches before visible)
✅  Shimmer skeleton over spinner — with CSS implementation
✅  Portal for HoverCard — explained WHY (overflow:hidden escaping)
✅  Single global HoverCard instance — not one per poster
✅  Intent delay (500ms) with clearTimeout on mouseleave
✅  Edge detection for hover card position (getBoundingClientRect)
✅  key={hoveredTitle?.id} to force remount and cancel previous video
✅  muted required for autoplay — with correct browser policy explanation
✅  Trailer video cleanup in useEffect return (pause + src = "")
✅  Optimistic My List with rollback on failure
✅  Set<titleId> for O(1) membership check
✅  srcset + WebP for image optimization
✅  React.memo on PosterCard
```

---

## What Would Have Hurt the Score

```
❌  Rendering one HoverCard per poster (400 hover card DOM nodes)
❌  Not using a portal — hover card clipped by overflow:hidden
❌  No intent delay — hover card triggers on every mouse-over
❌  Missing muted attribute — autoplay blocked by browser, card silently broken
❌  Not cleaning up video on hover card close — video plays in background
❌  Loading all 20 rows on page load (20 API calls upfront)
❌  Spinner instead of shimmer skeleton
❌  useState for My List toggle — no optimistic update
❌  No rollback on My List API failure
❌  Not explaining why Set over Array for My List
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Row lazy loading strategy | "20 rows on homepage. Do they all load at once?" |
| 2 | IntersectionObserver with rootMargin | "Walk me through the lazy load setup" |
| 3 | Shimmer skeleton vs spinner | "What is ShimmerRow and why is it better?" |
| 4 | Portal for HoverCard | "Why does HoverCard need a portal?" |
| 5 | Single global HoverCard | "20 posters — 20 hover card instances?" |
| 6 | Hover intent delay | "Walk me through the hover card" |
| 7 | Edge detection (getBoundingClientRect) | "User hovers near right edge. What happens?" |
| 8 | key-based remount for video | "User moves quickly across 5 posters" |
| 9 | muted required for autoplay | "Why is muted required?" |
| 10 | Video cleanup in useEffect | "5 rapid hovers — 5 videos simultaneously?" |
| 11 | Optimistic My List + rollback | "User clicks [+ My List]. What happens?" |
| 12 | srcset + lazy loading | "400 posters. Performance?" |
