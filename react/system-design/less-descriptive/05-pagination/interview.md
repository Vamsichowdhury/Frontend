# Pagination Component — Interview Transcript

**Level:** Easy-Medium | **Duration:** 35-50 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | API Design & Data Structure | ⏹️ |
| 3 | Pagination Math & UI | ⏹️ |
| 4 | URL Sync & Navigation | ⏹️ |
| 5 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a pagination component for a product listing. What do you need to know?"

**What candidate should ask:**
- [ ] How many items per page? Fixed or user-selectable?
- [ ] Should URL reflect current page? (shareable)
- [ ] Show first/last buttons?
- [ ] How to handle very large page counts? (1000 pages?)
- [ ] Is data fetched per page or all loaded client-side?
- [ ] Total item count from API or computed?

**Interviewer answers:**
> "10 items per page fixed. Yes, URL should update. Show prev/next only. Truncate page numbers for large counts. Server-side pagination — fetch per page."

**Candidate response:** *(write your response here)*

---

# Phase 2 — API Design

**Interviewer:**
> "What does your API request and response look like?"

**Expected:**
```
Request: GET /api/products?page=2&limit=10

Response:
{
  "data": [...10 items...],
  "meta": {
    "currentPage": 2,
    "totalPages": 20,
    "totalItems": 198,
    "itemsPerPage": 10
  }
}
```

**Interviewer pushback:**
> "Who calculates totalPages — frontend or backend?"

**Expected:** Backend. Frontend only knows totalItems per response — backend knows the full dataset size. Frontend could calculate `Math.ceil(totalItems / itemsPerPage)` if backend sends totalItems.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Pagination Math & UI

**Interviewer:**
> "How do you calculate which page numbers to show? If there are 50 pages and we're on page 25?"

**Expected truncation logic:**
```javascript
// Shows: 1 ... 24 25 26 ... 50
function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
  return [1, "...", current-1, current, current+1, "...", total];
}
```

**Interviewer pushback:**
> "Walk me through the render logic for the ellipsis."

**Expected:** Map the array — if item is `"..."`, render a disabled `<span>` not a button; otherwise render a clickable `<button>` with active styling if it matches current page.

**Candidate response:** *(write your response here)*

---

# Phase 4 — URL Sync

**Interviewer:**
> "Why should the URL update when the user changes pages?"

**Expected:** Shareable links, browser back/forward works, refresh returns to same page, bookmarkable.

**Expected implementation:**
```javascript
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const currentPage = parseInt(searchParams.get("page") || "1");

const handlePageChange = (page) => {
  setSearchParams({ page: String(page) });
};
```

**Interviewer pushback:**
> "What happens if user manually types `?page=999` in URL but there are only 50 pages?"

**Expected:** Clamp on fetch — if API returns no results for page 999, redirect to page 1 or the last valid page.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Edge Cases & Follow-ups

**Interviewer:**
> "What if items are deleted while user is paginating — say 10 items deleted from page 3?"

**Expected:** Refetch current page after deletion. Page may have fewer items. totalPages might decrease. Frontend adjusts automatically if meta comes from API.

**Interviewer:**
> "Compare pagination vs infinite scroll. When would you use each?"

**Expected:**
- Pagination: tables, search results, admin dashboards (need to jump to page, share link)
- Infinite scroll: social feeds, photo galleries (mobile-first, continuous browsing)

**Interviewer final question:**
> "How would you add a 'jump to page' input?"

**Expected:** Input field, validate range (1 to totalPages), navigate on Enter. Debounce to avoid rapid requests if typing "25".

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
