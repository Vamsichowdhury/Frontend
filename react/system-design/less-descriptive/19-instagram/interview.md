# Instagram UI — Interview Transcript

**Level:** Medium-Hard | **Duration:** 60-75 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Feed Architecture | ⏹️ |
| 3 | Stories System | ⏹️ |
| 4 | Double-Tap Like | ⏹️ |
| 5 | Explore Grid & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design the Instagram feed and stories. What do you need to know?"

**What candidate should ask:**
- [ ] Stories: photos only or also videos?
- [ ] Is double-tap to like required?
- [ ] Post carousel (swipe between images)?
- [ ] Comment section on posts?
- [ ] Mobile-first or desktop?
- [ ] Explore page?

**Interviewer answers:**
> "Both photos and videos for stories. Yes double-tap like. Yes carousel. Comment preview only. Mobile-first. Bonus: explore grid."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Feed Architecture

**Interviewer:**
> "Walk me through the feed layout and how it loads."

**Expected:**
```
<FeedPage>
├── <StoriesBar />           (horizontal scroll, top)
└── <PostFeed />             (infinite scroll)
    └── <PostCard> × N
        ├── <PostHeader>     (avatar, username, options)
        ├── <PostMedia>      (image/video, double-tap zone)
        ├── <PostActions>    (❤️ 💬 ↗️ 🔖)
        ├── <LikeCount>
        └── <CaptionPreview>
```

**Expected feed loading:**
- Initial: fetch 10-12 posts
- Infinite scroll with IntersectionObserver
- Cursor-based pagination (not offset)

**Interviewer:**
> "Post has multiple images (carousel). How do you handle that?"

**Expected:** Track `currentImageIndex` per post. Left/right swipe (touch events) or dot indicators. Only load images as they become active (lazy per carousel item).

**Candidate response:** *(write your response here)*

---

# Phase 3 — Stories Architecture

**Interviewer:**
> "Walk me through the stories system — how does it work technically?"

**Expected viewer state:**
```javascript
const [activeUserIndex, setActiveUserIndex] = useState(0);
const [activeStoryIndex, setActiveStoryIndex] = useState(0);
const [isPaused, setIsPaused] = useState(false);
```

**Expected progress bar:**
```javascript
// CSS animation approach
<div
  style={{
    animation: isActive ? `grow ${story.duration}ms linear forwards` : "none",
    animationPlayState: isPaused ? "paused" : "running"
  }}
  onAnimationEnd={goToNextStory}
/>
// @keyframes grow { from { width: 0% } to { width: 100% } }
```

**Expected navigation:**
- Tap left half → prev story (or prev user's stories)
- Tap right half → next story
- Hold → pause timer

**Interviewer pushback:**
> "Video stories have variable duration. How does the progress bar handle that?"

**Expected:** Get video duration from `onLoadedMetadata` event. Pass it as the animation duration. For photos, use a fixed 5 seconds.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Double-Tap to Like

**Interviewer:**
> "Implement the double-tap to like feature."

**Expected:**
```javascript
const lastTap = useRef(0);

const handleTap = (e) => {
  const now = Date.now();
  if (now - lastTap.current < 300) {
    // Double tap
    const { clientX, clientY } = e;
    showHeartAt(clientX, clientY);
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(c => c + 1);
      fetch(`/api/posts/${postId}/like`, { method: "POST" });
    }
  }
  lastTap.current = now;
};
```

**Expected heart animation:**
```css
@keyframes heartBurst {
  0%   { transform: scale(0) rotate(-20deg); opacity: 1; }
  60%  { transform: scale(1.3) rotate(0deg); opacity: 1; }
  100% { transform: scale(1.1); opacity: 0; }
}
```

**Interviewer pushback:**
> "What if user double-taps on a video post? Does the video pause?"

**Expected:** Need to handle both single-tap (pause/play video) and double-tap (like). Use the same double-tap detection: if double-tap, cancel the single-tap handler.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Explore Grid & Follow-ups

**Interviewer:**
> "The explore page is a masonry grid of mixed-size photos. How do you build that?"

**Expected:**
- CSS Grid with `grid-template-rows: masonry` (native — limited support)
- Or: Column-based approach (3 independent column arrays)
- Or: CSS columns property
- Library: `react-masonry-css`
- Lazy load images as they enter viewport

**Interviewer:**
> "Stories show a colored ring for unseen stories. How do you track that?"

**Expected:** API returns `seen: true/false` per user's stories. After watching all stories of a user, send `POST /api/stories/:userId/seen`. Update local state to grey out their ring.

**Interviewer final:**
> "How do you handle the Stories viewer when the user swipes to close?"

**Expected:** Touch event tracking — if user swipes down (deltaY > 100px), close the viewer. CSS: `transform: translateY(${swipeOffset}px)` during swipe for natural feel.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
