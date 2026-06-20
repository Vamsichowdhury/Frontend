# YouTube UI — Interview Transcript

**Level:** Medium-Hard | **Duration:** 60-75 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Watch Page Architecture | ⏹️ |
| 3 | Engagement Actions | ⏹️ |
| 4 | Comments Section | ⏹️ |
| 5 | Performance & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design the YouTube watch page. What do you need to know?"

**What candidate should ask:**
- [ ] Just the watch page or also homepage?
- [ ] Comments with nested replies?
- [ ] Like/dislike, subscribe?
- [ ] Recommendations sidebar?
- [ ] Chapters in progress bar?
- [ ] Mobile layout?

**Interviewer answers:**
> "Watch page + homepage grid. Yes comments with one level of replies. Yes all engagement. Yes sidebar. No chapters. Desktop first but mention mobile."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Watch Page Architecture

**Interviewer:**
> "Walk me through the layout of the watch page."

**Expected:**
```
Two-column layout:
Left (~70%): VideoPlayer + VideoMetadata + CommentsSection
Right (~30%): RecommendationsSidebar (vertical video cards)
```

**Interviewer pushback:**
> "Why is the layout a challenge on mobile?"

**Expected:** Two-column doesn't work on small screens. Stack vertically: player → metadata → recommendations → comments. Player should be fixed at top on scroll (sticky behavior on mobile).

**Interviewer:**
> "What data do you fetch when navigating to `/watch?v=videoId`?"

**Expected:** Two parallel fetches:
1. Video metadata (title, channel, description, like count)
2. Recommendations (sidebar content)

Comments loaded separately and lazily — they're below the fold.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Engagement Actions

**Interviewer:**
> "User clicks Like. Walk me through what happens."

**Expected optimistic like:**
```javascript
const handleLike = async () => {
  const wasLiked = isLiked;
  // Optimistic update
  setIsLiked(prev => !prev);
  setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
  // If was disliked, remove dislike too
  if (isDisliked) setIsDisliked(false);

  try {
    await fetch(`/api/videos/${videoId}/like`, { method: "POST" });
  } catch {
    setIsLiked(wasLiked);
    setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
  }
};
```

**Interviewer pushback:**
> "YouTube hides exact dislike counts now. How would you handle that?"

**Expected:** Store the count internally for analytics, but display only a thumbs-down icon without a number. The like count is still visible.

**Interviewer:**
> "How does Subscribe work across multiple pages?"

**Expected:** Subscribe state is global — if subscribed on one video, all other videos by that channel should show "Subscribed". Use Context or React Query to keep this in sync.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Comments Section

**Interviewer:**
> "How do you load and display comments?"

**Expected:**
- Comments are below the fold — don't load on page mount
- Load when comments section scrolls into view (IntersectionObserver)
- Paginated: fetch 20 at a time with cursor
- Top-level comments only initially; replies collapsed

**Interviewer:**
> "User posts a new comment. What happens?"

**Expected optimistic:**
```javascript
const submitComment = async (text) => {
  const tempComment = {
    id: `temp_${Date.now()}`, text,
    authorName: user.name, avatar: user.avatar,
    likeCount: 0, createdAt: new Date().toISOString(), isTemp: true
  };
  setComments(prev => [tempComment, ...prev]); // prepend
  const real = await postComment({ videoId, text });
  setComments(prev => prev.map(c => c.id === tempComment.id ? real : c));
};
```

**Interviewer:**
> "Sort comments by Top / New. How does this work?"

**Expected:** Sort parameter sent to API. Re-fetch on sort change. Don't sort client-side — we don't have all comments loaded.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Performance & Follow-ups

**Interviewer:**
> "Recommendations sidebar has 20 videos. As user watches, more load. How?"

**Expected:** Infinite scroll in the sidebar. IntersectionObserver on last recommendation card. Append more on trigger.

**Interviewer:**
> "How do you format view counts and time?"

**Expected:**
```javascript
const formatViews = (n) =>
  n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : n;

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days >= 365) return `${Math.floor(days/365)} years ago`;
  if (days >= 30) return `${Math.floor(days/30)} months ago`;
  return `${days} days ago`;
};
```

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
