# Typeahead / Autocomplete — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)  
**Duration:** ~50 minutes  
**Interviewer style:** Collaborative but probing — will push back on vague answers

---

> **How to use this file:**
> Read it like a screenplay. The Interviewer speaks. The Candidate responds.
> Notice the flow: broad → specific → deeper → edge cases → scale.
> After reading, try answering the interviewer's questions yourself before reading the candidate's answer.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Hey, good to meet you. Today I'd like you to design a typeahead or autocomplete component — similar to what you'd see in a search bar. There's no single right answer here, I'm more interested in how you think. Go ahead whenever you're ready.

---

**Candidate:**

Thanks! Before I start designing, I'd like to ask a few clarifying questions if that's okay.

---

**Interviewer:**

Sure, go ahead.

---

**Candidate:**

> #### Why candidates ask clarifying questions before designing
> Jumping straight into a solution without knowing the scope is one of the most common mistakes in system design interviews. Clarifying questions show the interviewer that you don't make assumptions, that you think about requirements before writing code, and that you understand different constraints lead to different architectures. Every question below has a specific intent behind it.

---

**Q1. What are we searching over? Users, products, places, general web content?**

> **Why ask this:**
> The data type completely changes the design.
> - Searching *users* → each result needs avatar, username, display name
> - Searching *products* → price, image, category matter
> - Searching *places* → geolocation, distance sorting may apply
> - Searching *general web* → could be millions of results, needs pagination
>
> It also affects the API endpoint, the result card layout, and what happens when the user selects a result (navigate to profile? fill a form field? redirect to a product page?).

---

**Q2. Should suggestions come from a backend API or can we have a local dataset?**

> **Why ask this:**
> This is the biggest architectural fork.
> - *Local dataset* (e.g. a list of 50 country names) → no API call needed, filter client-side, no debounce needed, no caching needed, no loading state needed. Much simpler.
> - *Backend API* → you need debounce, caching, loading states, error handling, race condition handling.
>
> Assuming API without checking could lead to over-engineering a simple problem — or under-engineering a real one.

---

**Q3. Is this for desktop only, or does it need to work on mobile too?**

> **Why ask this:**
> Mobile changes several things:
> - No hover events — hover-to-preview patterns don't work
> - Virtual keyboard reduces viewport height — dropdown positioning needs care
> - Touch events instead of mouse clicks — tap vs click
> - Smaller tap targets needed (min 44×44px per Apple guidelines)
> - `inputMode="search"` shows the correct mobile keyboard
>
> If mobile is required, you design for it from the start. Adding it later is expensive.

---

**Q4. Do we need keyboard navigation — arrow keys, Enter to select, Escape to close?**

> **Why ask this:**
> Keyboard navigation significantly increases implementation complexity. You need to track `selectedIndex` state, handle multiple key events, prevent default browser behavior on arrow keys, manage scroll-into-view for long lists, and update ARIA attributes for accessibility.
>
> If the interviewer says "no keyboard nav needed", that's 20–30% less code. Confirming scope prevents building features you don't need — a classic interview trap.

---

**Q5. How many suggestions should we show? Is there a max?**

> **Why ask this:**
> This affects rendering strategy.
> - 5–10 results → render all, no special handling needed
> - 50–100 results → consider virtual scrolling or pagination within the dropdown
> - 500+ results → virtual scrolling is required, otherwise the DOM is overwhelmed
>
> It also helps you discuss performance trade-offs. Asking this signals you already think about rendering performance.

---

**Q6. Should we show the user's recent searches before they type anything?**

> **Why ask this:**
> Recent searches require a completely different data source — localStorage or a user history API — not the search API.
> They also have different rendering: shown *before* typing, replaced by live results *after* typing.
>
> This is a common product feature (Google does it, Slack does it) and asking about it shows product awareness. If the answer is yes, it adds meaningful scope. If no, you've eliminated it cleanly.

---

**Q7. Is there a minimum character count before we start fetching?**

> **Why ask this:**
> Searching with 1 character like "a" could match millions of users — expensive for the backend and useless for the user.
> A minimum of 2 characters reduces API load significantly and usually returns more meaningful results.
>
> This is also a debounce-adjacent concern: even with debounce, a 1-character query fires a real request. The minimum is a separate, complementary guard.

---

**Q8. Any accessibility requirements — screen reader support?**

> **Why ask this:**
> Accessibility (ARIA) is often an afterthought, but it should be designed in from the start.
> The ARIA combobox pattern requires specific roles, properties, and live region attributes that affect how you structure the HTML.
>
> Asking this upfront signals maturity. Many candidates skip accessibility entirely — asking about it sets you apart. Even if the answer is "just basic", you've shown you think about it.

