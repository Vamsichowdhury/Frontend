# YouTube UI Clone — Interview Overview

---

## What Problem Are We Solving?

Design the YouTube frontend — the world's largest video platform. Users discover, watch, engage with, and comment on videos. The watch page is the core experience.

```
┌─────────────────────────────────────────────────────────────────┐
│  YouTube  🔍 Search...                    🔔  [Sign in]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────┐  ┌──────────────────────┐│
│  │                                  │  │  Up Next             ││
│  │        VIDEO PLAYER              │  │  ┌────┐ Title  4:32  ││
│  │         (16:9 ratio)             │  │  └────┘ 1.2M views   ││
│  │                                  │  │  ┌────┐ Title  8:14  ││
│  └──────────────────────────────────┘  │  └────┘ 980K views   ││
│                                        │  ┌────┐ Title 12:05  ││
│  React Tutorial 2024                   │  └────┘ 2.4M views   ││
│  1.2M views · 2 days ago               │                      ││
│                                        │  ┌────┐ Title  6:20  ││
│  👍 45K  👎  Share  Save  ···         │  └────┘ 450K views   ││
│  ─────────────────────────────────     │  ...infinite scroll  ││
│  Fireship  [Subscribe] 2.1M            └──────────────────────┘│
│                                                                 │
│  1,234 Comments  ▼ Sort by: Top                                 │
│  ┌──────────────────────────────────┐                           │
│  │ [avatar] Add a comment...        │                           │
│  └──────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Makes YouTube's UI Hard to Build

```
1. Two-column watch page layout
   Video takes ~70% width, sidebar ~30%
   Collapses to single column on mobile
   Sidebar has infinite scroll independent of main content

2. Engagement actions — like, dislike, subscribe
   All need optimistic updates + rollback
   Like/dislike are mutually exclusive (toggling one removes other)
   Subscribe adds a bell notification option
   YouTube hides the public dislike count — design decision worth discussing

3. Comments section
   Below the fold — should NOT load on page mount
   Paginated with "Load more replies" per comment
   Nested replies collapse/expand
   User count: YouTube has billions of comments — virtual scroll needed

4. Recommendations sidebar
   Infinite scroll WITHIN the sidebar (not the page)
   Each recommendation thumbnail has a hover preview
   Autoplay next video when current ends

5. View count and time formatting
   1,234,567 → "1.2M views"  "2 days ago"
   These helpers are used everywhere — worth designing well
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Watch page? Homepage? Search?           │
│  2. Architecture    →  Two-column layout, data loading         │
│  3. Watch page      →  Player + sidebar + comments layout      │
│  4. Engagement      →  Like/dislike mutual exclusion,          │
│                         subscribe flow, optimistic updates     │
│  5. Comments        →  Lazy load, nested replies, pagination   │
│  6. Sidebar         →  Infinite scroll, autoplay next          │
│  7. Homepage        →  Video grid, category chips, pagination  │
│  8. Search          →  Debounce, results, filters              │
│  9. Performance     →  Thumbnail optimisation, virtual scroll  │
│  10. Edge cases     →  No views, long titles, deleted videos   │
│  11. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Route: /watch?v=videoId                                │    │
│  │                                                         │    │
│  │  useEffect on mount:                                    │    │
│  │    ┌──────────────────────────────────────────────┐    │    │
│  │    │ PARALLEL fetches:                            │    │    │
│  │    │  GET /api/videos/:id  (metadata)             │    │    │
│  │    │  GET /api/recommendations?v=:id (sidebar)    │    │    │
│  │    └──────────────────────────────────────────────┘    │    │
│  │                                                         │    │
│  │  LAZY (when IntersectionObserver fires):                │    │
│  │    GET /api/comments?v=:id&sort=top&limit=20            │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
              │                    │                  │
    GET /api/videos/:id   GET /api/recommendations   GET /api/comments
              │                    │                  │
┌─────────────▼────────────────────▼──────────────────▼───────────┐
│                        YOUTUBE BACKEND                           │
│  - Video metadata service  (title, description, channel info)    │
│  - Recommendation engine   (personalised next videos)            │
│  - Comments service        (paginated, nested)                   │
│  - Engagement service      (like count, subscribe state)         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy — Watch Page

```
<WatchPage videoId={id}>
│
├── <VideoPlayer />                     ← see video-player question
│     (HTML5 video, custom controls)
│
├── <VideoMetadata />
│     ├── <VideoTitle />                ("React Tutorial 2024")
│     ├── <VideoStats />                ("1.2M views · 2 days ago")
│     ├── <EngagementRow />
│     │     ├── <LikeButton count={45000} isLiked={false} />
│     │     ├── <DislikeButton isDisliked={false} />     ← no count shown
│     │     ├── <ShareButton />
│     │     ├── <SaveButton />          (Save to playlist)
│     │     └── <MoreOptionsButton />
│     └── <ChannelRow />
│           ├── Channel avatar + name
│           ├── Subscriber count ("2.1M subscribers")
│           └── <SubscribeButton isSubscribed={false} />
│
├── <DescriptionBox />                  (collapsed by default, expand on click)
│
├── <CommentsSection />                 ← lazy loaded (below the fold)
│     ├── <CommentCount />             ("1,234 Comments")
│     ├── <SortDropdown />             (Top / New)
│     ├── <AddCommentInput />
│     └── <CommentsList />
│           └── <Comment /> × N
│                 ├── Avatar + name + timestamp
│                 ├── Comment text
│                 ├── 👍 Like count + Reply button
│                 └── <RepliesList />  (collapsed, load on click)
│
└── <RecommendationsSidebar />         ← right column (desktop)
      └── <RecommendationCard /> × N   (infinite scroll)
            ├── Thumbnail
            ├── Title (2 lines max)
            ├── Channel name
            ├── View count + upload date
            └── Duration badge (overlay on thumbnail)
```

