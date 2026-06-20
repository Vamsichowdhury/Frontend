# Search Box with Results - System Design Overview

**Level:** Easy-Medium  
**Time to Solve:** 35-45 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a search feature where:
- User types a query and submits
- API is called with the query
- Results are displayed in a list
- Loading state shown during fetch
- Error state shown on failure
- Empty state shown when no results

---

## Real-World Examples

- Google search results page
- Amazon product search
- GitHub repository search
- E-commerce product listing

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| API integration | Core async data fetching |
| Async state management | loading, error, data states |
| useEffect with dependencies | Trigger fetch on query change |
| Error boundaries | Graceful degradation |
| Conditional rendering | 4 states: idle/loading/error/results |
| Form handling | Controlled input, submit event |

---

## What You'll Learn

- The fetch lifecycle (idle → loading → success/error)
- Managing 3 state variables (data, loading, error)
- AbortController to cancel in-flight requests
- useEffect dependency array best practices
- Conditional rendering patterns
- Basic accessibility for search (role, aria-label)

---

## High-Level Architecture

```
<SearchPage />
├── <SearchForm />    (input + search button)
└── <SearchResults />
    ├── <LoadingSpinner />    (while fetching)
    ├── <ErrorMessage />      (on API error)
    ├── <EmptyState />        (no results)
    └── <ResultsList />       (success with data)
        └── <ResultItem /> × N
```

---

## Data Structure

```javascript
// State
const [query, setQuery] = useState("");
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// API Response Shape
{
  "total": 42,
  "results": [
    { "id": 1, "title": "React Docs", "url": "...", "snippet": "..." },
    ...
  ]
}
```

---

## Data Flow

```
User types in input → update query state (controlled input)

User submits form:
  → setLoading(true), setError(null)
  → fetch(`/api/search?q=${query}`)
  → on success: setResults(data), setLoading(false)
  → on error: setError("Something went wrong"), setLoading(false)

Display Logic:
  → loading === true → show spinner
  → error !== null → show error message
  → results.length === 0 → show empty state
  → results.length > 0 → show results list
```

---

## Key Concepts to Learn

### 1. Async Fetch with State
```javascript
const handleSearch = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();
    setResults(data.results);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 2. AbortController (cancel stale requests)
```javascript
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => setResults(data.results))
    .catch(err => {
      if (err.name !== "AbortError") setError(err.message);
    });

  return () => controller.abort(); // cancel on cleanup
}, [query]);
```

### 3. Conditional Rendering Pattern
```jsx
return (
  <div>
    {loading && <Spinner />}
    {error && <ErrorMessage message={error} />}
    {!loading && !error && results.length === 0 && query && <EmptyState />}
    {!loading && !error && results.length > 0 && <ResultsList items={results} />}
  </div>
);
```

---

## Implementation Phases

### Phase 1 — Static UI
- Input + button layout
- Results list with dummy data

### Phase 2 — Controlled Input
- Connect input to state
- Handle form submit

### Phase 3 — API Integration
- Fetch on submit
- Parse and display results

### Phase 4 — State Management
- Loading state
- Error state
- Empty state

### Phase 5 — Refinements
- Sanitize query (trim, encode)
- Abort in-flight requests
- Accessibility attributes

---

## Performance Considerations

- `encodeURIComponent` query before sending to API
- Debounce if switching to real-time search
- Paginate results (don't fetch all at once)
- Memoize result items with `React.memo`

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Empty query submitted | Trim, block empty searches |
| Query with special chars | encodeURIComponent |
| API returns 500 | Show user-friendly error |
| Network offline | Catch fetch error, show message |
| Query changes mid-flight | AbortController to cancel previous |
| Very long result snippets | Truncate with CSS line-clamp |

---

## Interview Tips for This Question

- Ask: "On keypress (real-time) or on submit?" — big difference
- If real-time, debounce becomes important (connects to Typeahead)
- Mention AbortController — shows you understand async cleanup
- Talk about pagination for large result sets

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| Only handles success state | Handles loading, error, empty states |
| No input sanitization | Trims and encodes query |
| No request cancellation | Implements AbortController |
| Single useState for everything | Clean separate state variables |
| No pagination mentioned | Discusses pagination for large results |