---

**Interviewer:**

Good set of questions. Here's the scope:

- We're searching users — like a Slack @mention or Twitter search.
- Suggestions come from a backend API.
- Both desktop and mobile need to work.
- Yes, keyboard navigation is required.
- Show the top 5 suggestions.
- No recent searches for now — we can add that later.
- Start searching after 2 characters minimum.
- Basic accessibility is good to have.

---

**Candidate:**

Perfect. One more — roughly how many concurrent users are we designing for? Thousands or millions? That'll affect how I think about caching and rate limiting.

> **Why ask this (scale question):**
> Scale changes the weight of your decisions.
> - *Hundreds of users* → a simple in-memory cache is fine, no need for TTL or LRU eviction
> - *Hundreds of thousands* → caching matters, debounce delay matters, you might discuss CDN-level caching or rate limiting
> - *Millions* → backend architecture enters the conversation (Redis, search indexes, edge caching)
>
> Asking this *after* the functional questions is intentional — you establish what you're building first, then ask how big it needs to be. Asking scale first before understanding the product is a red flag.

---

**Interviewer:**

Let's say hundreds of thousands of users. It's a mid-to-large product.

---

**Candidate:**

Got it. That's enough to make performance and caching important. Let me start with a high-level design and then go deeper.

---

## ─────────────────────────────────────
## PHASE 2 — High-Level Design
## ─────────────────────────────────────

---

**Candidate:**

At the highest level, the flow looks like this:

```
User types
    ↓
Debounce (wait for pause in typing)
    ↓
Check local cache
    ↓
Cache hit?  ──────Yes──────▶  Return cached results
    │
    No
    ↓
API call  →  GET /search/users?q=john
    ↓
Store result in cache
    ↓
Render suggestions dropdown
    ↓
User navigates with keyboard or mouse
    ↓
User selects → onSelect(user) fires
```

There are four main concerns here:

1. **Input handling** — debouncing so we don't hammer the API on every keystroke
2. **Caching** — so repeated searches are instant
3. **Async management** — handling race conditions between responses
4. **Rendering** — keyboard navigation, loading states, accessibility

---

**Interviewer:**

Walk me through the debounce part. Why is it needed?

---

**Candidate:**

Without debounce, every single keystroke fires an API call. If a user types "react" quickly, that's five separate requests:

```
Keystroke   Request sent
─────────────────────────
"r"    →    GET /search?q=r
"re"   →    GET /search?q=re
"rea"  →    GET /search?q=rea
"reac" →    GET /search?q=reac
"react"→    GET /search?q=react

Total: 5 network requests
```

That wastes bandwidth, puts load on the server, and also causes flickering in the UI as results keep changing while the user is still typing.

Debounce solves it by waiting until the user *pauses* typing before firing the request. So if the debounce delay is 300ms:

```
"r"     ← timer starts (300ms)
"re"    ← timer resets (300ms)
"rea"   ← timer resets (300ms)
"reac"  ← timer resets (300ms)
"react" ← timer resets (300ms)
         ← 300ms passes with no new input
         ← ONE request fires: GET /search?q=react
```

One request instead of five.

---

**Interviewer:**

Why 300ms specifically? Why not 100ms or 1000ms?

---

**Candidate:**

It's a UX tradeoff.

```
Too short (100ms):
  → Feels fast, but still fires many requests
  → User types fast (5–7 chars/sec) → still 3–4 requests

Too long (1000ms):
  → Feels sluggish
  → User pauses naturally and nothing happens for a full second

300ms:
  → Fast enough that it feels real-time
  → Long enough to avoid most keystroke bursts
  → Industry standard — Google, Twitter all use ~250–400ms
```

You can tune it per product. A slower API might benefit from 400ms. A very fast API could go down to 200ms.

---

**Interviewer:**

What's the difference between debounce and throttle? Why didn't you use throttle?

---

**Candidate:**

Great question. They're often confused.

```
DEBOUNCE:
  Waits for a "quiet period" before executing.
  The function only runs after input stops.

  Good for: search, form validation, resize handlers
  ─────────────────────────────────────────────────
  Input: r - re - rea - react
  Fires:                       ← only once, after stop

THROTTLE:
  Executes at most once per N milliseconds, regardless.
  The function runs on a fixed schedule.

  Good for: scroll events, mousemove, window resize
  ─────────────────────────────────────────────────
  Input: r - re - rea - react
  Fires:   ←     ←          ← every 200ms
```

