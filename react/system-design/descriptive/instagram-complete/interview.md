# Instagram UI Clone — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Will go deep on the Stories system — it's the most Instagram-specific feature and the one most candidates underestimate. Will also probe the double-tap like implementation for the position-based animation detail.

---

> **How to use this file:**
> The Stories viewer (Phase 6) is the dramatic centre of this interview. The progress bar CSS animation with pause/resume, the tap zone detection, and the hold-to-pause touch event handling are all non-obvious. The double-tap like (Phase 7) is the second richest area — specifically the use of `useRef` not `useState` for tap timing, and the position-based heart animation.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design the Instagram frontend. Go ahead.

---

**Candidate:**

Instagram has a lot of distinct features. Let me ask a few questions to figure out what we're actually building today.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why scoping Instagram is essential
> Instagram's feature surface is enormous: feed, stories, Reels, Explore, Shopping, Live, DMs, profile, highlights, IGTV. Each is a distinct product. A broad answer covering all of them superficially wastes time on every feature and goes deep on none. The feed + stories combination is the most commonly asked because it contains the most distinct frontend engineering challenges — and interviewers almost always want depth over breadth.

---

**Q1. Are we designing the main feed and stories, or also Reels, Explore, DMs?**

> **Why ask this:**
> This single question determines the scope of the next 50 minutes.
> - Feed + stories: focus on post card, infinite scroll, the full stories system, double-tap to like
> - Add Reels: vertical video swipe navigation (TikTok-like) — a completely different design problem
> - Add Explore: masonry grid, search
> - Add DMs: essentially a chat app (see chat-app question)
>
> Most interviewers want the feed + stories combination. Asking signals you know each area is its own engineering problem, not one amorphous "Instagram."

---

**Q2. Stories — do they include video or just images?**

> **Why ask this:**
> Image stories have a fixed duration (typically 5 seconds, configurable). Video stories have a duration equal to the video length. This changes the progress bar implementation significantly:
> - Image: you know the duration upfront, animation starts immediately
> - Video: you need to wait for `loadedmetadata` to get the actual duration, then start the animation
>
> If only images are in scope, the implementation is simpler. If videos are included, you need to handle the async duration problem.

---

**Q3. Should the double-tap to like show a heart animation at the tap position?**

> **Why ask this:**
> This sounds like a small detail, but it's non-trivial. The heart must appear at the *exact coordinates* where the user's finger landed — not at the center of the image. This requires capturing the touch event's `clientX/clientY`, converting to coordinates within the image container, and absolutely positioning a DOM element there.
>
> Asking this signals you already know the position-based animation is the interesting part of double-tap, not just the like toggling.

---

**Q4. Mobile-first or desktop-first?**

> **Why ask this:**
> Instagram is fundamentally a mobile app. The web version exists, but Instagram was designed for touch. Several key interactions — double-tap, hold-to-pause, swipe-to-close stories — only make sense on touch devices.
>
> If desktop is required, hover states need to replace touch interactions. The stories viewer needs keyboard navigation (← → arrows). The design effort changes significantly.
>
> Most interviewers will say mobile-first, which lets you focus on touch interaction design.

---

**Q5. Explore grid — masonry layout or uniform square grid?**

