# Instagram UI Clone - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React  

---

## Problem Statement

Design the Instagram frontend:
- Photo/video feed (posts from followed accounts)
- Stories bar (circular avatars at top)
- Like, comment, save, share on posts
- Stories viewer (full-screen slideshow with timer)
- Explore/search grid
- Post upload flow
- User profile with photo grid
- Direct messages (mention, not deep dive)

---

## Real-World Examples

- Instagram
- TikTok (reel variant)
- Pinterest (grid variant)
- Snapchat (stories variant)

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Stories slideshow with timer | Complex UI state |
| Double-tap to like | Touch event + animation |
| Infinite feed scroll | Performance at scale |
| Image grid layouts | Masonry or CSS grid |
| Optimistic engagement | Like/save instant feedback |
| Story progress bar | Time-based animation |

---

## What You'll Learn

- Stories architecture: auto-advance, tap to skip, hold to pause
- Progress bar animation using CSS animation or `requestAnimationFrame`
- Double-tap detection (two clicks within 300ms)
- Heart animation on double-tap (CSS keyframe)
- Masonry grid layout for explore page
- Profile photo grid with aspect ratio preservation
- Swipe gestures for stories navigation (touch events)

---

## High-Level Architecture

```
<InstagramApp />
│
├── <FeedPage />
│   ├── <StoriesBar />                (horizontal scroll)
│   │   └── <StoryAvatar /> × N
│   └── <PostFeed />                  (infinite scroll)
│       └── <PostCard /> × N
│           ├── <PostHeader />        (avatar, username, options)
│           ├── <PostMedia />         (image/video, double-tap to like)
│           ├── <PostActions />       (❤️ 💬 🔗 🔖)
│           ├── <LikesCount />
│           └── <CommentsPreview />
│
├── <StoriesViewer isOpen={true} />   (full-screen overlay)
│   ├── <ProgressBars />              (top — one per story)
│   ├── <StoryMedia />                (image/video)
│   └── <StoryNavigation />           (tap left/right)
│
└── <ExplorePage />
    └── <MasonryGrid />
        └── <ExploreCard /> × N
```

---

## Data Structure

```javascript
// Story shape
{
  id: "story_123",
  userId: "user_456",
  username: "john_doe",
  avatar: "https://...",
  stories: [
    { id: "s1", mediaUrl: "https://...", type: "image", duration: 5000 },
    { id: "s2", mediaUrl: "https://...", type: "video", duration: 15000 }
  ],
  seen: false
}

// Post shape
{
  id: "post_789",
  userId: "user_123",
  username: "jane_doe",
  avatar: "https://...",
  media: [{ url: "...", type: "image" }],  // carousel
  caption: "Beautiful sunset 🌅 #travel",
  likeCount: 2341,
  commentCount: 87,
  isLiked: false,
  isSaved: false,
  createdAt: "2024-01-15T10:00:00Z"
}

// Stories viewer state
const [activeUserIndex, setActiveUserIndex] = useState(0);
const [activeStoryIndex, setActiveStoryIndex] = useState(0);
const [isPaused, setIsPaused] = useState(false);
```

---

## Data Flow

```
Stories bar:
  → unseen stories shown first (with colored ring)
  → seen stories greyed out

User taps a story:
  → open StoriesViewer fullscreen
  → start progress bar timer for first story
  → auto-advance to next story after duration
  → when all stories of user done: move to next user's stories

Progress bar per story:
  → CSS animation width: 0% → 100% over duration ms
  → paused when user holds finger down (pause state)
  → reset and restart on next story

Double-tap on post image:
  → detect two taps within 300ms
  → trigger heart animation at tap position
  → if not already liked: like post (optimistic)

User swipes up on story:
  → navigate to linked URL

Stories end:
  → close viewer, return to feed
```

---

## Key Concepts to Learn

### 1. Story Progress Bar (CSS Animation)
```javascript
function ProgressBar({ duration, isActive, isPaused, onComplete }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{
          animation: isActive ? `fill ${duration}ms linear forwards` : "none",
          animationPlayState: isPaused ? "paused" : "running"
        }}
        onAnimationEnd={onComplete}
      />
    </div>
  );
}
// CSS: @keyframes fill { from { width: 0% } to { width: 100% } }
```

### 2. Double-Tap to Like
```javascript
const lastTap = useRef(0);

const handleTap = (e) => {
  const now = Date.now();
  if (now - lastTap.current < 300) {
    // Double tap!
    triggerHeartAnimation(e.clientX, e.clientY);
    if (!isLiked) handleLike();
  }
  lastTap.current = now;
};
```

### 3. Heart Burst Animation (CSS Keyframes)
```css
@keyframes heartBurst {
  0%   { transform: scale(0); opacity: 1; }
  50%  { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}
.heart-animation {
  animation: heartBurst 0.8s ease forwards;
}
```

### 4. Story Navigation (Tap Areas)
```jsx
<div className="story-viewer">
  {/* Left half: go to previous story */}
  <div className="tap-left" onClick={goPrev} />
  {/* Right half: go to next story */}
  <div className="tap-right" onClick={goNext} />
  {/* Hold to pause */}
  <div onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} />
</div>
```

---

## Implementation Phases

### Phase 1 — Feed & Post Card
- Post card layout
- Image carousel (swipe between images)
- Like/save/comment actions

### Phase 2 — Stories Bar
- Horizontal scrolling stories
- Seen vs unseen visual state

### Phase 3 — Stories Viewer
- Fullscreen overlay
- Progress bar animation
- Auto-advance between stories
- Tap to navigate, hold to pause

### Phase 4 — Double-Tap Like
- Tap detection
- Heart burst animation
- Optimistic like update

### Phase 5 — Explore Grid
- Masonry grid layout
- Hover preview on desktop

---

## Performance Considerations

- Preload next story media while current plays
- Only render visible feed items (virtual scroll)
- Pause stories when tab is not visible
- Thumbnail quality for feed, full quality only when viewed
- `will-change: transform` on story media for GPU acceleration

---

## Edge Cases

| Edge Case | How to Handle |
|-----------|--------------|
| Story video fails to load | Skip to next story after 2s |
| Last story of last user | Close viewer |
| Post with no images | Text-only post layout |
| Very long caption | "...more" truncation |
| Post carousel > 10 images | Still swipeable, show dot count |