For search, throttle is wrong because it fires even while the user is mid-word. Debounce waits for the pause, which is exactly what we want.

---

**Interviewer:**

Makes sense. How do you implement debounce in React?

---

**Candidate:**

I'd write a custom `useDebounce` hook:

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Start a timer when value changes
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timer if value changes again before delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

Then in the component:

```javascript
function Typeahead() {
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue, 300);

  // This effect only fires when debouncedQuery changes
  // which only happens 300ms after the user stops typing
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);
}
```

The key insight: `inputValue` changes on every keystroke and causes a re-render of the input. But `debouncedQuery` only changes after the pause — so the API fetch only fires then.

---

**Interviewer:**

Nice. Now let's talk about the component structure. What does your React tree look like?

---

## ─────────────────────────────────────
## PHASE 3 — Component Architecture
## ─────────────────────────────────────

---

**Candidate:**

I'd break it into these components:

```
<Typeahead onSelect={handleSelect}>
│
├── <InputField>
│     Props: value, onChange, onKeyDown, placeholder
│     Handles: user typing, keyboard events
│
└── <SuggestionsDropdown>   ← only renders when open
      │
      ├── Case 1: loading === true
      │     └── <LoadingSpinner>
      │
      ├── Case 2: error !== null
      │     └── <ErrorMessage message={error} />
      │
      ├── Case 3: suggestions.length === 0
      │     └── <EmptyState query={debouncedQuery} />
      │
      └── Case 4: suggestions.length > 0
            └── <SuggestionItem> × N
                  Props: suggestion, isHighlighted, onSelect
```

The parent `<Typeahead>` manages all the state:

```javascript
// State inside <Typeahead>
const [inputValue, setInputValue] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [selectedIndex, setSelectedIndex] = useState(-1);
const [isOpen, setIsOpen] = useState(false);
```

---

**Interviewer:**

Why keep all state in the parent? Could `<SuggestionsDropdown>` manage its own state?

---

**Candidate:**

It could, but I prefer keeping state at the `<Typeahead>` level for a few reasons:

1. The dropdown needs to know the `selectedIndex` to highlight items — and that index is driven by keyboard events on the `<InputField>`. So both children need to share that state. If it's in the dropdown, you'd need to lift it up anyway.

2. The `onSelect` callback needs to update the `inputValue` (fill in the selected user's name). That means the dropdown needs to reach up to the input. Easier if the parent owns both.

3. It's a single coherent component — keeping state in one place makes it easier to reason about, test, and extend.

The pattern here is **lifting state up** — whenever two sibling components need to share state, that state lives in their common parent.

---

**Interviewer:**

What data does each `<SuggestionItem>` need?

---

**Candidate:**

For a user search, something like:

```javascript
// API response shape
{
  id: "user_123",
  displayName: "John Smith",
  username: "johnsmith",
  avatar: "https://cdn.example.com/avatars/john.jpg",
  bio: "Frontend Developer at Acme"
}
```

The `<SuggestionItem>` renders:

```
┌────────────────────────────────────────────┐
│  [avatar]  John Smith                      │
│            @johnsmith · Frontend Dev...    │
└────────────────────────────────────────────┘
```

And it takes:
- `suggestion` — the data object
- `isHighlighted` — boolean (true when keyboard-selected)
- `onSelect` — callback when clicked or Enter pressed

---

## ─────────────────────────────────────
## PHASE 4 — Caching
## ─────────────────────────────────────

---

**Interviewer:**

Let's talk about caching. When is it useful here?

---

**Candidate:**

Here's the scenario it solves:

```
User searches: "john"
  → API called → results stored in cache
  → User sees: John Smith, John Doe, John Lee

User clears the input.
User types "john" again.
  → Without cache: another API call (wasteful)
  → With cache: instant return from cache (no network)
```

Also useful when typing character by character:

```
User types: j → jo → joh → john
  → "j" fires API
  → "jo" fires API
  → "joh" fires API
  → "john" fires API (already cached from earlier)
    → returns instantly from cache
```

---

**Interviewer:**

How do you implement the cache?

---

**Candidate:**

I'd use `useRef` to store a plain JavaScript object — essentially a key-value map:

```javascript
const cache = useRef({});

const fetchSuggestions = async (query) => {
  // Check cache first
  if (cache.current[query]) {
    setSuggestions(cache.current[query]);
    return;  // ← no API call
  }

  // Cache miss — fetch from API
  setLoading(true);
  try {
    const response = await fetch(`/api/search/users?q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    cache.current[query] = data.results;  // ← store in cache
    setSuggestions(data.results);
  } catch (err) {
    setError("Search failed. Try again.");
  } finally {
    setLoading(false);
  }
};
```

---

**Interviewer:**

Why `useRef` instead of `useState` for the cache?

---

**Candidate:**

Two reasons.

First, cache updates should *not* trigger a re-render. If I used `useState`, every time I write a new entry to the cache, React would re-render the component. The cache is internal bookkeeping — the UI doesn't need to know about it.

Second, `useRef` persists across renders. Unlike a regular `const cache = {}` inside the component (which gets recreated every render), `useRef` gives me a stable object that lives for the entire lifecycle of the component.

```
useState(cache):
  Write to cache → triggers re-render → slow, wasteful

