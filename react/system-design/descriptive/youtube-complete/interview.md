# YouTube UI Clone — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Will push on the engagement actions — like/dislike is more complex than it looks. Will also probe the comments section loading strategy and the sidebar scroll behaviour.

---

> **How to use this file:**
> The engagement actions discussion (Phase 4) is the most technically rich part of this interview. Like and dislike are mutually exclusive — three possible states, not two. That state machine is where most candidates stumble. The comments lazy loading (Phase 5) is the second most important area.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design the YouTube frontend. Go ahead.

---

**Candidate:**

YouTube is a large product — let me ask a few questions to scope what we're building before I design anything.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why scope YouTube specifically
> YouTube has more distinct page types than almost any other product: the homepage feed, the watch page, search results, channel pages, Shorts, YouTube Studio (for creators), and more. Each is a different design problem. An unfocused answer covering all of them superficially scores worse than going deep on the watch page. Scoping upfront is the move that separates prepared candidates.

---

**Q1. Which page or pages are we designing — homepage, watch page, search, channel page?**

> **Why ask this:**
> The watch page (video player + sidebar + comments) is the most technically interesting and the most commonly asked in interviews. It has a two-column layout challenge, engagement action state management, lazy-loaded comments, and an independent-scrolling sidebar — all distinct engineering problems.
>
> The homepage is interesting for its category chip filtering and infinite scroll video grid, but it's less distinctive — similar patterns appear in Netflix, Instagram, Twitter.
>
> Asking this lets the interviewer direct you to the highest-value area. Most will say "the watch page" or "both."

---

**Q2. Should the watch page include comments with nested replies?**

> **Why ask this:**
> Comments are a significant standalone system — lazy loading, pagination, nested replies, collapse/expand state, and their own like/reply actions. If in scope, they deserve their own phase of discussion.
>
> More importantly, comments are below the fold on the watch page. Asking this naturally leads into the lazy loading discussion — which is a strong signal to the interviewer that you think about performance proactively.

---

**Q3. Do we need the engagement actions — like, dislike, subscribe? And should they be optimistic?**

> **Why ask this:**
> This sounds simple but it's not. Like and dislike are mutually exclusive. Toggling like while disliked should remove the dislike. That's three states: liked, disliked, neither — not a simple boolean. An interviewee who misses this mutual exclusion usually discovers it when the interviewer asks "what happens if you press dislike when you're already liked?"
>
> Asking this upfront signals you already know it's non-trivial and are ready to discuss it.

---

**Q4. Is the video player in scope, or should I treat it as a black box?**

> **Why ask this:**
> The video player is its own deep problem — HTML5 video API, seek bar, buffering states, quality selection, keyboard shortcuts, HLS streaming. It deserves a separate 45-minute discussion.
>
> Asking this prevents spending the entire interview on the player and missing the more YouTube-specific parts (engagement, comments, layout). Most interviewers will say "treat it as a component you already have."

---

**Q5. Should the homepage include the category chips (All, Music, Gaming, Live...)?**

> **Why ask this:**
> Category chips change the video feed — clicking "Gaming" refetches with a category filter. This affects the data model (categories come from the API) and the state management (active category drives the feed API call).
>
> A simple yes/no answer here helps scope whether the homepage is a static grid or a filtered, stateful feed.

---

**Interviewer:**

Good questions. Here's the scope:

- Design both the watch page and the homepage.
- Yes, comments with one level of nested replies.
- Yes, like, dislike, subscribe — all optimistic.
- Treat the video player as a black box component.
- Yes, category chips on the homepage.
- Tens of millions of daily users.

---

**Candidate:**

Perfect. Two pages to design. Let me start with the watch page since that's the more technically complex one, then cover the homepage.

---

## ─────────────────────────────────────
## PHASE 2 — Watch Page Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the watch page architecture.

---

**Candidate:**

The watch page has three major sections side by side on desktop:

