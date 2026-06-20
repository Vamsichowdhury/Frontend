# Typeahead/Autocomplete — Interview Transcript

**Level:** Easy-Medium | **Duration:** 45-60 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | High-Level Architecture | ⏹️ |
| 3 | Debouncing Implementation | ⏹️ |
| 4 | Caching Strategy | ⏹️ |
| 5 | Keyboard Navigation | ⏹️ |
| 6 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a typeahead/autocomplete component. What questions do you have?"

**What candidate should ask:**
- [ ] What data are we searching? (users, products, places?)
- [ ] Real-time as they type or wait for submit?
- [ ] How many suggestions to show?
- [ ] Should keyboard navigation be supported?
- [ ] What happens on slow network?
- [ ] Should recent searches be shown?
- [ ] Min characters before first API call?

**Interviewer answers:**
> "Search users. Real-time as they type. Show top 5. Keyboard nav is required. Show loading indicator. Min 2 characters."

**Candidate response:** *(write your response here)*

---

# Phase 2 — High-Level Architecture

**Interviewer:**
> "Walk me through your architecture before writing code."

**Expected components:**
```
<Typeahead onSelect={fn}>
├── <InputField>
└── <SuggestionsDropdown>   (only when open)
    ├── <LoadingSpinner>
    ├── <SuggestionItem> × N  (highlighted if active)
    └── <EmptyState>
```

**Expected state:**
```javascript
const [inputValue, setInputValue] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [loading, setLoading] = useState(false);
const [selectedIndex, setSelectedIndex] = useState(-1);
```

**Interviewer pushback:**
> "Should the dropdown be part of Typeahead or a separate component?"

**Expected:** Separate — keeps each component focused; Typeahead manages logic, Dropdown handles display.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Debouncing

**Interviewer:**
> "Without any optimization, what happens when the user types quickly?"

**Expected problem description:**
> "An API call fires on every keystroke — typing 'react' sends 5 calls. Wastes bandwidth, overloads server, shows flickering results."

**Expected debounce solution:**
```javascript
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const debouncedQuery = useDebounce(inputValue, 300);

useEffect(() => {
  if (debouncedQuery.length >= 2) fetchSuggestions(debouncedQuery);
}, [debouncedQuery]);
```

**Interviewer pushback:**
> "300ms — why not 100ms or 1000ms?"

**Expected:** 100ms may still fire too often. 1000ms feels sluggish. 300ms is the sweet spot — fast enough for UX, slow enough to reduce calls by ~80%.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Caching

**Interviewer:**
> "User searches 'john', sees results, clears input, types 'john' again. What happens?"

**Expected problem:** Another API call — wasteful. Results won't change in seconds.

**Expected cache solution:**
```javascript
const cache = useRef({});

const fetchSuggestions = async (query) => {
  if (cache.current[query]) {
    setSuggestions(cache.current[query]);
    return;
  }
  setLoading(true);
  const data = await callAPI(query);
  cache.current[query] = data;
  setSuggestions(data);
  setLoading(false);
};
```

**Interviewer pushback:**
> "Cache grows indefinitely. Is that a problem?"

**Expected:** In a session, fine. For production: LRU cache with max size (50 entries), or TTL (expire after 5 minutes). Users rarely search 50 different queries in one session.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Keyboard Navigation

**Interviewer:**
> "Implement keyboard navigation — arrow keys, Enter, Escape."

**Expected:**
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

**Interviewer pushback:**
> "Why `e.preventDefault()` on arrow keys?"

**Expected:** Arrow keys in an input move the text cursor by default. We want to move suggestion selection instead, so we prevent the default behavior.

**Candidate response:** *(write your response here)*

---

# Phase 6 — Edge Cases & Follow-ups

**Interviewer:**
> "What if two requests are sent and the slower one responds last?"

**Expected race condition explanation + fix:**
```javascript
// Track which query is "current"
const currentQuery = useRef("");

const fetchSuggestions = async (query) => {
  currentQuery.current = query;
  const data = await callAPI(query);
  // Only update state if this query is still current
  if (currentQuery.current === query) {
    setSuggestions(data);
  }
};
```

**Interviewer:**
> "How would you make this accessible for screen readers?"

**Expected ARIA:**
```jsx
<input role="combobox" aria-expanded={isOpen} aria-autocomplete="list" />
<ul role="listbox">
  <li role="option" aria-selected={i === selectedIndex}>...</li>
</ul>
```

**Interviewer final question:**
> "Scale this to millions of users. What changes?"

**Expected:** Backend changes (Redis cache, search index like Elasticsearch). Frontend: same — debounce + cache already handle client-side scale.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