Regular const cache = {}:
  Every render → new empty cache → defeats the purpose

useRef(cache):
  Write to cache → no re-render
  Persists across renders → cache survives ✅
```

---

**Interviewer:**

The user has been searching for an hour. The cache has accumulated 500 entries. Is that a problem?

---

**Candidate:**

In a typical session, no — 500 entries of search results is maybe a few hundred KB at most. Not a real memory concern for a browser.

But for a production-grade implementation, you'd want to bound it. The standard solution is an **LRU cache** — Least Recently Used.

```
LRU Cache with capacity = 100:

  Each time a query is accessed or added, it moves to the front.
  When capacity is reached, the entry at the back (least recently used) is evicted.

  Example:
  ┌──────────────────────────────────────────┐
  │  Front (most recent)   Back (oldest)     │
  │  [john] [jane] [alex] ... [bob] [carol]  │
  │                                          │
  │  New query "david" added → capacity 101  │
  │  "carol" evicted (last used long ago)    │
  └──────────────────────────────────────────┘
```

JavaScript's `Map` maintains insertion order, so you can implement LRU with it:

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    // Move to front (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    // Evict oldest if over capacity
    if (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}
```

---

**Interviewer:**

That's a good answer. What about cache staleness? If a new user "John Wilson" signs up, your cached results for "john" won't include them.

---

**Candidate:**

Good point. A few strategies:

**Option 1 — TTL (Time to Live)**
Each cache entry expires after N minutes:

```javascript
cache.current[query] = {
  results: data.results,
  timestamp: Date.now()
};

const TTL = 5 * 60 * 1000; // 5 minutes

// On cache read:
const cached = cache.current[query];
if (cached && Date.now() - cached.timestamp < TTL) {
  return cached.results; // still fresh
}
// Otherwise: cache miss, re-fetch
```

**Option 2 — Stale-while-revalidate**
Return the cached result immediately (fast), but simultaneously fire an API call to update the cache in the background. The UI shows slightly stale data but feels instant.

```javascript
if (cached) {
  setSuggestions(cached.results);       // show stale immediately
  fetchAndUpdateCache(query);           // update in background
  return;
}
```

For most typeahead use cases — TTL of 5 minutes is fine. Users won't notice if results are 5 minutes old.

---

## ─────────────────────────────────────
## PHASE 5 — Race Conditions
## ─────────────────────────────────────

---

**Interviewer:**

Let me give you a scenario. User types "re", waits, then types "react". Two API requests are in flight. Response for "react" comes back first. Then response for "re" arrives. What does the user see?

---

**Candidate:**

Without any handling — they'd see the wrong results.

```
Timeline:
─────────────────────────────────────────────────────
t=0ms    User types "re"
t=300ms  Debounce fires → Request A: GET /search?q=re

t=400ms  User types "react"
t=700ms  Debounce fires → Request B: GET /search?q=react

t=900ms  Request B responds → UI shows results for "react" ✅
t=1200ms Request A responds → UI shows results for "re"    ❌

The slower response (A) arrived LAST and overwrote the correct results.
The user typed "react" but now sees results for "re".
```

This is a **race condition** — caused by async responses arriving out of order.

---

**Interviewer:**

How do you fix it?

---

**Candidate:**

Two approaches.

**Approach 1: AbortController (preferred)**

Before each new request, cancel the previous one:

```javascript
const abortControllerRef = useRef(null);

const fetchSuggestions = async (query) => {
  // Cancel any in-flight request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  // Create a new controller for this request
  abortControllerRef.current = new AbortController();

  try {
    const response = await fetch(
      `/api/search/users?q=${encodeURIComponent(query)}`,
      { signal: abortControllerRef.current.signal }  // ← pass signal
    );
    const data = await response.json();
    setSuggestions(data.results);
  } catch (err) {
    if (err.name === "AbortError") {
      return; // ← this is expected, not an error
    }
    setError("Search failed.");
  }
};
```