```
┌─────────────────────────────────────┬─────────────────────┐
│          LEFT COLUMN  (~70%)        │  RIGHT COLUMN (~30%) │
│                                     │                      │
│  <VideoPlayer>                      │  <Recommendations    │
│                                     │   Sidebar>           │
│  <VideoMetadata>                    │  (independent        │
│    title, stats, engagement row     │   scroll)            │
│    channel info + subscribe         │                      │
│                                     │                      │
│  <DescriptionBox>                   │                      │
│                                     │                      │
│  <CommentsSection>                  │                      │
│  (lazy loaded on scroll)            │                      │
└─────────────────────────────────────┴─────────────────────┘
```

CSS layout:

```css
.watch-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 402px;
  gap: 24px;
}

@media (max-width: 1015px) {
  .watch-layout {
    grid-template-columns: 1fr;
    /* sidebar moves below the main content on tablet/mobile */
  }
}
```

`minmax(0, 1fr)` is important. Without the `0`, the video player can overflow its column because `<video>` elements try to maintain their intrinsic width. The `minmax(0, 1fr)` constrains the column to its grid cell.

**Data fetching on mount — parallel:**

```javascript
function WatchPage({ videoId }) {
  const [video, setVideo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire BOTH requests simultaneously — don't wait for one before the other
    Promise.all([
      fetch(`/api/videos/${videoId}`).then(r => r.json()),
      fetch(`/api/recommendations?v=${videoId}`).then(r => r.json())
    ]).then(([videoData, recsData]) => {
      setVideo(videoData);
      setRecommendations(recsData.items);
      setLoading(false);
    });
  }, [videoId]);
}
```

Parallel fetching matters here. Video metadata and recommendations are independent — there's no reason to wait for one before fetching the other. Sequential fetching would add unnecessary latency.

---

**Interviewer:**

Why not fetch comments at the same time?

---

**Candidate:**

Comments are below the fold. The user has to scroll down to see them. Fetching them immediately on page load is wasteful — the user might watch the whole video and never scroll to comments.

Instead, I use an IntersectionObserver on the comments container:

```javascript
function CommentsSection({ videoId }) {
  const [comments, setComments] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetch(`/api/comments?v=${videoId}&sort=top&limit=20`)
            .then(r => r.json())
            .then(data => setComments(data));
          observer.disconnect(); // load once
        }
      },
      { rootMargin: "100px 0px" } // pre-fetch 100px before visible
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [videoId]);

  return (
    <div ref={containerRef}>
      {comments === null
        ? <CommentsPlaceholder />
        : <CommentsList comments={comments} videoId={videoId} />
      }
    </div>
  );
}
```

This is the same pattern as Netflix's row lazy loading — defer the fetch until the content is actually needed.

---

## ─────────────────────────────────────
## PHASE 3 — Sidebar Scroll
## ─────────────────────────────────────

---

**Interviewer:**

The recommendations sidebar has infinite scroll. The user scrolls to the bottom of the sidebar to load more. How does that work given the sidebar and the main content share the same page?

---

**Candidate:**

This is the key distinction — the sidebar needs to scroll **independently** from the main page. If both scrolled together (the default), the sidebar content would disappear as the user scrolls down to comments.

On desktop, the sidebar is `position: sticky` — it sticks to the top of the viewport as the user scrolls the main content. But its *own* content overflows and becomes independently scrollable:

```css
.recommendations-sidebar {
  position: sticky;
  top: 60px;                     /* stick below the navbar */
  height: calc(100vh - 60px);    /* full viewport height minus navbar */
  overflow-y: auto;              /* sidebar has its own scroll */
}
```

Now the sidebar:
- Sticks in place as the user scrolls the left column
- Has its own independent scroll inside its height
- The user can scroll the sidebar separately from the page

Infinite scroll inside the sidebar uses the same IntersectionObserver pattern, but scoped to the sidebar's scroll container:

```javascript
function RecommendationsSidebar({ videoId }) {
  const sidebarRef = useRef(null);
  const sentinelRef = useRef(null);
  const [recommendations, setRecommendations] = useState([]);
  const [continuationToken, setContinuationToken] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: sidebarRef.current } // ← scoped to the sidebar, not the page
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [continuationToken]);

  return (
    <div ref={sidebarRef} className="recommendations-sidebar">
      {recommendations.map(rec => (
        <RecommendationCard key={rec.id} video={rec} />
      ))}
      <div ref={sentinelRef} />  {/* invisible trigger at bottom of list */}
    </div>
  );
}
```

