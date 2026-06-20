# Instagram UI Clone — Interview Overview

---

## What Problem Are We Solving?

Design the Instagram frontend — a mobile-first photo and video sharing platform. Users scroll a personalised feed, watch ephemeral stories, and engage with content through likes, comments, and saves.

```
┌────────────────────────────────────────────┐
│  Instagram        🔍  ❤️  ✉️              │
├────────────────────────────────────────────┤
│                                            │
│  Stories Bar                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 🟣  │ │ ⬜  │ │ 🟣  │ │ 🟣  │         │
│  │ You │ │Alice│ │ Bob │ │ Eve │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│  (ring)  (seen)  (ring) (ring)            │
│                                            │
│  ──────────────────────────────────────── │
│  ┌──┐ @alice                    ···       │
│  └──┘ London, UK                          │
│  ┌────────────────────────────────────┐   │
│  │                                    │   │
│  │         POST IMAGE                 │   │
│  │         (double-tap ❤️)            │   │
│  └────────────────────────────────────┘   │
│  ❤️ 🗨️ ↗  🔖                   ● ○ ○    │
│  1,234 likes                               │
│  @alice Beautiful sunset 🌅 #travel       │
└────────────────────────────────────────────┘
```

---

## What Makes Instagram's UI Hard to Build

```
1. Stories system — the most Instagram-specific feature
   Progress bar animation per story (CSS keyframe)
   Timer per story (5s for images, video duration for videos)
   Tap left → previous, tap right → next
   Hold to pause (touchstart with no immediate touchend)
   Swipe down gesture to close viewer
   Track seen/unseen per user across sessions

2. Double-tap to like
   Detect two taps within 300ms
   Show heart burst animation at the EXACT tap position
   Heart animates from where finger landed — not centre of image
   Handle rapid double-taps without duplicating like

3. Post carousel (multiple images)
   Swipe horizontally between images
   Dot indicators below showing position
   Lazy load only adjacent images

4. Stories progress bars
   Multiple bars (one per story) at the top
   All widths sum to 100% of the header
   Already-watched stories show as 100% filled
   Current story animates from current progress
   Future stories are empty

5. Stories viewer preloading
   Current story plays
   Next story's media is preloaded in background
   Previous story stays in memory (instant back)
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Stories? Reels? Explore? DMs?           │
│  2. Architecture    →  Feed, stories bar, stories viewer       │
│  3. Feed            →  Infinite scroll, post card anatomy      │
│  4. Post carousel   →  Swipe between images, dot indicators    │
│  5. Stories bar     →  Horizontal scroll, seen/unseen ring     │
│  6. Stories viewer  →  THE main section:                       │
│                         Progress bars, timers, tap navigation, │
│                         hold to pause, swipe to close          │
│  7. Double-tap like →  Tap timing, position-based animation    │
│  8. Explore grid    →  Masonry/uniform grid, lazy loading      │
│  9. Performance     →  Stories preload, image optimisation     │
│  10. Edge cases     →  Video stories, last story, failed load  │
│  11. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER/APP                       │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │              <InstagramApp>                            │    │
│   │                                                        │    │
│   │  On Mount:                                             │    │
│   │    GET /api/feed?limit=12        → FeedPosts           │    │
│   │    GET /api/stories              → StoriesBar data     │    │
│   │                                                        │    │
│   │  When story opened:                                    │    │
│   │    (data already in StoriesBar response)               │    │
│   │    Preload next user's first story media               │    │
│   │                                                        │    │
│   │  When comment section opened:                          │    │
│   │    GET /api/posts/:id/comments   → Lazy loaded         │    │
│   └────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
              │                         │
     GET /api/feed               GET /api/stories
              │                         │
┌─────────────▼─────────────────────────▼────────────────────────┐
│                      INSTAGRAM BACKEND                          │
│  - Feed service    (personalised posts, cursor pagination)      │
│  - Stories service (active stories, 24h expiry)                 │
│  - Engagement service (like, save, comment)                     │
│  - Media CDN (images, videos, story thumbnails)                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
<InstagramApp>
│
├── <Navbar>
│     ├── Logo
│     ├── <SearchIcon>
│     ├── <NotificationsIcon>
│     └── <DirectMessagesIcon>
│
├── <StoriesBar>                       ← horizontal scroll
│     └── <StoryAvatar> × N
│           ├── Avatar image
│           ├── Ring (gradient = unseen, grey = seen)
│           └── Username below
│
├── <PostFeed>                         ← infinite scroll
│     └── <PostCard> × N
│           ├── <PostHeader>           (avatar, username, location, ···)
│           ├── <PostMedia>            (image OR carousel OR video)
│           │     └── handles double-tap to like
│           ├── <PostActions>          (❤️ 🗨️ ↗ 🔖)
│           ├── <LikeCount>
│           ├── <Caption>              (username + text, truncated)
│           └── <CommentsPreview>      (top 2 comments + "View all")
│
└── <StoriesViewer>                    ← fullscreen overlay, conditional
      ├── <ProgressBarsRow>            (top — N bars)
      ├── <StoryHeader>                (avatar, username, time, ✕)
      ├── <StoryMedia>                 (image or video)
      ├── <TapZones>                   (left third / right two-thirds)
      └── <HoldOverlay>               (pause on touchstart)
```

---

## Stories Data Structure