Now when "react" is typed, the "re" request gets aborted before it can respond:

```
t=0ms    Request A starts (q=re)
t=400ms  Request A ABORTED ✋ (because "react" was typed)
         Request B starts (q=react)
t=700ms  Request B responds → UI shows "react" results ✅
         (Request A never responds — it was cancelled)
```

**Approach 2: Ignore stale responses**

If AbortController isn't available (rare now, but sometimes needed):

```javascript
const latestQueryRef = useRef("");

const fetchSuggestions = async (query) => {
  latestQueryRef.current = query;
  const data = await callAPI(query);

  // Only update UI if this query is still the latest
  if (query === latestQueryRef.current) {
    setSuggestions(data.results);
  }
  // Otherwise: silently discard this response
};
```

---

**Interviewer:**

Between the two, which do you prefer?

---

**Candidate:**

AbortController, for two reasons.

First, it actually cancels the network request — saving bandwidth and server resources. The second approach lets the old request complete on the server even though we discard the response.

Second, it's cleaner in terms of mental model — "this request is no longer needed" communicated explicitly, rather than a post-hoc check.

AbortController is well-supported in all modern browsers. The only time I'd fall back to the ref approach is when working with a library that doesn't support signals — some older axios versions for example.

---

## ─────────────────────────────────────
## PHASE 6 — Keyboard Navigation
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through keyboard navigation. What should happen for each key?

---

**Candidate:**

Here's the full keyboard spec:

```
Key          Action
─────────────────────────────────────────────────────
ArrowDown    Move highlight to next suggestion
             (if at last item, don't go past it)

ArrowUp      Move highlight to previous suggestion
             (if at first item or nothing selected, go to -1)

Enter        If item is highlighted → select it
             If nothing highlighted → submit the search as-is

Escape       Close the dropdown, keep the input value

Tab          Close the dropdown, move focus out of input
```

The state I need:

```javascript
const [selectedIndex, setSelectedIndex] = useState(-1);
// -1 means "nothing selected" (user hasn't pressed arrow key yet)
```

The handler:

```javascript
const handleKeyDown = (e) => {
  if (!isOpen || suggestions.length === 0) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault(); // ← prevent cursor moving in input
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
      break;

    case "ArrowUp":
      e.preventDefault(); // ← prevent cursor moving in input
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      break;

    case "Enter":
      e.preventDefault();
      if (selectedIndex >= 0) {
        selectSuggestion(suggestions[selectedIndex]);
      }
      break;

    case "Escape":
      setIsOpen(false);
      setSelectedIndex(-1);
      break;
  }
};
```

---

**Interviewer:**

Why `e.preventDefault()` on ArrowDown and ArrowUp?

---

**Candidate:**

In a text input, ArrowDown and ArrowUp move the cursor to the end or beginning of the text — that's the browser's default behavior. By calling `preventDefault()`, we stop the cursor from moving while allowing our handler to move the suggestion selection instead.

Without it, the user presses ArrowDown and two things happen: the cursor jumps to the end of the input AND the next suggestion gets highlighted. The cursor movement is jarring and unexpected.

---

**Interviewer:**

What about scroll? If there are 10 suggestions and the highlighted item is item 9 (offscreen), how do you ensure it's visible?

---

**Candidate:**

I'd use `scrollIntoView` on the highlighted element. Each `<SuggestionItem>` has a ref, and when the `selectedIndex` changes:

```javascript
useEffect(() => {
  if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
    itemRefs.current[selectedIndex].scrollIntoView({
      block: "nearest",  // ← only scroll if needed, don't force to center
    });
  }
}, [selectedIndex]);
```

`block: "nearest"` is important — it only scrolls if the item is not already visible. Without it, every arrow key press would abruptly scroll the list, which feels wrong when items are already in view.

---

## ─────────────────────────────────────
## PHASE 7 — Accessibility
## ─────────────────────────────────────

---

**Interviewer:**

How do you make this accessible for users who rely on screen readers?

---

**Candidate:**

Screen readers need semantic HTML attributes to understand what's happening. The ARIA combobox pattern covers this:

```jsx
<div>
  <input
    type="text"
    role="combobox"
    aria-expanded={isOpen}
    aria-autocomplete="list"
    aria-controls="suggestions-listbox"
    aria-activedescendant={
      selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
    }
  />

  {isOpen && (
    <ul
      id="suggestions-listbox"
      role="listbox"
    >
      {suggestions.map((s, i) => (
        <li
          key={s.id}
          id={`suggestion-${i}`}
          role="option"
          aria-selected={i === selectedIndex}
        >
          {s.displayName}
        </li>
      ))}
    </ul>
  )}
</div>
```