The `root: sidebarRef.current` option tells the IntersectionObserver to watch for the sentinel entering the *sidebar's* visible area — not the page's visible area. Without this, the sentinel would trigger as soon as the sidebar itself entered the page viewport, not when the user scrolled to the bottom of the sidebar content.

---

**Interviewer:**

YouTube doesn't use page numbers for pagination — they use continuation tokens. What are those and why?

---

**Candidate:**

A continuation token is an opaque string returned by the server that encodes "where you are" in the result set. Instead of `?page=2`, you send `?continuation=eyJhbGciOiJIUzI1NiJ9...`.

```
Request 1:
  GET /api/recommendations?v=videoId&limit=20
  Response: { items: [...20 items], continuation: "eyJhbGciO..." }

Request 2:
  GET /api/recommendations?v=videoId&limit=20&continuation=eyJhbGciO...
  Response: { items: [...20 more items], continuation: "eyJxbGciP..." }

Request 3:
  GET /api/recommendations?continuation=eyJxbGciP...
  Response: { items: [...20 more items], continuation: null }  ← end of list
```

Why tokens instead of page numbers?

```
Problem with page numbers:
  Page 1: items 1–20
  User is on page 2 and watching item 21–40.
  Meanwhile, a NEW video is added to the feed.
  The entire feed shifts by 1 position.
  Page 2 now contains items 22–41 — item 21 was "skipped"
  and item 41 was shown twice (once at end of page 1, once here).
  User sees duplicate or missing content. ❌

Continuation token:
  Token encodes a cursor position in the underlying data,
  not an offset. Adding new items doesn't shift the cursor.
  User always gets the next 20 items from exactly where they left off. ✅
```

This is the same reason chat apps use cursor-based pagination — YouTube's feed has the same problem.

---

## ─────────────────────────────────────
## PHASE 4 — Engagement Actions
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the like and dislike buttons. Seem simple — are they?

---

**Candidate:**

Not at all. Like and dislike are mutually exclusive — pressing one removes the other. That gives us three states, not two:

```
State diagram:

         ┌─────────────────────────────────────────────┐
         │                                             │
    press 👍                                      press 👎
         │                                             │
         ▼                                             ▼
   ┌──────────┐     press 👎     ┌──────────────┐
   │  LIKED   │ ──────────────▶ │  DISLIKED    │
   │  👍 ✓   │                 │  👎 ✓        │
   │  👎      │ ◀────────────── │  👍           │
   └────┬─────┘     press 👍    └──────┬───────┘
        │                              │
   press 👍                       press 👎
   (toggle off)               (toggle off)
        │                              │
        └──────────┐  ┌───────────────┘
                   ▼  ▼
              ┌──────────┐
              │  NEITHER │
              │  👍      │
              │  👎      │
              └──────────┘
```

State representation:

```javascript
// NOT two booleans — that allows both true simultaneously (impossible state)
// ❌ const [isLiked, setIsLiked] = useState(false);
// ❌ const [isDisliked, setIsDisliked] = useState(false);

// ✅ One enum — only three valid states
const [engagement, setEngagement] = useState("none");
// "none" | "liked" | "disliked"

const [likeCount, setLikeCount] = useState(video.likeCount);
```

The handler:

