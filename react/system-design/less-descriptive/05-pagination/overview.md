# Pagination Component - System Design Overview

**Level:** Easy-Medium  
**Time to Solve:** 35-50 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a reusable pagination component where:
- Data is fetched page by page from an API
- User can navigate to prev/next page
- User can jump to a specific page number
- First and last page buttons optionally shown
- URL reflects current page (?page=3)
- Page numbers intelligently truncate for large page counts

---

## Real-World Examples

- GitHub pull requests list
- E-commerce product listing
- Admin dashboard tables
- Search results pages
- Blog article lists

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Math/calculation logic | Computing page ranges |
| Query params / URL sync | Persist state in URL |
| API design | Query string parameters |
| Reusable component design | Generic, configurable |
| Edge cases | First page, last page, 1 page total |

---

## What You'll Learn

- Pagination math (totalPages, currentPage, startItem, endItem)
- URL synchronization with `useSearchParams` (React Router)
- Truncated page number ranges (1 ... 4 5 6 ... 20)
- API query params pattern (`?page=2&limit=10`)
- Difference between pagination vs infinite scroll
- Controlled vs URL-driven state

---

## High-Level Architecture

```
<ProductsPage />
├── <DataTable data={currentPageData} />
└── <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
    ├── <FirstButton />
    ├── <PrevButton />
    ├── <PageNumbers />   (truncated range)
    ├── <NextButton />
    └── <LastButton />
```

---

## Data Structure

```javascript
// Component props
{
  currentPage: 3,
  totalPages: 20,
  totalItems: 198,
  itemsPerPage: 10,
  onPageChange: (page) => void
}

// State in parent
const [currentPage, setCurrentPage] = useState(1);
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

// API Request
GET /api/products?page=3&limit=10

// API Response
{
  "data": [...],
  "meta": {
    "currentPage": 3,
    "totalPages": 20,
    "totalItems": 198,
    "itemsPerPage": 10
  }
}
```

---

## Data Flow

```
Component mounts:
  → read page from URL (?page=1 default)
  → fetch /api/products?page=1&limit=10
  → render data + pagination

User clicks page 3:
  → setCurrentPage(3)
  → update URL to ?page=3
  → fetch /api/products?page=3&limit=10
  → render new data

User clicks Next:
  → if currentPage < totalPages: go to currentPage + 1

User clicks Prev:
  → if currentPage > 1: go to currentPage - 1

User types page number:
  → validate range (1 to totalPages)
  → navigate to that page
```

---

## Key Concepts to Learn

### 1. Pagination Math
```javascript
const totalPages = Math.ceil(totalItems / itemsPerPage);
const startItem = (currentPage - 1) * itemsPerPage + 1;
const endItem = Math.min(currentPage * itemsPerPage, totalItems);

// "Showing 21-30 of 198 results"
`Showing ${startItem}-${endItem} of ${totalItems} results`
```

### 2. Truncated Page Numbers
```javascript
// Shows: 1 ... 4 5 6 ... 20 (when on page 5 of 20)
function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];

  return [1, "...", current-1, current, current+1, "...", total];
}
```

### 3. URL Synchronization
```javascript
// React Router v6
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const currentPage = parseInt(searchParams.get("page") || "1");

const handlePageChange = (page) => {
  setSearchParams({ page: page.toString() });
};
```

### 4. API Call on Page Change
```javascript
useEffect(() => {
  setLoading(true);
  fetch(`/api/products?page=${currentPage}&limit=${pageSize}`)
    .then(res => res.json())
    .then(data => {
      setData(data.results);
      setTotalPages(data.meta.totalPages);
    })
    .finally(() => setLoading(false));
}, [currentPage]);
```

---

## Implementation Phases

### Phase 1 — Static Pagination UI
- Prev/Next buttons
- Page number display
- Disabled states

### Phase 2 — Page Logic
- currentPage state
- Math calculations
- Click handlers

### Phase 3 — API Integration
- Fetch on page change
- Loading state
- Data display

### Phase 4 — Truncated Range
- getPageRange() helper
- Ellipsis rendering

### Phase 5 — URL Sync
- useSearchParams
- Back button works
- Shareable URLs

---

## Performance Considerations

- Don't prefetch all pages (wasteful)
- Optionally prefetch next page for smoother UX
- Skeleton loader instead of spinner for better perceived performance
- Debounce direct page number input

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Only 1 page | Hide pagination completely |
| Navigate to non-existent page | Clamp to valid range |
| API returns 0 results | Show empty state, hide pagination |
| Fast clicking next | Debounce or disable while loading |
| URL has invalid page number | Fallback to page 1 |
| Items deleted → fewer pages | Recalculate on each fetch |

---

## Interview Tips for This Question

- Ask: "Should the URL update on page change?" — shows URL thinking
- Ask: "What's the default page size? Can user change it?"
- Discuss tradeoffs: pagination vs infinite scroll
- Mention accessibility: aria-current="page" on active page

---

## Pagination vs Infinite Scroll

| Feature | Pagination | Infinite Scroll |
|---------|-----------|----------------|
| Navigation | Direct to any page | Forward only |
| URL shareable | Yes (?page=5) | Hard |
| User orientation | Know exactly where they are | Easy to get lost |
| Performance | Load per page | Continuous loading |
| Use case | Tables, search results | Feeds, social media |
