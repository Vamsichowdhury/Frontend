# Twitter/X UI — Interview Transcript

**Level:** Medium-Hard | **Duration:** 60-75 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Feed Architecture | ⏹️ |
| 3 | Tweet Composer | ⏹️ |
| 4 | Real-time New Tweets | ⏹️ |
| 5 | Engagement & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design Twitter's home feed. What do you need to know?"

**What candidate should ask:**
- [ ] Real-time or periodic refresh for new tweets?
- [ ] Does liking/retweeting need immediate feedback?
- [ ] Character limit on tweets?
- [ ] Are threads supported?
- [ ] Images/media in tweets?
- [ ] Trending sidebar required?

**Interviewer answers:**
> "Real-time new tweet notifications. Yes optimistic engagement. 280 chars. Basic thread (one level). Yes images. Yes trending sidebar."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Feed Architecture

**Interviewer:**
> "Walk me through the layout and how the feed loads."

**Expected layout:**
```
Three columns (desktop):
Left: Nav sidebar (Home, Explore, Notifications, Profile)
Center: Feed + Composer
Right: Search, Trending, Who to Follow
```

**Expected feed loading:**
- Fetch first 20 tweets (cursor-based, not offset)
- Infinite scroll: IntersectionObserver on last tweet
- Append on each load

**Interviewer pushback:**
> "Why cursor-based pagination instead of page numbers for Twitter?"

**Expected:** New tweets are constantly being added. Offset pagination would cause duplicates and gaps as tweets shift. Cursor (after=tweet_id) always starts from the same point regardless of insertions.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Tweet Composer

**Interviewer:**
> "Build the tweet composer. What's interesting about it?"

**Expected features:**
- Character counter (280 max)
- Circular progress ring for last 20 characters
- Red color when over limit
- Submit disabled when over limit or empty
- @mention and #hashtag highlighting in textarea

**Expected implementation:**
```javascript
const MAX = 280;
const remaining = MAX - text.length;
const progress = Math.min(text.length / MAX, 1) * 100;

// Circular SVG progress
const radius = 16;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (progress / 100) * circumference;

return (
  <svg>
    <circle r={radius} cx={20} cy={20} fill="none"
      stroke={remaining <= 0 ? "red" : remaining <= 20 ? "orange" : "#1d9bf0"}
      strokeDasharray={circumference}
      strokeDashoffset={strokeDashoffset}
    />
  </svg>
);
```

**Interviewer pushback:**
> "User types exactly at 280 characters. Are they at limit or over?"

**Expected:** At 280 they're AT the limit (valid). 281+ is over limit (invalid). remaining = 0 is still valid.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Real-time New Tweets Banner

**Interviewer:**
> "New tweets arrive while user is reading. How do you handle them?"

**Expected — the critical pattern:**
```
❌ WRONG: Auto-insert at top (shifts reading position, disorienting)

✅ CORRECT:
1. WebSocket delivers new tweet
2. Add to buffer (NOT to main feed)
3. Show banner: "Show 5 new tweets"
4. User clicks banner → prepend buffer to feed, scroll to top
5. Clear buffer
```

**Expected implementation:**
```javascript
ws.onmessage = (event) => {
  const tweet = JSON.parse(event.data);
  setBuffer(prev => [tweet, ...prev]);
};

const loadNewTweets = () => {
  setTweets(prev => [...buffer, ...prev]);
  setBuffer([]);
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

**Interviewer pushback:**
> "What if user is already at the top of the feed (just refreshed)? Still show the banner?"

**Expected:** If user is at the top, auto-insert is fine — it won't disrupt reading. Check scroll position: if `scrollY < 200`, auto-insert. Otherwise show banner.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Engagement & Follow-ups

**Interviewer:**
> "Implement like and retweet with instant feedback."

**Expected:**
```javascript
const handleLike = (tweetId) => {
  setTweets(prev => prev.map(t =>
    t.id === tweetId
      ? { ...t, isLiked: !t.isLiked, likeCount: t.isLiked ? t.likeCount - 1 : t.likeCount + 1 }
      : t
  ));
  fetch(`/api/tweets/${tweetId}/like`, { method: "POST" }).catch(() => {
    // rollback on failure
  });
};
```

**Interviewer:**
> "How do you render hashtags and @mentions as clickable links?"

**Expected:**
```javascript
const renderText = (text) =>
  text.split(/(\s+)/).map((word, i) =>
    word.startsWith("#") ? <a key={i} href={`/hashtag/${word.slice(1)}`}>{word}</a> :
    word.startsWith("@") ? <a key={i} href={`/${word.slice(1)}`}>{word}</a> :
    word
  );
```

**Interviewer final question:**
> "1M users receive the same trending tweet. What happens to your WebSocket server?"

**Expected:** Fan-out problem. Server pushes to 1M open connections. Solutions: use pub/sub (Redis), segment users by interest graphs, rate-limit WebSocket pushes per client.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