```javascript
const handleLike = async () => {
  const prevEngagement = engagement;
  const prevLikeCount  = likeCount;

  // Optimistic update
  if (engagement === "liked") {
    // Toggle off — remove like
    setEngagement("none");
    setLikeCount(c => c - 1);
  } else {
    // Add like (removing dislike if it was set)
    const wasDisliked = engagement === "disliked";
    setEngagement("liked");
    setLikeCount(c => c + 1);
    // No dislike count to update publicly (YouTube removed it)
  }

  try {
    await fetch(`/api/videos/${videoId}/like`, {
      method: engagement === "liked" ? "DELETE" : "POST"
    });
  } catch {
    // Rollback everything
    setEngagement(prevEngagement);
    setLikeCount(prevLikeCount);
    showToast("Couldn't save your reaction. Try again.");
  }
};

const handleDislike = async () => {
  const prevEngagement = engagement;

  if (engagement === "disliked") {
    setEngagement("none");
  } else {
    setEngagement("disliked");
    if (engagement === "liked") setLikeCount(c => c - 1); // liked → disliked removes the like
  }

  try {
    await fetch(`/api/videos/${videoId}/dislike`, {
      method: engagement === "disliked" ? "DELETE" : "POST"
    });
  } catch {
    setEngagement(prevEngagement);
    // ... rollback like count if needed
  }
};
```

---

**Interviewer:**

YouTube removed the public dislike count in November 2021. Why might they have done that, and how does it change the UI?

---

**Candidate:**

This is a product decision worth knowing. YouTube's stated reason: coordinated "dislike campaigns" where groups of users mass-disliked videos — often targeting small creators or social justice content. The visible dislike count was being weaponised, discouraging creators and misleading viewers about content quality.

**What changed in the UI:**

```
Before (public dislike count):
  👍 45,234   👎 1,892
  Both numbers visible to everyone.

After (private dislike count):
  👍 45,234   👎
  Only the like count is shown publicly.
  The video creator can still see their dislike count in YouTube Studio.
  The viewer sees the 👎 button but no count next to it.
```

**Implementation change:**

```javascript
// API response still includes dislikeCount for the creator
// But the client only renders it if the viewer IS the channel owner
const isChannelOwner = video.channelId === currentUser.channelId;

<div className="engagement-row">
  <LikeButton count={video.likeCount} isLiked={engagement === "liked"} />
  <DislikeButton
    count={isChannelOwner ? video.dislikeCount : null}  // null = don't show
    isDisliked={engagement === "disliked"}
  />
</div>
```

Knowing this detail — and why it happened — signals genuine product awareness, not just technical knowledge.

---

**Interviewer:**

The subscribe button. Walk me through that flow.

---

**Candidate:**

The subscribe button has three visual states and one secondary action (the notification bell):

```
State 1 — NOT subscribed:
  [Subscribe]   ← outlined button, channel colour

State 2 — SUBSCRIBED (just clicked):
  [Subscribed ▾]  ← filled, dropdown arrow
  Bell icon appears: 🔔 All notifications

State 3 — Notification options (dropdown open):
  ┌─────────────────────────┐
  │  🔔 All                 │ ← all videos
  │  🔔 Personalised        │ ← recommended by YouTube
  │  🔕 None                │ ← no notifications
  └─────────────────────────┘
```

Implementation:

```javascript
const [isSubscribed, setIsSubscribed] = useState(video.isSubscribed);
const [notifPref, setNotifPref] = useState("all"); // "all"|"personalised"|"none"
const [showNotifDropdown, setShowNotifDropdown] = useState(false);

const handleSubscribe = async () => {
  const wasSubscribed = isSubscribed;

  // Optimistic
  setIsSubscribed(!isSubscribed);
  if (!isSubscribed) {
    setSubscriberCount(c => c + 1);
    setShowNotifDropdown(true); // show bell options on subscribe
  } else {
    setSubscriberCount(c => c - 1);
  }

  try {
    await fetch(`/api/channels/${channelId}/subscribe`, {
      method: wasSubscribed ? "DELETE" : "POST"
    });
  } catch {
    setIsSubscribed(wasSubscribed);
    setSubscriberCount(c => wasSubscribed ? c + 1 : c - 1);
  }
};
```

The subscriber count update is optimistic too — it adjusts immediately. On YouTube you see the count change the moment you subscribe, before any network round trip.

---

**Interviewer:**

What if the subscriber count is displayed as "2.1M subscribers" and the user subscribes — does it become "2,100,001 subscribers"?

---

**Candidate:**

No — that would look wrong. The counter stays formatted at the rounded level:

```javascript
const formatSubscriberCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

// 2,100,000 → "2.1M"
// After +1 subscribe → 2,100,001 → still "2.1M"
// The formatting rounds, so the displayed count doesn't change
// Only changes when it crosses a formatting boundary (e.g. 1,999,999 → 2M)
```

This is intentional — YouTube doesn't show exact subscriber counts publicly (only in YouTube Studio for the channel owner). The rounded format naturally absorbs small changes.

---

## ─────────────────────────────────────
## PHASE 5 — Comments Section
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the comments section in detail.

---

**Candidate:**

Comments have four interesting challenges: lazy loading, pagination, nested replies, and the "pinned comment" pattern.

**Pagination with continuation tokens:**

```javascript
function CommentsList({ videoId }) {
  const [comments, setComments] = useState([]);
  const [continuation, setContinuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const url = continuation
      ? `/api/comments?continuation=${continuation}`
      : `/api/comments?v=${videoId}&sort=top&limit=20`;

    const data = await fetch(url).then(r => r.json());

    setComments(prev => [...prev, ...data.comments]);
    setContinuation(data.nextContinuation);
    setHasMore(data.nextContinuation !== null);
    setLoading(false);
  };

  // Initial load
  useEffect(() => { loadMore(); }, []);

  return (
    <div>
      {comments.map(c => <Comment key={c.id} comment={c} videoId={videoId} />)}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? "Loading..." : "Show more comments"}
        </button>
      )}
    </div>
  );
}
```

**Nested replies — collapsed by default:**

```javascript
function Comment({ comment, videoId }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const loadReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    const data = await fetch(`/api/comments/${comment.id}/replies?limit=5`).then(r => r.json());
    setReplies(data.replies);
    setShowReplies(true);
    setLoadingReplies(false);
  };

  return (
    <div className="comment">
      <Avatar src={comment.authorAvatar} />
      <div>
        <strong>{comment.authorName}</strong>
        <span>{formatTimeAgo(comment.publishedAt)}</span>
        <p>{comment.text}</p>
        <CommentActions comment={comment} />

        {comment.replyCount > 0 && !showReplies && (
          <button onClick={loadReplies}>
            {loadingReplies ? "Loading..." : `▸ ${comment.replyCount} replies`}
          </button>
        )}

        {showReplies && replies.map(reply => (
          <Reply key={reply.id} reply={reply} />
        ))}

        {showReplies && (
          <button onClick={() => setShowReplies(false)}>▴ Hide replies</button>
        )}
      </div>
    </div>
  );
}
```

**Pinned comment — channel owner priority:**

The first comment in the response is always the pinned comment (if one exists). It gets a visual indicator:

```jsx
{comment.isPinned && (
  <span className="pinned-badge">📌 Pinned by {comment.channelName}</span>
)}
```

---

**Interviewer:**

A video has 10 million comments. Rendering even 100 at once is fine, but if the user keeps hitting "show more" they'll accumulate thousands of comment nodes. What happens?

---

**Candidate:**

The DOM grows unbounded. With thousands of comments, each containing nested replies, the page becomes slow to scroll and interact with.

Two approaches:

**Option 1 — Windowed list (virtual scroll)**

Use `react-window` or `react-virtuoso` to render only visible comments. Since comments have variable heights (short vs long), `react-virtuoso` is better — it handles dynamic heights automatically:

```javascript
import { Virtuoso } from "react-virtuoso";

<Virtuoso
  data={comments}
  itemContent={(index, comment) => <Comment comment={comment} />}
  endReached={loadMore}  // triggers pagination when last item visible
/>
```

**Option 2 — Pagination with unload**

Keep only N comments in state. When loading the next page, remove the first page. Add a "Load previous" option at the top. This is what Reddit does — you can go back, but not infinitely forward in memory.

For YouTube's actual use case, virtual scrolling is the right answer — users expect to keep scrolling without loss of prior context.

---

## ─────────────────────────────────────
## PHASE 6 — Homepage
## ─────────────────────────────────────

---

**Interviewer:**

Let's cover the homepage. Walk me through it.

---

**Candidate:**

The homepage has two main interactive elements: the category chips and the video grid.

