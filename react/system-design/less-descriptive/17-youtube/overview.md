# YouTube UI Clone - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React  

---

## Problem Statement

Design the YouTube frontend:
- Homepage with video feed (recommendations)
- Video player page (player + sidebar recommendations)
- Comments section (with nested replies)
- Search with results and filters
- Channel page (videos, playlists, about)
- Like/dislike, subscribe, save to playlist
- Notifications bell

---

## Real-World Examples

- YouTube.com
- Vimeo
- Dailymotion
- Twitch (live variant)

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Video player integration | Core feature |
| Recommendation sidebar | Infinite list alongside player |
| Comments with pagination | Large data, nested replies |
| Like/subscribe optimistic update | Immediate feedback pattern |
| Search with filters | Debounce + filter UI |
| Layout complexity | Player + sidebar + comments |

---

## What You'll Learn

- Two-column layout: player + sidebar
- Video metadata display pattern
- Comment system architecture (see nested-comments question)
- Subscribe/like optimistic updates with rollback
- Time-based formatting (2 days ago, 1.2M views)
- Channel page structure
- Keyboard shortcuts for video player

---

## High-Level Architecture

```
<YouTubeApp />
│
├── <HomePage />
│   ├── <Navbar />          (search bar, upload, notifications, avatar)
│   ├── <CategoryPills />   (All, Music, Gaming, News...)
│   └── <VideoGrid />
│       └── <VideoCard /> × N
│
└── <WatchPage videoId={id} />
    ├── <Navbar />
    ├── <PlayerSection />   (left, ~70% width)
    │   ├── <VideoPlayer />
    │   ├── <VideoMetadata />
    │   │   ├── Title, views, date
    │   │   ├── Like/Dislike buttons
    │   │   └── Subscribe button
    │   └── <CommentsSection />
    │       ├── <CommentInput />
    │       └── <CommentList />
    │           └── <Comment /> → replies (collapsed)
    └── <RecommendationsSidebar />  (right, ~30% width)
        └── <VideoCard /> × N (vertical layout)
```

---

## Data Structure

```javascript
// Video shape
{
  id: "dQw4w9WgXcQ",
  title: "React Tutorial 2024",
  channelId: "ch_abc",
  channelName: "Fireship",
  channelAvatar: "https://...",
  thumbnail: "https://...",
  duration: "12:34",
  viewCount: 1200000,
  likeCount: 45000,
  publishedAt: "2024-01-15T10:00:00Z",
  description: "...",
  tags: ["react", "javascript"],
  isLiked: false,       // user-specific
  isDisliked: false,
  isSubscribed: false
}

// State on watch page
const [video, setVideo] = useState(null);
const [recommendations, setRecommendations] = useState([]);
const [isLiked, setIsLiked] = useState(false);
const [isSubscribed, setIsSubscribed] = useState(false);
const [subscriberCount, setSubscriberCount] = useState(0);
```

---

## Data Flow

```
User navigates to /watch?v=videoId:
  → fetch video metadata
  → fetch recommendations
  → initialize video player
  → fetch first page of comments (lazy, below fold)

User clicks Like:
  → optimistic: toggle isLiked, increment likeCount
  → POST /api/videos/:id/like
  → on error: revert both states

User clicks Subscribe:
  → optimistic: toggle isSubscribed, update subscriberCount
  → POST /api/channels/:id/subscribe
  → bell icon for notifications appears

User changes category pill on homepage:
  → fetch /api/videos?category=gaming
  → replace video grid

User types in search:
  → debounce 300ms
  → navigate to /search?q=query
  → fetch search results with filter options
```

---

## Key Concepts to Learn

### 1. Format View Count & Time
```javascript
const formatViews = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
};

const timeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days >= 365) return `${Math.floor(days / 365)} years ago`;
  if (days >= 30) return `${Math.floor(days / 30)} months ago`;
  if (days >= 1) return `${days} days ago`;
  return "Today";
};
```

### 2. Optimistic Like/Subscribe
```javascript
const handleLike = async () => {
  const prevLiked = isLiked;
  const prevCount = likeCount;

  // Optimistic update
  setIsLiked(!isLiked);
  setLikeCount(c => isLiked ? c - 1 : c + 1);

  try {
    await fetch(`/api/videos/${videoId}/like`, { method: "POST" });
  } catch {
    // Rollback
    setIsLiked(prevLiked);
    setLikeCount(prevCount);
  }
};
```

### 3. Category Pills Navigation
```jsx
{categories.map(cat => (
  <button
    key={cat}
    className={activeCategory === cat ? "active" : ""}
    onClick={() => setActiveCategory(cat)}
  >
    {cat}
  </button>
))}
```

### 4. Responsive Layout
```css
/* Watch page: player + sidebar side by side on desktop */
.watch-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 24px;
}
/* Stack on mobile */
@media (max-width: 1024px) {
  .watch-layout { grid-template-columns: 1fr; }
}
```

---

## Implementation Phases

### Phase 1 — Homepage
- Video grid layout
- VideoCard component
- Category pills with filtering

### Phase 2 — Watch Page Layout
- Two-column layout
- Video player component
- Video metadata + channel info

### Phase 3 — Interactions
- Like/dislike with optimistic update
- Subscribe button
- Save to playlist dropdown

### Phase 4 — Comments
- Comment list with pagination
- Add comment input
- Like/reply on comments
- Nested replies (collapsed by default)

### Phase 5 — Search
- Debounced search
- Search results page
- Filters (upload date, type, duration)

---

## Performance Considerations

- Lazy load comments (not on initial page load)
- Infinite scroll on recommendations sidebar
- Lazy load video thumbnails
- Preconnect to video CDN in `<head>`
- Memoize VideoCard components

---

## What Differentiates a Good Answer

| Average | Strong |
|---------|--------|
| Just the video player | Full page architecture with sidebar + comments |
| No optimistic updates | Like/subscribe with rollback on error |
| Static layout | Responsive (stacks on mobile) |
| No number formatting | formatViews, timeAgo helpers |
| No lazy loading | Lazy comments, lazy recommendations |
