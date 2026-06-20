# Typeahead/Autocomplete - System Design Overview

**Level:** Easy-Medium  
**Time to Solve:** 45-60 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a typeahead/autocomplete component where:
- Suggestions appear as user types
- API called with debounce (not on every keystroke)
- Results cached to avoid duplicate API calls
- Keyboard navigation (arrows, enter, escape)
- Loading, error, and empty states
- Works accessibly with screen readers

---

## Real-World Examples

- Google Search suggestions
- Twitter @mention search
- Slack user/channel search
- Figma asset search
- GitHub file search (Cmd+P)

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Debouncing | Critical performance pattern |
| Caching | Avoid redundant network calls |
| Keyboard event handling | Arrow keys, Enter, Escape |
| Request deduplication | Race condition awareness |
| Async state management | loading, error, suggestions |
| Accessibility | ARIA combobox pattern |

---

## What You'll Learn

- Debounce: delay API calls until user stops typing
- Custom `useDebounce` hook pattern
- In-memory cache with `useRef`
- Keyboard navigation state management
- Race conditions in async code and how to fix them
- ARIA combobox accessibility pattern
- `useEffect` cleanup to avoid stale state

---

## High-Level Architecture

```
<Typeahead onSelect={fn} />
├── <InputField />           (controlled input)
└── <SuggestionsDropdown />  (conditionally rendered)
    ├── <LoadingState />
    ├── <ErrorState />
    ├── <EmptyState />
    └── <SuggestionsList />
        └── <SuggestionItem /> × N  (highlighted if selected)
```

---

## Data Structure

```javascript
// State
const [inputValue, setInputValue] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [selectedIndex, setSelectedIndex] = useState(-1); // -1 = none

// Cache (useRef — no re-render needed)
const cache = useRef({});

// API Response
{
  "results": [
    { "id": "1", "name": "React", "description": "JS library" },
    ...
  ]
}
```

---

## Data Flow

```
User types "r":
  → setInputValue("r")
  → debounce timer starts (300ms)

User types "re" before 300ms:
  → clear previous timer
  → new 300ms timer starts

User types "react" (stops typing):
  → 300ms passes
  → check cache["react"] — miss
  → setLoading(true)
  → API call: /search?q=react
  → store in cache["react"] = results
  → setSuggestions(results)
  → setLoading(false)

User types "react" again (same session):
  → cache["react"] exists
  → return cached results instantly (no API call)

User presses ArrowDown:
  → selectedIndex++

User presses Enter:
  → select suggestions[selectedIndex]
  → clear dropdown

User presses Escape:
  → close dropdown
  → reset selectedIndex
```

---

## Key Concepts to Learn

### 1. Custom useDebounce Hook
```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cancel on next change
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedQuery = useDebounce(inputValue, 300);

useEffect(() => {
  if (debouncedQuery) fetchSuggestions(debouncedQuery);
}, [debouncedQuery]);
```

### 2. Cache with useRef
```javascript
const cache = useRef({});

const fetchSuggestions = async (query) => {
  if (cache.current[query]) {          // cache hit
    setSuggestions(cache.current[query]);
    return;
  }
  setLoading(true);
  const data = await callAPI(query);
  cache.current[query] = data;         // store in cache
  setSuggestions(data);
  setLoading(false);
};
```

### 3. Keyboard Navigation
```javascript
const handleKeyDown = (e) => {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
      break;
    case "ArrowUp":
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
      break;
    case "Enter":
      if (selectedIndex >= 0) onSelect(suggestions[selectedIndex]);
      break;
    case "Escape":
      setSuggestions([]);
      setSelectedIndex(-1);
      break;
  }
};
```

### 4. Race Condition Fix
```javascript
// Problem: response for "re" arrives after response for "react"
// Fix: only apply result if query still matches current input

const fetchSuggestions = async (query) => {
  const data = await callAPI(query);
  // Check if input changed while waiting
  if (query === inputValueRef.current) {
    setSuggestions(data);
  }
};
```

---

## Implementation Phases

### Phase 1 — Input + Dropdown
- Controlled input
- Show/hide dropdown on focus/blur
- Render suggestion items

### Phase 2 — Debouncing
- useDebounce hook
- Trigger API call on debouncedQuery change

### Phase 3 — Caching
- useRef cache
- Check cache before API call
- Store response in cache

### Phase 4 — Keyboard Navigation
- selectedIndex state
- KeyDown handler
- Highlight selected item in list

### Phase 5 — States + Edge Cases
- Loading spinner
- Error message
- Empty state ("No results for X")
- Close on outside click

---

## Performance Considerations

- Debounce delay: 300ms is standard (not too fast, not too slow)
- Cache: grows in memory — add max size or TTL for production
- Virtual scroll: if returning 100+ suggestions
- Memoize SuggestionItem with React.memo

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Empty input | Don't trigger API, close dropdown |
| API returns stale results | Race condition fix (ref comparison) |
| Very fast typing | Debounce handles this |
| User deleted from DB (stale cache) | TTL on cache, or skip cache |
| Special characters | encodeURIComponent |
| Click outside dropdown | onBlur + mousedown event handling |
| Min character threshold | Only search if query.length >= 2 |

---

## Interview Tips for This Question

- This is the most commonly asked FE design question
- Lead with debouncing — interviewers expect you to mention it
- Mention caching early: "to avoid hitting the API for repeated searches"
- Discuss race conditions if you want to stand out
- Ask: "Should recent searches be shown before user types?"

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| Calls API on every keystroke | Implements debounce from day 1 |
| No caching | useRef cache for instant repeat lookups |
| No keyboard navigation | Full keyboard + ARIA support |
| Ignores race conditions | Mentions and solves stale responses |
| Single useState file | Clean component split + custom hook |
