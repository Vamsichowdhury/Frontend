# Twitter/X UI Clone - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React  

---

## Problem Statement

Design the Twitter/X frontend:
- Home timeline feed (tweets from followed accounts)
- Tweet composer (text, images, polls, thread)
- Like, retweet, reply, bookmark
- Real-time feed updates (new tweets notification)
- Notifications tab
- User profile with followers/following
- Trending topics sidebar
- Search with filters

---

## Real-World Examples

- Twitter/X
- Threads (Meta)
- Bluesky
- Mastodon

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Feed architecture | Infinite scroll + real-time updates |
| Optimistic updates | Like/retweet feel instant |
| Tweet composer | Rich input (hashtags, @mentions, char count) |
| Nested reply threads | Recursive/tree data structure |
| Real-time new tweet banner | WebSocket or polling |
| Character counter | Live validation |

---

## What You'll Learn

- Feed architecture: cursor-based pagination + infinite scroll
- Real-time "N new tweets" banner pattern (vs auto-insert)
- Tweet character counter with visual overflow indicator
- @mention and #hashtag detection in tweet text
- Optimistic updates with rollback for engagement actions
- Thread/reply tree rendering
- Profile page with tab navigation

---

## High-Level Architecture

```
<TwitterApp />
├── <Sidebar />             (left: nav, compose button, user)
├── <MainFeed />            (center)
│   ├── <FeedHeader />      ("Home", filter options)
│   ├── <NewTweetsBanner /> ("Show 12 new tweets" — click to load)
│   ├── <TweetFeed />       (infinite scroll)
│   │   └── <TweetCard /> × N
│   │       ├── Avatar, name, @handle, timestamp
│   │       ├── Tweet content (text, images, polls)
│   │       └── Actions (Reply, Retweet, Like, Bookmark, Share)
│   └── <TweetComposer />   (at top of feed)
└── <RightSidebar />        (search, trending, who to follow)
```

---

## Data Structure

```javascript
// Tweet shape
{
  id: "tweet_abc",
  authorId: "user_123",
  authorName: "Dan Abramov",
  authorHandle: "dan_abramov",
  authorAvatar: "https://...",
  text: "React is great! #reactjs",
  images: [],
  createdAt: "2024-01-15T10:00:00Z",
  likeCount: 1234,
  retweetCount: 456,
  replyCount: 89,
  bookmarkCount: 34,
  isLiked: false,
  isRetweeted: false,
  isBookmarked: false,
  inReplyToId: null,      // for replies
  quoteTweetId: null      // for quote tweets
}

// Feed state
const [tweets, setTweets] = useState([]);
const [cursor, setCursor] = useState(null);
const [newTweetsCount, setNewTweetsCount] = useState(0);
const [newTweetsBuffer, setNewTweetsBuffer] = useState([]);
```

---

## Data Flow

```
Feed loads:
  → fetch /api/timeline?limit=20
  → render tweets
  → open WebSocket for new tweet events

New tweet arrives via WebSocket:
  → DON'T auto-insert (would shift reading position)
  → buffer in newTweetsBuffer[]
  → show banner: "Show 12 new tweets"
  → user clicks banner → prepend buffer to tweets
  → clear buffer, reset count

User scrolls to bottom:
  → Intersection Observer fires
  → fetch next page using cursor
  → append to tweets list

User clicks Like:
  → optimistic: toggle isLiked, ±1 likeCount
  → POST /api/tweets/:id/like
  → on error: rollback

User composes tweet:
  → character counter (280 limit)
  → circular progress for last 20 chars
  → POST /api/tweets on submit
  → prepend new tweet to feed (optimistic)
```

---

## Key Concepts to Learn

### 1. New Tweets Banner (Critical Pattern)
```javascript
// WebSocket incoming tweet
ws.onmessage = (event) => {
  const newTweet = JSON.parse(event.data);
  setNewTweetsBuffer(prev => [newTweet, ...prev]);
  setNewTweetsCount(prev => prev + 1);
};

// User clicks "Show N new tweets"
const loadNewTweets = () => {
  setTweets(prev => [...newTweetsBuffer, ...prev]);
  setNewTweetsBuffer([]);
  setNewTweetsCount(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

### 2. Character Counter
```javascript
const MAX_CHARS = 280;
const remaining = MAX_CHARS - tweetText.length;
const isOverLimit = remaining < 0;
const isNearLimit = remaining <= 20;

// Visual: circular progress that turns red near limit
const progressPercent = Math.min((tweetText.length / MAX_CHARS) * 100, 100);
```

### 3. Optimistic Like/Retweet
```javascript
const handleLike = async (tweetId) => {
  setTweets(prev => prev.map(t =>
    t.id === tweetId
      ? { ...t, isLiked: !t.isLiked, likeCount: t.isLiked ? t.likeCount - 1 : t.likeCount + 1 }
      : t
  ));
  try {
    await fetch(`/api/tweets/${tweetId}/like`, { method: "POST" });
  } catch {
    // Rollback — refetch or reverse the mutation
  }
};
```

### 4. Hashtag/Mention Highlighting
```javascript
const renderTweetText = (text) => {
  return text.split(/(\s+)/).map((word, i) => {
    if (word.startsWith("#"))
      return <a key={i} href={`/hashtag/${word.slice(1)}`} className="hashtag">{word}</a>;
    if (word.startsWith("@"))
      return <a key={i} href={`/${word.slice(1)}`} className="mention">{word}</a>;
    return word;
  });
};
```

---

## Implementation Phases

### Phase 1 — Feed Layout
- Three-column layout
- TweetCard component
- Static tweets with dummy data

### Phase 2 — Infinite Scroll + Pagination
- Intersection Observer
- Cursor-based pagination
- Append tweets on scroll

### Phase 3 — Engagement Actions
- Like, retweet, reply, bookmark
- All with optimistic updates
- Count updates

### Phase 4 — Tweet Composer
- Character counter
- Image upload (mention concept)
- Submit and prepend

### Phase 5 — Real-time
- WebSocket for new tweets
- "Show N new tweets" banner pattern
- New notification indicator

---

## Performance Considerations

- Virtual scroll for long feeds (react-window)
- Images: lazy load, compressed thumbnails
- Memoize TweetCard — only re-render on engagement change
- Debounce search input
- Prefetch next page when user is 80% down

---

## Edge Cases

| Edge Case | How to Handle |
|-----------|--------------|
| Tweet > 280 chars | Block submit, show red overflow |
| Reply chain very deep | Truncate thread after 3 levels, "Show more replies" |
| Deleted tweet in feed | Show "This tweet was deleted" placeholder |
| User deactivated | Show ghost account placeholder |
| Tweet with 4 images | 2×2 grid layout |