```
┌─────────────────────────────────────────────────────────────┐
│  [All] [Music] [Gaming] [Live] [Comedy] [News] [Tech] [→]  │
│   ↑ active chip                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │ 🎬   │ │ 🎬   │ │ 🎬   │ │ 🎬   │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│  Title    Title    Title    Title                           │
│  Channel  Channel  Channel  Channel                        │
│  1.2M ·   980K ·   450K ·   2.4M ·                        │
│  2d ago   5d ago   1w ago   3h ago                         │
│  ...infinite scroll...                                     │
└─────────────────────────────────────────────────────────────┘
```

**Category chips state:**

```javascript
const [activeCategory, setActiveCategory] = useState("all");
const [categories, setCategories] = useState([]);
const [videos, setVideos] = useState([]);
const [continuation, setContinuation] = useState(null);

// Fetch categories on mount
useEffect(() => {
  fetch("/api/categories").then(r => r.json()).then(data => setCategories(data));
}, []);

// Refetch videos when active category changes
useEffect(() => {
  setVideos([]);           // clear existing results
  setContinuation(null);   // reset pagination
  fetch(`/api/videos?category=${activeCategory}&limit=24`)
    .then(r => r.json())
    .then(data => {
      setVideos(data.videos);
      setContinuation(data.continuation);
    });
}, [activeCategory]);
```

The chip row itself is horizontally scrollable on mobile, with arrow buttons on desktop — the same scroll pattern as Netflix's content rows.

**Video grid:**

```javascript
function VideoCard({ video }) {
  return (
    <div className="video-card" onClick={() => navigate(`/watch?v=${video.id}`)}>
      <div className="thumbnail-wrapper">
        <img
          src={video.thumbnailUrl}
          loading="lazy"
          alt={video.title}
        />
        <span className="duration">{formatDuration(video.duration)}</span>
      </div>
      <div className="video-info">
        <img src={video.channelAvatar} className="channel-avatar" />
        <div>
          <p className="title">{video.title}</p>
          <p className="channel">{video.channelName}</p>
          <p className="meta">
            {formatViewCount(video.viewCount)} · {formatTimeAgo(video.publishedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Thumbnail hover preview:**

When hovering over a video card, YouTube shows an animated preview (a short clip from the video). This is simpler than Netflix's trailer — it's a silent GIF or a 3-second muted video clip:

```javascript
const [isHovered, setIsHovered] = useState(false);
const hoverTimer = useRef(null);

const onMouseEnter = () => {
  hoverTimer.current = setTimeout(() => setIsHovered(true), 800);
};
const onMouseLeave = () => {
  clearTimeout(hoverTimer.current);
  setIsHovered(false);
};

{isHovered && video.previewUrl && (
  <video
    src={video.previewUrl}
    muted autoPlay loop
    className="thumbnail-preview"
    style={{ position: "absolute", inset: 0, objectFit: "cover" }}
  />
)}
```

Same intent delay pattern as Netflix — 800ms instead of 500ms, since thumbnails are smaller and false triggers are even more common on a grid.

---

**Interviewer:**

The category chip is "Gaming." The user switches to "Music." What happens to the videos that were loading?

---

**Candidate:**

Without handling, you get a race condition. The Gaming request is still in flight. The Music request fires. If Gaming responds after Music, it overwrites the Music results. The user selected Music but sees Gaming videos.

Same pattern as the typeahead race condition. Fix with AbortController:

```javascript
const abortControllerRef = useRef(null);