```javascript
// Stories response — one entry per user who has active stories
[
  {
    userId: "user_alice",
    username: "alice",
    avatar: "https://...",
    hasSeen: false,     // has current user seen all of alice's stories?
    stories: [
      {
        id: "story_1",
        type: "image",           // "image" | "video"
        mediaUrl: "https://...",
        thumbnailUrl: "https://...",  // for preloading
        duration: 5000,          // ms — 5s for images (configurable)
        createdAt: "2024-01-15T10:00:00Z",
        expiresAt:  "2024-01-16T10:00:00Z"   // 24h expiry
      },
      {
        id: "story_2",
        type: "video",
        mediaUrl: "https://...",
        duration: 15000,         // actual video duration in ms
      }
    ]
  },
  ...
]

// Stories viewer state
const [activeUserIdx,  setActiveUserIdx]  = useState(0);
const [activeStoryIdx, setActiveStoryIdx] = useState(0);
const [isPaused,       setIsPaused]       = useState(false);
```

---

## Stories Progress Bar — The Technical Core

```
User Alice has 3 stories. User is on story 2.

Progress bars at top of viewer:
┌──────────────────────────────────────────────────────────┐
│  [████████████]  [████░░░░░░░░]  [            ]          │
│   Story 1        Story 2          Story 3                 │
│   (complete)     (in progress)    (not started)          │
└──────────────────────────────────────────────────────────┘

Story 2's bar fills from current progress point:
  If story 2 is 40% complete → bar starts at 40% width
  Animation runs from 40% → 100% over remaining duration

Each bar is a CSS animation:
  @keyframes fill { from { width: 0% } to { width: 100% } }
  animation: fill ${remainingDuration}ms linear forwards
  animation-play-state: running | paused (for hold-to-pause)
```

---

## Double-Tap to Like — Mechanism

```
User taps image once at coordinate (120, 340):
  lastTapTime = now (t=0ms)
  No heart shown yet

User taps image again at (125, 338) within 300ms (t=220ms):
  delta = 220ms < 300ms → DOUBLE TAP detected!

  Step 1: Show ❤️ heart burst at (120, 340)
           (position from FIRST tap, not second tap)
           CSS animation: scale 0 → 1.4 → 1.2 → 0 over 800ms

  Step 2: If post not already liked:
           setIsLiked(true)
           setLikeCount(n => n + 1)
           POST /api/posts/:id/like (optimistic)

  Step 3: Heart animates out, disappears after 800ms

If post ALREADY liked when double-tapped:
  Heart still shows (visual feedback expected by users)
  But like count does NOT increment (already liked)
  No API call needed
```

---

## Touch Events for Stories Navigation

```
Tap zones:
┌─────────────────────────────────────────────┐
│  LEFT ZONE (33%)   │   RIGHT ZONE (67%)     │
│  Tap → Previous    │   Tap → Next story     │
│  story             │                        │
└─────────────────────────────────────────────┘

Hold to pause:
  touchstart → set isPaused = true (after 200ms delay to distinguish from tap)
  touchend   → set isPaused = false, resume timer

Swipe down to close:
  touchstart: record startY
  touchmove:  if deltaY > 80px → show close animation
  touchend:   if deltaY > 80px → close viewer
              else → snap back
```

---

## Seen/Unseen Ring State

```
Unseen stories → gradient ring (Instagram's purple-orange gradient)
All seen        → grey ring
Your own story  → no ring (camera/add icon instead)

CSS:
.story-ring-unseen {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888) border-box;
}
.story-ring-seen {
  border: 2px solid #dbdbdb;
}
```

---

## Post Data Structure

```javascript
{
  id: "post_abc",
  authorId: "user_alice",
  username: "alice",
  avatar: "https://...",
  location: "London, UK",
  media: [
    { url: "https://...", type: "image", width: 1080, height: 1080 },
    { url: "https://...", type: "image", width: 1080, height: 1350 },  // ← carousel
    { url: "https://...", type: "video", thumbnailUrl: "https://..." }
  ],
  caption: "Beautiful sunset 🌅 #travel #london",
  likeCount: 1234,
  commentCount: 87,
  isLiked: false,
  isSaved: false,
  createdAt: "2024-01-15T18:00:00Z",
  topComments: [   // 2 preview comments shown without expanding
    { username: "bob", text: "Gorgeous! 😍" },
    { username: "charlie", text: "Where is this?" }
  ]
}
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|----------------|
| Stories progress bar (CSS animation) | Timer-based animation with pause/resume |
| `animation-play-state` for pause | How to pause CSS animation on hold |
| Stories navigation tap zones | Left/right thirds split, not buttons |
| Stories preloading | Load next story while current plays |
| Double-tap detection (300ms window) | Tap timing with useRef, not useState |
| Position-based heart animation | Absolute positioning from tap coordinates |
| Post carousel swipe | Touch delta → image index |
| Seen/unseen gradient ring | CSS border-image gradient technique |
| Stories viewer as portal | Full-screen overlay that escapes parent |
| Continuation token feed | Same as YouTube — stable cursor pagination |
| Masonry/uniform grid for explore | CSS grid vs CSS columns vs JS layout |
| Virtual scroll for feed | Large feeds need windowing |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Basic feed. Know stories exist. Post card layout.
Mid-level →   Stories viewer structure. Double-tap basics.
              Progress bar concept. Infinite scroll.
Senior    →   CSS animation + animation-play-state for pause.
              Double-tap with useRef (not useState).
              Position-based heart at exact tap coordinates.
              Stories preloading adjacent media.
              Tap zone split (left third vs right two-thirds).
Staff     →   Stories expiry system (24h). Server-side seen tracking.
              Stories ordering algorithm (unread first, closest to expiry).
              Explore grid ML-driven layout (featured posts 2x).
```