> **Why ask this:**
> Instagram's Explore page uses a mixed layout — some posts take 1×1, some take 2×2 (featured posts). This is harder than a uniform grid and requires knowing in advance which posts are "featured."
>
> A uniform square grid (Instagram's profile page layout) is CSS-simple. The Explore mixed grid either needs JavaScript for placement or a more complex CSS Grid approach.
>
> This question surfaces scope complexity early. Most interviewers will say "uniform grid is fine."

---

**Interviewer:**

Good framing. Here's the scope:

- Feed + stories. Explore as a bonus.
- Yes, both image and video stories.
- Yes, heart animation at tap position for double-tap.
- Mobile-first. Desktop is a bonus.
- Uniform grid for Explore if there's time.

---

**Candidate:**

Perfect. Stories with video support and position-based heart animation — those are the two most interesting parts. Let me start with the overall architecture and then go deep on both.

---

## ─────────────────────────────────────
## PHASE 2 — Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the overall architecture.

---

**Candidate:**

The main feed page has three sections stacked vertically:

```
<InstagramApp>
│
├── <Navbar>           fixed top, height 44px
│
├── <StoriesBar>       horizontal scroll, below navbar
│     └── <StoryAvatar> × N
│
├── <PostFeed>         infinite scroll, main content
│     └── <PostCard> × N
│
└── <StoriesViewer>    conditional — full-screen overlay when a story is open
```

Data loading on mount — parallel:

```javascript
useEffect(() => {
  Promise.all([
    fetch("/api/feed?limit=12").then(r => r.json()),
    fetch("/api/stories").then(r => r.json())
  ]).then(([feedData, storiesData]) => {
    setPosts(feedData.posts);
    setFeedCursor(feedData.cursor);
    setStoryUsers(storiesData);
  });
}, []);
```

Feed and stories are independent — no reason to wait for one before fetching the other.

Stories response includes the full story content (media URLs, durations) for all users. This means opening a story requires no additional API call — the data is already there. The response is typically small (100–200KB for 20 story users).

---

## ─────────────────────────────────────
## PHASE 3 — Feed & Post Card
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the feed and post card.

---

**Candidate:**

The feed is a vertical infinite-scroll list. Standard IntersectionObserver pattern with cursor-based pagination:

```javascript
function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    const url = cursor
      ? `/api/feed?cursor=${cursor}&limit=12`
      : "/api/feed?limit=12";
    const data = await fetch(url).then(r => r.json());
    setPosts(prev => [...prev, ...data.posts]);
    setCursor(data.nextCursor);
    setHasMore(!!data.nextCursor);
  }, [cursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <div ref={sentinelRef} />
      {!hasMore && <p>You're all caught up! ✓</p>}
    </div>
  );
}
```

Each `PostCard` has a fixed structure:

```
┌──────────────────────────────────┐
│ [avatar] @username    location ···│  ← PostHeader
├──────────────────────────────────┤
│                                  │
│         POST IMAGE               │  ← PostMedia (tap zone for double-tap)
│         or carousel              │
│                                  │
├──────────────────────────────────┤
│ ❤️  🗨️  ↗          🔖    ● ○ ○  │  ← PostActions + carousel dots
│ 1,234 likes                      │
│ @alice Beautiful sunset… more    │
│ View all 87 comments             │
│ 2 hours ago                      │
└──────────────────────────────────┘
```

---

**Interviewer:**

A post has 3 images in a carousel. Walk me through the swipe behavior.

---

**Candidate:**

The carousel tracks a `currentIndex` per post with touch events:

```javascript
function PostCarousel({ media }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    const SWIPE_THRESHOLD = 50; // px — must swipe at least 50px to change

    if (delta > SWIPE_THRESHOLD && currentIndex < media.length - 1) {
      setCurrentIndex(i => i + 1); // swipe left → next image
    } else if (delta < -SWIPE_THRESHOLD && currentIndex > 0) {
      setCurrentIndex(i => i - 1); // swipe right → previous image
    }
    // If delta is below threshold: snap back (index unchanged, CSS resets)
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: "transform 0.3s ease"
        }}
      >
        {media.map((item, i) => (
          <img
            key={i}
            src={item.url}
            loading={Math.abs(i - currentIndex) <= 1 ? "eager" : "lazy"}
            style={{ minWidth: "100%", objectFit: "cover" }}
            alt=""
          />
        ))}
      </div>

      {/* Dot indicators */}
      <div className="carousel-dots">
        {media.map((_, i) => (
          <span key={i} className={i === currentIndex ? "dot active" : "dot"} />
        ))}
      </div>
    </div>
  );
}
```

The `loading` attribute is set to `eager` only for the current image and its immediate neighbours. Images further away load lazily — no point downloading image 5 when the user is on image 1.

---

## ─────────────────────────────────────
## PHASE 4 — Stories Bar
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the stories bar — the row of circles at the top.

---

**Candidate:**

The stories bar is a horizontally scrollable row. The key visual detail is the ring around each avatar:

```
Unseen stories → gradient ring (purple to orange — Instagram's brand gradient)
All seen       → thin grey ring
Your own story → "+" icon instead of a ring (camera icon on mobile)
```

The gradient ring is a CSS trick. You can't do `border-color: gradient` in CSS — borders don't support gradients directly. The solution is using `background-clip`:

```css
.story-ring {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  padding: 2px; /* the visible ring width */
  background: linear-gradient(
    45deg,
    #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%
  );
}

.story-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;   /* white gap between ring and avatar */
  padding: 2px;
}

.story-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
```

The gradient is the background of the outer div, the white inner div creates the gap between the gradient and the avatar. No border needed.

For seen stories: swap the outer background to `#dbdbdb` (grey).

Ordering in the stories bar:
1. Your own story first (with + to add)
2. Unseen stories next (ordered by who posted most recently)
3. Seen stories last (greyed out)

```javascript
const sortedStories = useMemo(() => {
  const own     = storyUsers.filter(u => u.isCurrentUser);
  const unseen  = storyUsers.filter(u => !u.isCurrentUser && !u.hasSeen)
                            .sort((a, b) => b.latestStoryAt - a.latestStoryAt);
  const seen    = storyUsers.filter(u => !u.isCurrentUser && u.hasSeen);
  return [...own, ...unseen, ...seen];
}, [storyUsers]);
```

---

## ─────────────────────────────────────
## PHASE 5 — Stories Viewer (Setup)
## ─────────────────────────────────────

---

**Interviewer:**

User taps on Alice's story avatar. The stories viewer opens. Walk me through what happens.

---

**Candidate:**

The stories viewer is a full-screen overlay — it renders as a portal into `document.body` to escape any parent container constraints:

```javascript
function StoriesViewer({ storyUsers, initialUserIdx, onClose }) {
  const [activeUserIdx,  setActiveUserIdx]  = useState(initialUserIdx);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [isPaused,       setIsPaused]       = useState(false);

  const activeUser  = storyUsers[activeUserIdx];
  const activeStory = activeUser.stories[activeStoryIdx];

  return createPortal(
    <div className="stories-viewer-overlay">
      <ProgressBarsRow
        stories={activeUser.stories}
        activeIdx={activeStoryIdx}
        isPaused={isPaused}
        onStoryComplete={goToNextStory}
      />
      <StoryHeader user={activeUser} onClose={onClose} />
      <StoryMedia story={activeStory} isPaused={isPaused} />
      <TapZones onTapLeft={goToPrev} onTapRight={goToNext} />
      <HoldDetector
        onHoldStart={() => setIsPaused(true)}
        onHoldEnd={()   => setIsPaused(false)}
      />
    </div>,
    document.body
  );
}
```

When the viewer opens, the body scroll is locked (same as the Modal pattern):

```javascript
useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => { document.body.style.overflow = ""; };
}, []);
```

---

## ─────────────────────────────────────
## PHASE 6 — Stories Progress Bars
## ─────────────────────────────────────

---

**Interviewer:**

The progress bars at the top — walk me through how they work technically.

---

**Candidate:**

This is the most technically interesting part of the stories viewer. There are N bars — one per story for the current user. They render as:

```
Story 1   Story 2   Story 3   Story 4
[██████] [███░░░░] [       ] [       ]
complete  current   future    future
```

Each bar has three states:

```
complete  → width: 100%  (filled, static)
current   → width: 0% → 100%  (CSS animation running)
future    → width: 0%  (empty, static)
```

The current story's bar uses a CSS `@keyframes` animation:

```jsx
function ProgressBar({ state, duration, isPaused, onComplete }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{
          width: state === "complete" ? "100%" : undefined,
          animation: state === "current"
            ? `fillBar ${duration}ms linear forwards`
            : "none",
          animationPlayState: isPaused ? "paused" : "running"
        }}
        onAnimationEnd={state === "current" ? onComplete : undefined}
      />
    </div>
  );
}
```

```css
@keyframes fillBar {
  from { width: 0%; }
  to   { width: 100%; }
}
```

Key detail: `animation-play-state: paused` is what freezes the animation mid-fill when the user holds their finger down. The animation doesn't reset — it pauses at whatever percentage it was at. When the finger lifts, `animation-play-state: running` resumes from exactly that point.

The full progress bars row:

```jsx
function ProgressBarsRow({ stories, activeIdx, isPaused, onStoryComplete }) {
  return (
    <div className="progress-bars-row">
      {stories.map((story, i) => {
        const state =
          i < activeIdx  ? "complete"
          : i === activeIdx ? "current"
          : "future";

        return (
          <ProgressBar
            key={story.id}
            state={state}
            duration={story.duration}
            isPaused={isPaused}
            onComplete={i === activeIdx ? onStoryComplete : undefined}
          />
        );
      })}
    </div>
  );
}
```

The bars divide the full width equally — `flex: 1` on each bar track, with a small gap between them.

---

**Interviewer:**

The story is a video. The duration is unknown until the video loads. How does the progress bar handle that?

---

**Candidate:**

For image stories the duration is in the API response (default 5000ms). For video stories, the duration isn't known until the browser has loaded the video's metadata.

I listen to the video element's `loadedmetadata` event to get the actual duration:

```javascript
function StoryMedia({ story, isPaused, onDurationKnown }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (story.type !== "video") return;
    const video = videoRef.current;

    const handleMetadata = () => {
      const durationMs = Math.floor(video.duration * 1000);
      onDurationKnown(durationMs); // tell ProgressBarsRow the real duration
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    return () => video.removeEventListener("loadedmetadata", handleMetadata);
  }, [story.id]);

  if (story.type === "image") {
    return <img src={story.mediaUrl} className="story-media" alt="" />;
  }

  return (
    <video
      ref={videoRef}
      src={story.mediaUrl}
      autoPlay
      muted={false}      // video stories play with sound (user intent)
      playsInline
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
```

The progress bar's animation doesn't start until `onDurationKnown` fires. I keep a `duration` state in the Stories viewer that starts as the API-provided duration and gets overwritten by `loadedmetadata` for videos.

---

**Interviewer:**

The user is on story 2 of 4. They tap the right zone. What happens step by step?

---

**Candidate:**

```
Step 1 — Tap right zone fires goToNext()
           setActiveStoryIdx(prev => prev + 1)
           → activeStoryIdx becomes 3

Step 2 — React re-renders ProgressBarsRow
           Story 1: state = "complete"   (width: 100%, static)
           Story 2: state = "complete"   ← was "current", now complete
           Story 3: state = "current"    ← was "future", now animating
           Story 4: state = "future"

Step 3 — Story 3's bar component gets new props:
           state changed from "future" → "current"
           key is story.id — same story, same key
           BUT the animation style changed
           The CSS animation starts fresh from 0% → 100%

Step 4 — StoryMedia receives the new story object
           Image or video for story 3 renders
           If video: wait for loadedmetadata → onDurationKnown fires
```

One issue: when transitioning from "future" to "current", the `animation` style goes from `none` to `fillBar 5000ms linear forwards`. But the element already has `width: 0%` from its "future" state, so the animation starts correctly at 0%.

---

**Interviewer:**

The user taps right on the LAST story of ALL users. What happens?

---

**Candidate:**

```javascript
const goToNext = () => {
  const isLastStory  = activeStoryIdx === activeUser.stories.length - 1;
  const isLastUser   = activeUserIdx  === storyUsers.length - 1;

  if (!isLastStory) {
    // Go to next story for current user
    setActiveStoryIdx(i => i + 1);
  } else if (!isLastUser) {
    // Move to next user, reset to their first story
    setActiveUserIdx(i => i + 1);
    setActiveStoryIdx(0);
    markUserStoriesAsSeen(activeUser.userId); // mark current user's stories seen
  } else {
    // Last story of last user — close the viewer
    markUserStoriesAsSeen(activeUser.userId);
    onClose();
  }
};
```

Marking stories as seen:

```javascript
const markUserStoriesAsSeen = (userId) => {
  // Update local state immediately
  setStoryUsers(prev =>
    prev.map(u => u.userId === userId ? { ...u, hasSeen: true } : u)
  );
  // Fire-and-forget API call
  fetch(`/api/stories/${userId}/seen`, { method: "POST" });
};
```

The ring around that user's avatar in the stories bar changes from gradient to grey. No need to wait for the API — the optimistic update is fine here.

---

**Interviewer:**

The user presses and holds on the story. Walk me through the pause implementation.

---

**Candidate:**

Hold-to-pause needs to distinguish between a tap (short press) and a hold (long press). If I set `isPaused = true` on every `touchstart`, a simple tap would also pause briefly and feel laggy.

Solution: a delay. Only set `isPaused = true` if `touchstart` is held for more than 200ms without a `touchend`:

```javascript
function HoldDetector({ onHoldStart, onHoldEnd }) {
  const holdTimer = useRef(null);

  const handleTouchStart = () => {
    holdTimer.current = setTimeout(() => {
      onHoldStart(); // pause after 200ms of sustained press
    }, 200);
  };

  const handleTouchEnd = () => {
    clearTimeout(holdTimer.current); // cancel if lifted before 200ms
    onHoldEnd(); // resume (safe to call even if was never paused)
  };

  return (
    <div
      className="hold-overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ position: "absolute", inset: 0 }} // covers full story area
    />
  );
}
```

This overlay sits above the TapZones so it receives events first. But the tap zone's `onClick` still fires for short taps (since `touchend` fires before `click`).

When `isPaused = true`:
- Progress bar animation: `animation-play-state: paused` — freezes mid-fill
- Video: `videoRef.current.pause()`

When `isPaused = false`:
- Progress bar: `animation-play-state: running` — resumes
- Video: `videoRef.current.play()`

---

## ─────────────────────────────────────
## PHASE 7 — Double-Tap to Like
## ─────────────────────────────────────

---

**Interviewer:**

Double-tap to like. Walk me through the implementation — specifically the heart animation.

---

**Candidate:**

There are two parts: detecting the double-tap, and showing the heart at the correct position.

**Part 1 — Double-tap detection**

I use `useRef` for the last tap timestamp — not `useState`. Here's why: `useState` would trigger a re-render on every tap, which adds overhead and could interfere with the animation timing. A ref stores the value without causing re-renders:

```javascript
const lastTapTimeRef = useRef(0);
const lastTapPosRef  = useRef({ x: 0, y: 0 });

const handleTap = (e) => {
  const now = Date.now();
  const timeSinceLastTap = now - lastTapTimeRef.current;

  if (timeSinceLastTap < 300) {
    // Double tap!
    handleDoubleTap(lastTapPosRef.current.x, lastTapPosRef.current.y);
    lastTapTimeRef.current = 0; // reset so triple tap doesn't trigger again
  } else {
    // Single tap — record for potential double tap
    const rect = e.currentTarget.getBoundingClientRect();
    lastTapPosRef.current = {
      x: e.clientX - rect.left,  // position WITHIN the image element
      y: e.clientY - rect.top
    };
    lastTapTimeRef.current = now;
  }
};
```

I store the position from the **first tap** — that's where the heart should appear. The second tap could be at a slightly different position and using it would feel off.

**Part 2 — Position-based heart animation**

```javascript
const [hearts, setHearts] = useState([]);
// [{ id, x, y }] — can have multiple if user double-taps rapidly

const handleDoubleTap = (x, y) => {
  // Like the post if not already liked
  if (!isLiked) {
    setIsLiked(true);
    setLikeCount(c => c + 1);
    fetch(`/api/posts/${postId}/like`, { method: "POST" });
  }
  // Always show heart (even if already liked — user expects visual feedback)
  const heartId = Date.now();
  setHearts(prev => [...prev, { id: heartId, x, y }]);

  // Remove heart after animation completes (800ms)
  setTimeout(() => {
    setHearts(prev => prev.filter(h => h.id !== heartId));
  }, 800);
};
```

Rendering the hearts:

```jsx
<div
  className="post-media-wrapper"
  onTouchEnd={handleTap}
  style={{ position: "relative" }}
>
  <img src={post.media[0].url} alt="" />

  {hearts.map(heart => (
    <HeartBurst key={heart.id} x={heart.x} y={heart.y} />
  ))}
</div>
```

The `<HeartBurst>` component:

```jsx
function HeartBurst({ x, y }) {
  return (
    <div
      className="heart-burst"
      style={{
        position: "absolute",
        left: x - 40,   // centre the 80px heart on tap point
        top:  y - 40,
        width: 80,
        height: 80,
        pointerEvents: "none"  // don't block future taps
      }}
    >
      ❤️
    </div>
  );
}
```

```css
.heart-burst {
  font-size: 80px;
  animation: heartPop 0.8s ease-out forwards;
}

@keyframes heartPop {
  0%   { transform: scale(0)   rotate(-20deg); opacity: 1; }
  40%  { transform: scale(1.4) rotate(0deg);   opacity: 1; }
  70%  { transform: scale(1.1) rotate(0deg);   opacity: 1; }
  100% { transform: scale(1.0) rotate(0deg);   opacity: 0; }
}
```

The heart starts small at the tap position, bounces to 1.4× scale, settles at 1.1×, then fades out. This matches Instagram's actual animation.

---

**Interviewer:**

What if the user double-taps five times in quick succession? Five hearts?

---

**Candidate:**

Yes — and that's correct behaviour! Instagram shows multiple hearts if you double-tap repeatedly. Each heart appears at its tap position and animates independently. The `hearts` array holds all active hearts, each with a unique ID.

The like API only fires once though — on the first double-tap when `isLiked` transitions from false to true. Subsequent double-taps while already liked skip the API call but still show the heart.

```javascript
if (!isLiked) {
  setIsLiked(true);
  setLikeCount(c => c + 1);
  fetch(`/api/posts/${postId}/like`, { method: "POST" });
}
// Always show heart regardless
```

---

**Interviewer:**

What about the rollback? If the API fails?

---

**Candidate:**

```javascript
const handleDoubleTap = async (x, y) => {
  const wasLiked = isLiked;

  if (!wasLiked) {
    // Optimistic update
    setIsLiked(true);
    setLikeCount(c => c + 1);
  }

  // Show heart regardless
  showHeart(x, y);

  if (!wasLiked) {
    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch {
      // Rollback silently — don't show an error toast for a like failure
      setIsLiked(false);
      setLikeCount(c => c - 1);
    }
  }
};
```

I rollback silently — no error toast. A failed like is minor. Showing an error toast mid-story browsing would be intrusive and confusing.

---

## ─────────────────────────────────────
## PHASE 8 — Stories Preloading
## ─────────────────────────────────────

---

**Interviewer:**

The user is on story 2. Story 3 hasn't loaded yet. There's a pause while it buffers. How do you prevent that?

---

**Candidate:**

Preload the adjacent stories' media in the background while the current story plays.

```javascript
// Preload the next story's media as soon as the current one starts
useEffect(() => {
  const nextStory = activeUser.stories[activeStoryIdx + 1];
  if (!nextStory) return;

  if (nextStory.type === "image") {
    const img = new Image();
    img.src = nextStory.mediaUrl; // triggers download in background
  } else if (nextStory.type === "video") {
    // Create a hidden video element to trigger buffering
    const video = document.createElement("video");
    video.src = nextStory.mediaUrl;
    video.preload = "auto";
    video.muted = true;
    // Don't attach to DOM — just let browser buffer it
  }
}, [activeStoryIdx]);
```

Also preload the next user's first story:

```javascript
const nextUser = storyUsers[activeUserIdx + 1];
if (nextUser?.stories[0]) {
  const img = new Image();
  img.src = nextUser.stories[0].thumbnailUrl;
}
```

When the user advances to story 3, the browser already has it cached. The transition is instant.

---

## ─────────────────────────────────────
## PHASE 9 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

The feed has scrolled down a long way — 100+ posts. Performance?

---

**Candidate:**

100+ PostCards in the DOM is manageable on modern mobile devices, but 500+ would cause slow scroll and memory pressure.

**Virtual scroll for large feeds:**

Use `react-virtuoso` which handles variable-height items (posts can be different heights depending on image aspect ratio and caption length):

```javascript
import { Virtuoso } from "react-virtuoso";

<Virtuoso
  data={posts}
  itemContent={(index, post) => <PostCard post={post} />}
  endReached={loadMore}
  overscan={5}  // keep 5 extra items rendered above/below viewport
/>
```

**Image lazy loading:**

All post images use native `loading="lazy"`. Combined with virtual scroll, only visible + nearby images are in the DOM at all.

**Stories viewer performance:**

When the stories viewer is open, the feed behind it is still in the DOM and could potentially be animating or playing videos. I use `visibility: hidden` on the feed (not `display: none` — that would cause layout thrash on close) to prevent any background animations from running.

---

**Interviewer:**

What about `React.memo` on PostCard?

---

**Candidate:**

Yes — `PostCard` should be memoized. When the user loads more posts and `setPosts` fires, React re-renders the parent. Without `React.memo`, all existing PostCards re-render even though their data didn't change.

```javascript
const PostCard = React.memo(({ post }) => {
  // renders once per post unless post object changes
}, (prevProps, nextProps) => {
  // Custom comparison — only re-render if relevant fields changed
  return (
    prevProps.post.isLiked   === nextProps.post.isLiked &&
    prevProps.post.isSaved   === nextProps.post.isSaved &&
    prevProps.post.likeCount === nextProps.post.likeCount
  );
});
```

The custom comparison prevents re-renders when only a completely unrelated field changes. This is especially important because like/save state changes could otherwise cause all posts to re-render when only one post was affected.

---

## ─────────────────────────────────────
## PHASE 10 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

A story fails to load — the media URL returns a 404. What does the user see?

---

**Candidate:**

The story should auto-advance after a brief error display rather than blocking the viewer:

```javascript
function StoryMedia({ story, onError }) {
  const handleError = () => {
    // Show error state briefly, then advance
    setTimeout(() => onError(), 2000);
  };

  return story.type === "image"
    ? <img src={story.mediaUrl} onError={handleError} className="story-media" alt="" />
    : <video src={story.mediaUrl} onError={handleError} ... />;
}
```

During the 2-second error window, show a placeholder:

```
┌─────────────────────────────┐
│                             │
│   [grey background]         │
│   ⚠️  Story unavailable     │
│                             │
└─────────────────────────────┘
```

Progress bar still runs during the 2 seconds, then auto-advances.

---

**Interviewer:**

A story was posted 23 hours ago. It expires in 1 hour. How does the frontend handle expiry?

---

**Candidate:**

Stories have a 24-hour expiry. The API response includes `expiresAt` for each story. There are two places to handle this:

**On load**: the API should only return non-expired stories. The frontend trusts the server to filter correctly.

**During a long session** (user leaves browser open for hours): when the stories viewer opens for a user and the current story's `expiresAt` is in the past, skip it rather than showing it:

```javascript
const getActiveStories = (stories) => {
  const now = Date.now();
  return stories.filter(s => new Date(s.expiresAt).getTime() > now);
};
```

If `getActiveStories` returns an empty array for a user, they shouldn't appear in the stories bar anymore. I'd re-filter `storyUsers` and hide any users with no remaining stories.

---

## ─────────────────────────────────────
## PHASE 11 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

Three most important technical decisions. Go.

---

**Candidate:**

**1. `animation-play-state` for the stories progress bar pause.**
A CSS animation on the progress bar fill freezes at its current position when set to `paused` and resumes from that exact position when set to `running`. This is the cleanest and most performant way to implement hold-to-pause — no JavaScript timer management, no storing elapsed time.

**2. `useRef` for double-tap timing, not `useState`.**
The last tap timestamp needs to be read and written on every tap. Using `useState` would cause a re-render on every tap, adding overhead during rapid tapping. A `useRef` stores the mutable value without triggering renders — it's read inside the event handler which always has access to the latest ref value.

**3. Stories preloading while current story plays.**
Creating an off-screen `Image` or `video` element during the current story's playback triggers the browser to buffer the next media in advance. When the user advances, the content is already cached. This eliminates the buffering pause between stories that would otherwise be visible.

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

1. **Swipe down to close stories viewer** — track `touchmove` deltaY, apply a `transform: translateY(delta)` to give a rubber-band feel, and close when delta exceeds 80px. Snap back if under threshold.

2. **Stories reply input** — a `<input>` at the bottom of the stories viewer. Tapping it opens the keyboard (which shrinks the viewport on mobile — needs `visual viewport` API to handle).

3. **Explore grid** — three-column uniform grid with `display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px`. Featured posts could use `grid-column: span 2; grid-row: span 2` for the 2×2 spots.

4. **Like count animation** — when the count changes, animate the number sliding up (old number slides out, new slides in) — a small detail that makes the interaction feel more alive.

5. **Stories highlights on profile page** — saved stories shown as circles below the bio. Each highlight is a curated collection of past stories.

---

**Interviewer:**

Excellent. The stories implementation was particularly thorough.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked about video stories vs image stories upfront (duration problem)
✅  Asked about position-based heart animation (signalled awareness)
✅  Parallel fetch for feed + stories on mount
✅  Stories sorted: own first → unseen → seen
✅  Gradient ring via background-clip technique (not border)
✅  CSS animation-play-state for pause (not JS timer management)
✅  onAnimationEnd to advance to next story (CSS-driven)
✅  Video story: wait for loadedmetadata before starting progress bar
✅  goToNext handles: next story / next user / close (all three cases)
✅  Hold-to-pause with 200ms delay (distinguishes tap from hold)
✅  pointerEvents: none on heart (doesn't block future taps)
✅  useRef for double-tap timing (not useState)
✅  Position from FIRST tap, not second tap
✅  Heart rollback: silent (no toast — intrusive for a minor action)
✅  Stories preloading adjacent media with off-screen Image element
✅  Stories expiry filter client-side for long sessions
✅  React.memo with custom comparison on PostCard
```

---

## What Would Have Hurt the Score

```
❌  Not knowing animation-play-state (managing pause with JS timers instead)
❌  Using useState for double-tap timing (re-renders on every tap)
❌  Heart at centre of image, not at tap coordinates
❌  Stories progress bar as a JS setInterval (inaccurate, CPU-heavy)
❌  Not distinguishing tap vs hold (pausing on every tap)
❌  Not handling video story duration (assuming fixed 5s)
❌  goToNext with no boundary check (crashes on last story of last user)
❌  No stories preloading (visible buffering between stories)
❌  Gradient ring attempted with CSS border-color: gradient (doesn't work)
❌  No expiry handling for long sessions
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | CSS animation-play-state | "User holds finger. Walk through pause" |
| 2 | onAnimationEnd for auto-advance | "Walk through progress bar implementation" |
| 3 | Video story duration via loadedmetadata | "Story is a video. Duration unknown. How?" |
| 4 | goToNext boundary handling | "Last story of last user — what happens?" |
| 5 | Hold vs tap distinction (200ms) | "Hold to pause without pausing on tap" |
| 6 | Gradient ring via background-clip | "Walk through seen/unseen ring" |
| 7 | useRef for double-tap timing | "Walk through double-tap detection" |
| 8 | Position from first tap | "Where does the heart appear?" |
| 9 | Multiple simultaneous hearts | "User double-taps 5 times rapidly" |
| 10 | Silent rollback for like | "Like API fails — what happens?" |
| 11 | Off-screen Image preloading | "Story 3 hasn't loaded — prevent buffering" |
| 12 | Stories expiry in long session | "Story expires while viewer is open" |