useEffect(() => {
  // Cancel the previous fetch
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();

  setVideos([]);
  setContinuation(null);

  fetch(`/api/videos?category=${activeCategory}&limit=24`, {
    signal: abortControllerRef.current.signal
  })
    .then(r => r.json())
    .then(data => {
      setVideos(data.videos);
      setContinuation(data.continuation);
    })
    .catch(err => {
      if (err.name === "AbortError") return; // expected, not a real error
    });

  return () => abortControllerRef.current?.abort(); // cleanup on unmount
}, [activeCategory]);
```

Now: Gaming request is cancelled the moment the user switches to Music. Only the Music response updates state.

---

## ─────────────────────────────────────
## PHASE 7 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

The homepage video grid has 24+ video thumbnails. How do you optimise image loading?

---

**Candidate:**

Three techniques together:

**1. Native lazy loading**

```html
<img src="thumbnail.jpg" loading="lazy" alt="Video title" />
```

Thumbnails only download when they're near the viewport. Videos below the fold don't waste bandwidth.

**2. Low Quality Image Placeholder (LQIP)**

YouTube loads a tiny blurred placeholder first, then swaps to full resolution:

```javascript
function LazyThumbnail({ src, alt }) {
  const [loaded, setLoaded] = useState(false);

  // Low-quality version is small and fast
  // YouTube's thumbnail API supports size params: /vi/{id}/default.jpg (120×90)
  //                                               /vi/{id}/maxresdefault.jpg (1280×720)
  const lqipSrc = src.replace("maxresdefault", "default");

  return (
    <div className="thumbnail-wrapper">
      <img
        src={lqipSrc}                     // tiny, loads instantly
        className={`lqip ${loaded ? "hidden" : ""}`}
        alt=""
        aria-hidden="true"
      />
      <img
        src={src}                         // full quality
        loading="lazy"
        className={`full ${loaded ? "visible" : "invisible"}`}
        onLoad={() => setLoaded(true)}    // swap once loaded
        alt={alt}
      />
    </div>
  );
}
```

```css
.lqip   { filter: blur(8px); position: absolute; inset: 0; }
.full   { transition: opacity 0.3s; }
.invisible { opacity: 0; }
.visible   { opacity: 1; }
```

The user sees an instant blurred placeholder, then a smooth fade-in to the full image. No blank space, no jarring pop.

**3. Correct srcset per viewport**

```html
<img
  srcset="thumbnail_120.jpg 120w, thumbnail_320.jpg 320w, thumbnail_480.jpg 480w"
  sizes="(max-width: 600px) 160px, (max-width: 1024px) 280px, 360px"
  loading="lazy"
  alt="Video title"
/>
```

Mobile gets the 120w version — 3–5× smaller file than desktop would need.

---

## ─────────────────────────────────────
## PHASE 8 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

Video has 0 views and was posted 30 seconds ago. What does the metadata look like?

---

**Candidate:**

The formatting functions need to handle zero and very recent times:

```javascript
formatViewCount(0) → "0 views"   // not "0.0K views" — looks wrong
formatTimeAgo(30 seconds ago) → "just now"

// In formatViewCount:
if (n === 0) return "No views";   // or "0 views" — depends on product choice
// YouTube actually shows "No views" for brand new videos

