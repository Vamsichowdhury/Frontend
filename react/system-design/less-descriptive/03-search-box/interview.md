# Search Box with Results — Interview Transcript

**Level:** Easy-Medium | **Duration:** 35-45 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Architecture & State Design | ⏹️ |
| 3 | API Integration | ⏹️ |
| 4 | Loading, Error & Empty States | ⏹️ |
| 5 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a search feature. What do you need to clarify?"

**What candidate should ask:**
- [ ] On keypress (real-time) or on submit (Enter/button)?
- [ ] What are we searching? (products, users, articles?)
- [ ] How many results to show?
- [ ] Paginated results or one page?
- [ ] Should results be highlighted/ranked?
- [ ] Mobile support needed?

**Interviewer answers:**
> "On submit for now. We're searching products. Show top 10. No pagination needed initially. No highlight required."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Architecture & State Design

**Interviewer:**
> "What components and state do you need?"

**Expected components:**
```
<SearchPage>
├── <SearchForm>    (input + button)
└── <SearchResults>
    ├── <LoadingSpinner>
    ├── <ErrorMessage>
    ├── <EmptyState>
    └── <ResultsList>
        └── <ResultItem> × N
```

**Expected state:**
```javascript
const [query, setQuery] = useState("");
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**Interviewer pushback:**
> "Why four separate state variables? Could you use one object?"

**Expected:** Could use `{ results, loading, error }` but React batches updates, so separate states are fine. Some prefer useReducer for this.

**Candidate response:** *(write your response here)*

---

# Phase 3 — API Integration

**Interviewer:**
> "Show me the fetch logic."

**Expected:**
```javascript
const handleSearch = async () => {
  if (!query.trim()) return;
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    setResults(data.results);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Interviewer pushback:**
> "What does `encodeURIComponent` do and why is it needed?"

**Expected:** Encodes special characters like spaces, &, ? so the URL is valid. Without it, searching "react & vue" would break the query string.

**Candidate response:** *(write your response here)*

---

# Phase 4 — States & Rendering

**Interviewer:**
> "How do you decide what to render? Walk me through the conditions."

**Expected logic:**
```jsx
{loading && <Spinner />}
{error && <ErrorMessage message={error} onRetry={handleSearch} />}
{!loading && !error && results.length === 0 && query && <EmptyState query={query} />}
{!loading && !error && results.length > 0 && <ResultsList items={results} />}
```

**Interviewer pushback:**
> "What's the 'idle' state — before any search is submitted?"

**Expected:** Don't show empty state on load. Only show it after a search was submitted with no results. Track `hasSearched` flag or check `query !== ""`.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Edge Cases & Follow-ups

**Interviewer:**
> "What happens if the user searches, then changes the query mid-fetch?"

**Expected:** AbortController cancels the in-flight request. Without it, stale results from old query might overwrite new results.

**Expected:**
```javascript
const abortControllerRef = useRef(null);

const handleSearch = async () => {
  abortControllerRef.current?.abort(); // cancel previous
  abortControllerRef.current = new AbortController();

  const res = await fetch(url, { signal: abortControllerRef.current.signal });
};
```

**Interviewer final question:**
> "How would you convert this to real-time (search as you type)?"

**Expected:** Add debounce — delay API call until user stops typing for 300ms. Connects to Typeahead pattern.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