When the user presses ArrowDown and `selectedIndex` becomes 2, `aria-activedescendant` updates to `"suggestion-2"`. The screen reader announces: *"John Lee, option 3 of 5"*.

---

**Interviewer:**

What does `aria-expanded` do?

---

**Candidate:**

It tells the screen reader whether the dropdown is currently open or closed.

```
aria-expanded="false" → Screen reader: "Search users, collapsed"
aria-expanded="true"  → Screen reader: "Search users, expanded, 5 options available"
```

Without it, a screen reader user types and doesn't know whether suggestions are showing or not.

---

**Interviewer:**

What if someone is on mobile with a virtual keyboard — any considerations?

---

**Candidate:**

A few:

1. **`inputMode="search"`** — tells mobile browsers to show the search keyboard (with a search icon on the return key instead of "Return")

2. **Tap target size** — each suggestion item should be at least 44×44px (Apple's guideline) so it's easy to tap

3. **Touch vs hover** — hover cards don't work on mobile. The hover-open behavior becomes tap-open. The component already handles this since `onClick` is the primary selection mechanism

4. **Viewport scroll** — when the keyboard opens on mobile, the viewport shrinks. The dropdown might render offscreen. I'd use `position: fixed` on the dropdown or calculate available space and flip direction

---

## ─────────────────────────────────────
## PHASE 8 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

Let's cover some edge cases. User types 1 character — what happens?

---

**Candidate:**

We don't fire the API. The minimum is 2 characters (as we agreed in requirements). I'd also show no dropdown when the input is empty or 1 character.

```javascript
useEffect(() => {
  if (debouncedQuery.length < 2) {
    setSuggestions([]);
    setIsOpen(false);
    return;
  }
  fetchSuggestions(debouncedQuery);
}, [debouncedQuery]);
```

---

**Interviewer:**

User types a query, gets results, then clicks somewhere else on the page. What happens?

---

**Candidate:**

The dropdown should close. I handle this with an `onBlur` event on the input:

```javascript
const handleBlur = () => {
  // Delay closing by a tick — otherwise clicking a suggestion
  // fires onBlur first and closes the dropdown before the click registers
  setTimeout(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, 150);
};
```

The 150ms delay is critical. Without it, clicking a suggestion fires this sequence:

```
mousedown on suggestion
onBlur fires on input → dropdown closes ← suggestion never clicked!
mouseup on suggestion (nothing there anymore)
```

The delay lets the mousedown → click sequence complete before closing.

An alternative is to use `onMouseDown` on suggestion items with `e.preventDefault()`, which prevents the input from losing focus when a suggestion is clicked.

---

**Interviewer:**

What if the API returns an empty array?

---

**Candidate:**

Show an empty state, not a blank dropdown:

```jsx
{suggestions.length === 0 && !loading && debouncedQuery.length >= 2 && (
  <div className="empty-state">
    No users found for "{debouncedQuery}"
  </div>
)}
```

This is better UX than just hiding the dropdown — it confirms the search ran and found nothing, rather than leaving the user wondering if search is broken.

---

**Interviewer:**

What if the user types a query with special characters — like `john & jane` or `<script>`?

---

**Candidate:**

Two things:

1. **URL encoding** — I'm already using `encodeURIComponent(query)` in the fetch URL. This converts `&` to `%26`, `<` to `%3C`, etc. So the URL stays valid.

2. **XSS prevention** — when rendering the suggestion text in React, I always use JSX: `<span>{suggestion.displayName}</span>`. React escapes HTML by default, so `<script>alert(1)</script>` would render as literal text, not execute. I'd never use `dangerouslySetInnerHTML` for user-generated content.

---

**Interviewer:**

Good. What about highlighting the matching part of the suggestion? Like if the user types "joh" and "John Smith" appears, the "Joh" part is bolded?

---

**Candidate:**

Nice touch. I'd do it like this:

```javascript
function HighlightedText({ text, query }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, index)}
      <strong>{text.slice(index, index + query.length)}</strong>
      {text.slice(index + query.length)}
    </span>
  );
}
```

Result:

```
User typed: "joh"
Suggestion: [Joh]n Smith   ← bold for the match
```

I use case-insensitive matching so "JOH" still highlights "Joh".

---

## ─────────────────────────────────────
## PHASE 9 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

The API returns 500 suggestions. You're rendering all of them. What's the problem?

---

**Candidate:**

500 DOM nodes for a dropdown is way too many. The browser has to:

- Create 500 elements
- Layout 500 elements
- Paint 500 elements
- Handle hover/keyboard events across 500 elements

This would make the dropdown noticeably slow to open and scrolling inside it would stutter.

The straightforward fix is just to limit: show the top 5–10 results on the frontend regardless of what the API returns.

```javascript
setSuggestions(data.results.slice(0, 5)); // only show top 5
```

But if the requirement is to support a genuinely long list, I'd use **virtual scrolling** — only render the items that are currently visible in the dropdown viewport:

```
Dropdown shows items 3–8 (visible in viewport)
Items 1–2 and 9–500 are NOT in the DOM

User scrolls down → items 5–10 render, items 1–4 unmount
```

Libraries like `react-window` handle this. Each item gets a calculated `top` offset based on its index and fixed item height, so the total scrollable height is correct, but only ~10 DOM nodes exist at any time.

---

**Interviewer:**

What about `React.memo` — is it useful here?

---

**Candidate:**

Yes, for `<SuggestionItem>`. Every time `selectedIndex` changes (user presses arrow key), the parent re-renders. Without `React.memo`, all 5 suggestion items re-render. With it, only the item whose `isHighlighted` prop actually changed will re-render.

```javascript
const SuggestionItem = React.memo(({ suggestion, isHighlighted, onSelect }) => {
  return (
    <li
      className={isHighlighted ? "highlighted" : ""}
      onClick={() => onSelect(suggestion)}
    >
      {suggestion.displayName}
    </li>
  );
});
```

For 5 items the difference is negligible. For 50 items in a larger list, it's meaningful.

---

## ─────────────────────────────────────
## PHASE 10 — Scaling
## ─────────────────────────────────────

---

**Interviewer:**

Now let's zoom out. You said hundreds of thousands of users. Every user is making typeahead calls. The API gets hammered. What do you think about on the frontend to help with that?

---

**Candidate:**

On the frontend, two main levers:

**1. Debounce + minimum characters**
Already covered — this reduces calls dramatically. A user typing "john smith" fires 1 call, not 10.

**2. Client-side cache**
If 1000 users all type "john" in the same hour, the backend still gets 1000 requests. But if each user's client caches their own session results, repeat searches within a session become free.

For shared caching at scale, that's a backend concern — a Redis cache in front of the search index would serve repeated queries from cache instead of hitting the database.

---

**Interviewer:**

What if the API response is slow — 2 seconds? What do you show the user?

---

**Candidate:**

First, show a loading indicator immediately so the user knows something is happening:

```jsx
{loading && (
  <div className="loading">
    <Spinner size="small" />
    <span>Searching...</span>
  </div>
)}
```

Second, consider a timeout. If the API hasn't responded in 5 seconds, show an error rather than letting the user wait indefinitely:

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  // ...
} catch (err) {
  if (err.name === "AbortError") {
    setError("Search is taking too long. Please try again.");
  }
}
```

Third, serve stale cached results if available while the fresh request is in flight. The user sees *something* immediately, even if it's slightly stale.

---

**Interviewer:**

What if we wanted to add analytics — track which suggestions users click on, and which queries produce no results?

---

**Candidate:**

I'd fire analytics events at two points:

```javascript
// Event 1: suggestion clicked
const handleSelect = (suggestion, query, index) => {
  analytics.track("typeahead_suggestion_selected", {
    query,
    selectedId: suggestion.id,
    selectedIndex: index,      // which position was clicked (0 = first)
    totalResults: suggestions.length
  });
  onSelect(suggestion);
};