// In formatTimeAgo (already handled):
if (seconds < 60) return "just now";
```

---

**Interviewer:**

A video title is 200 characters long. What happens in the VideoCard?

---

**Candidate:**

CSS truncation to two lines with an ellipsis:

```css
.video-card .title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* Shows max 2 lines, "..." at the end of the second line */
}
```

Full title shown in `title` attribute (HTML tooltip on hover):

```jsx
<p className="title" title={video.title}>{video.title}</p>
```

---

**Interviewer:**

A video has been deleted by the user. It appears in the sidebar recommendations. What shows?

---

**Candidate:**

The server should filter deleted videos from the recommendations API response. But the frontend should be defensive:

```javascript
// If a recommendation card has no thumbnail or title, show a placeholder
function RecommendationCard({ video }) {
  if (!video || video.isDeleted) {
    return (
      <div className="recommendation-card deleted">
        <div className="thumbnail-placeholder" />
        <p className="unavailable">This video is unavailable</p>
      </div>
    );
  }
  // ... normal render
}
```

YouTube shows "This video is unavailable" with a grey thumbnail — never a blank space or a broken card.

---

## ─────────────────────────────────────
## PHASE 9 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

Summarise the three most technically interesting decisions.

---

**Candidate:**

**1. Like/dislike as a single enum, not two booleans.**
`"none" | "liked" | "disliked"` eliminates the impossible state of both being true simultaneously. The state transitions are explicit — pressing like while disliked automatically transitions to liked, no separate logic needed to clear the dislike.

**2. Comments lazy loading with IntersectionObserver.**
Comments only fetch when the user scrolls to them — not on page mount. This reduces the initial page load's API calls from 3 to 2 (video metadata + recommendations), which is visible latency. With `rootMargin: "100px"`, the data is ready before the section scrolls fully into view.

**3. AbortController on category chip change.**
Switching between chips rapidly would otherwise cause a race condition where an earlier, slower response overwrites a later, faster one. AbortController cancels the previous in-flight request before starting the new one — the same pattern as typeahead search.

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

1. **Autoplay next video** — when the current video ends, a countdown (5 seconds) appears and the top recommendation starts playing automatically. Can be disabled in settings. Fires `NEXT_VIDEO_STARTING` analytics event.

2. **Chapters in the progress bar** — many videos have chapters (timestamps in the description). Parse them and draw chapter markers on the seek bar. Clicking a chapter shows its title in a tooltip.

3. **Theatre mode and fullscreen** — theatre mode expands the player to full width while keeping the sidebar visible. Fullscreen goes completely immersive. Both toggle layout classes on the root element.

4. **Video queue (Watch Later playlist)** — a temporary queue the user builds by clicking "Add to queue." Shows as a persistent panel.

5. **Keyboard shortcuts** — K for play/pause, J/L for seek ±10 seconds, M for mute, F for fullscreen. Standard YouTube shortcuts. Implement with `document.addEventListener("keydown")` scoped to the watch page.

---

**Interviewer:**

Excellent — very comprehensive.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked about comments and player scope upfront
✅  Parallel fetch for video metadata + recommendations (not sequential)
✅  Deferred comments fetch with IntersectionObserver
✅  Sidebar sticky + independent overflow-y scroll (not page scroll)
✅  IntersectionObserver with root: sidebarRef (scoped to sidebar)
✅  Continuation tokens explained — why not page numbers
✅  Like/dislike as enum not two booleans — mutual exclusion handled
✅  YouTube removed public dislike count — product reasoning explained
✅  Subscribe with notification bell secondary action
✅  Subscriber count stays formatted (2.1M doesn't become 2,100,001)
✅  Comments: continuation tokens, nested replies lazy loaded per comment
✅  Virtual scroll for large comment threads
✅  AbortController on category chip switch
✅  LQIP + srcset + native lazy loading for thumbnails
✅  Hover preview with same intent delay pattern as Netflix
```

---

## What Would Have Hurt the Score

```
❌  Sequential fetch: video metadata → wait → recommendations
❌  Loading comments on page mount (before user scrolls)
❌  Like/dislike as two separate booleans (allows impossible state)
❌  Forgetting mutual exclusion: pressing dislike while liked
❌  Not knowing YouTube removed public dislike counts
❌  Sidebar scroll implemented as page scroll (sidebar moves off screen)
❌  IntersectionObserver not scoped to sidebar container
❌  Subscriber count showing exact number after subscribe
❌  No AbortController on category chip switch (race condition)
❌  No LQIP — blank thumbnails before full image loads
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Parallel fetch on mount | "Why not fetch comments at the same time?" |
| 2 | Comments IntersectionObserver | "Walk me through the watch page architecture" |
| 3 | Sidebar sticky + independent scroll | "How does sidebar scroll independently?" |
| 4 | IntersectionObserver root option | "Sidebar has its own scroll — how does trigger work?" |
| 5 | Continuation tokens | "Why not page numbers?" |
| 6 | Like/dislike as enum | "Walk me through like and dislike" |
| 7 | Mutual exclusion state transitions | "What if you press dislike while liked?" |
| 8 | YouTube's dislike count removal | "Why might YouTube have removed it?" |
| 9 | Subscribe notification bell | "Walk me through the subscribe flow" |
| 10 | Subscriber count formatting | "Does it become 2,100,001 after subscribing?" |
| 11 | AbortController on chip switch | "User switches Gaming → Music fast. What happens?" |
| 12 | LQIP thumbnail loading | "24 thumbnails on homepage. Performance?" |