---

## Engagement Actions — Mutual Exclusion

```
LIKE and DISLIKE are mutually exclusive:

State A: Neither liked nor disliked
  👍 45K    👎
  [pressing 👍]
       ↓
State B: Liked
  👍 45,001   👎
  [pressing 👎]
       ↓
State C: Disliked (like removed, dislike added)
  👍 45K    👎
  [pressing 👎 again]
       ↓
State A: Neither (toggle off)
  👍 45K    👎

IMPORTANT: YouTube removed public dislike counts in 2021.
  👎 shows the icon but NO number (unlike 👍 which shows count).
  Worth mentioning this as a product decision in the interview.
```

---

## Comments — Lazy Loading Architecture

```
Page loads:
  ┌────────────────────────────────────────────────────────┐
  │  VideoPlayer + Metadata                                │
  │  (above the fold — loads immediately)                  │
  ├────────────────────────────────────────────────────────┤
  │  CommentsSection                                       │
  │  (below the fold — NOT fetched yet)                    │
  │  IntersectionObserver watches this container           │
  └────────────────────────────────────────────────────────┘

User scrolls down:
  CommentsSection enters viewport
    → IntersectionObserver fires
    → GET /api/comments?v=videoId&sort=top&limit=20
    → Render first 20 comments
    → Show "Load 20 more" button at bottom

User clicks "Load 20 more":
    → GET /api/comments?v=videoId&continuation=token123
    → Append next 20 comments
```

---

## Data Structures

```javascript
// Video metadata
{
  id: "dQw4w9WgXcQ",
  title: "React Tutorial for Beginners 2024",
  channelId: "UCVTlvUkGslCV_h-nSAId8Sw",
  channelName: "Fireship",
  channelAvatar: "https://...",
  channelSubscriberCount: 2100000,
  thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  viewCount: 1234567,
  likeCount: 45000,
  commentCount: 1234,
  duration: 754,              // seconds
  publishedAt: "2024-01-13T10:00:00Z",
  description: "In this tutorial...",
  tags: ["react", "javascript", "tutorial"],
  isLiked: false,             // viewer-specific
  isDisliked: false,          // viewer-specific
  isSubscribed: false         // viewer-specific
}

// Comment
{
  id: "cmt_abc123",
  authorName: "John Dev",
  authorAvatar: "https://...",
  text: "Best React tutorial I've seen!",
  likeCount: 234,
  replyCount: 12,
  publishedAt: "2024-01-14T08:00:00Z",
  isLiked: false,
  isPinned: false,       // channel owner can pin a comment
  isEdited: false
}
```

---

## View Count & Time Formatting

```javascript
// Used everywhere — worth implementing well
const formatViewCount = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
};
// 1234567 → "1.2M views"
// 45000   → "45K views"
// 999     → "999 views"

const formatTimeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60)    return "just now";
  if (seconds < 3600)  return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
};
// "2024-01-13" → "2 days ago"
```

---

## Two-Column Layout — Responsive Strategy

```css
/* Desktop: side by side */
.watch-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 402px;
  gap: 24px;
  max-width: 1280px;
}

/* The minmax(0, 1fr) prevents video from overflowing */
/* 402px is YouTube's exact sidebar width */

/* Tablet / mobile: stack vertically */
@media (max-width: 1015px) {
  .watch-layout {
    grid-template-columns: 1fr;
  }
  /* Sidebar moves below video and metadata */
}
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|----------------|
| Parallel data fetching on mount | Video metadata + recommendations load simultaneously |
| Two-column CSS grid layout | Side-by-side on desktop, stacked on mobile |
| Like/dislike mutual exclusion | Complex state with 3 possible states, not just toggle |
| Optimistic engagement | Actions feel instant — rollback on failure |
| Subscribe bell notification | Secondary action after subscribing |
| Comments lazy loading | IntersectionObserver — don't fetch until visible |
| Nested comment replies | Load on demand, collapse/expand |
| Sidebar independent scroll | Overflow on sidebar container, not the page |
| Continuation token pagination | YouTube doesn't use page numbers |
| Category chip filtering | Homepage filter changes the video feed |
| formatViewCount + formatTimeAgo | Used on every video card everywhere |
| Thumbnail progressive loading | Low-res LQIP → high-res on load |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Basic watch page layout.
              Video player. Like/subscribe buttons.
Mid-level →   Parallel fetching. Responsive two-column grid.
              Lazy load comments. Like/dislike mutual exclusion.
Senior    →   All above + optimistic updates with rollback.
              Sidebar independent scroll.
              Nested comments with pagination.
              Continuation tokens.
              Thumbnail LQIP optimisation.
Staff     →   Recommendation engine interaction.
              A/B testing engagement UI.
              Client-side prediction of like state.
              Pre-fetching next video on autoplay trigger.
```