// Event 2: query with zero results
if (data.results.length === 0) {
  analytics.track("typeahead_no_results", {
    query: debouncedQuery
  });
}
```

The `selectedIndex` data is especially valuable — if users always click the third result, maybe the ranking algorithm should be tuned. Zero-result queries tell you what people are searching for that you don't have.

---

## ─────────────────────────────────────
## PHASE 11 — Summary & Wrap-up
## ─────────────────────────────────────

---

**Interviewer:**

We're almost at time. Can you summarize the architecture and the key decisions you made?

---

**Candidate:**

Sure. Here's the complete picture:

```
┌─────────────────────────────────────────────────────────────┐
│                 TYPEAHEAD ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User types                                                 │
│      │                                                      │
│      ▼                                                      │
│  [Input Field]                                              │
│      │  onChange → setInputValue                            │
│      │  onKeyDown → keyboard navigation handler             │
│      │                                                      │
│      ▼                                                      │
│  [useDebounce hook]  300ms delay                            │
│      │  returns debouncedQuery                              │
│      │                                                      │
│      ▼                                                      │
│  [useEffect]  fires when debouncedQuery changes             │
│      │                                                      │
│      ├─▶ length < 2? → clear suggestions, close dropdown   │
│      │                                                      │
│      └─▶ check cache (useRef Map)                           │
│              │                                              │
│        Cache hit?──Yes──▶ setSuggestions(cached)           │
│              │                                              │
│              No                                             │
│              │                                              │
│              ▼                                              │
│        abort previous request (AbortController)             │
│              │                                              │
│              ▼                                              │
│        fetch /api/search/users?q={query}&limit=5            │
│              │                                              │
│        ┌─────┴──────┐                                       │
│        │            │                                       │
│       200          Error                                     │
│        │            │                                       │
│        ▼            ▼                                       │
│  store in cache   setError(msg)                             │
│  setSuggestions(data)                                       │
│        │                                                    │
│        ▼                                                    │
│  [Suggestions Dropdown]                                     │
│      │                                                      │
│      ├─ loading → <Spinner>                                 │
│      ├─ error → <ErrorMessage>                              │
│      ├─ empty → <EmptyState>                                │
│      └─ results → <SuggestionItem> × 5                     │
│            │  highlighted if selectedIndex matches          │
│            │  onClick → selectSuggestion()                  │
│            │                                                │
│            ▼                                                │
│  onSelect(suggestion) fires → parent handles it             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key decisions:**

| Decision | Why |
|----------|-----|
| Debounce at 300ms | Reduces API calls by ~80% |
| Cache with useRef | Instant repeat queries, no re-renders |
| AbortController | Cancels stale requests, prevents race conditions |
| selectedIndex = -1 default | User hasn't navigated yet, nothing pre-selected |
| 150ms blur delay | Prevents dropdown closing before click registers |
| ARIA combobox pattern | Screen reader support |
| encodeURIComponent | Safe URL encoding, prevents injection |
| React.memo on SuggestionItem | Prevents unnecessary re-renders on navigation |

---

**Interviewer:**

Good summary. Last question — what would you add if we had another 30 minutes?

---

**Candidate:**

In priority order:

1. **Recent searches** — show the user's last 5 searches before they type anything. Store in localStorage. This is high value, low effort.

2. **Query highlight** — bold the matching portion of each suggestion. Shows the user exactly why that result matched.

3. **Category sections** — group results: "People matching john", "Channels matching john". More context, especially useful when the search covers multiple entity types.

4. **Offline handling** — detect `navigator.onLine === false` and show "You appear to be offline" instead of a failed search state.

5. **Analytics** — track selected suggestion index, zero-result queries, and average time-to-selection for product insights.

---

**Interviewer:**

That was a thorough walkthrough. Nice work.

---

## ─────────────────────────────────────
## POST-INTERVIEW: What Made This Answer Strong
## ─────────────────────────────────────

```
✅  Asked clarifying questions before designing
✅  Showed the problem FIRST (5 API calls) before showing the solution (debounce)
✅  Distinguished debounce vs throttle with a clear use case comparison
✅  Explained WHY useRef vs useState for cache — not just what
✅  Named the race condition clearly before solving it
✅  Knew AbortController and the fallback alternative
✅  Covered the 150ms blur delay edge case (shows real experience)
✅  Mentioned ARIA attributes with correct role names
✅  Scaled from component to production concerns organically
✅  Gave a prioritized list of follow-up features at the end
```

---

## What Would Have Hurt the Score

```
❌  Starting to build without asking requirements
❌  Only mentioning debounce without explaining WHY
❌  Not knowing about race conditions
❌  Using useState for the cache (would have triggered re-renders)
❌  Saying "just close on blur" without the 150ms click-handling nuance
❌  No mention of ARIA / accessibility
❌  No mention of AbortController or any request cancellation
❌  Not explaining why useRef persists across renders
```

---

## The 10 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Debounce vs Throttle | "Why not throttle?" |
| 2 | Custom React hook | "How do you implement debounce in React?" |
| 3 | useRef vs useState | "Why useRef for the cache?" |
| 4 | Race conditions | "Request A returns after Request B. What happens?" |
| 5 | AbortController | "How do you fix the race condition?" |
| 6 | LRU Cache | "What if the cache grows to 500 entries?" |
| 7 | Keyboard navigation | "Walk me through each key" |
| 8 | ARIA accessibility | "How do you support screen readers?" |
| 9 | Virtual scroll | "API returns 500 results. Now what?" |
| 10 | Analytics thinking | "How would you add analytics?" |
