# Data Table — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~50 minutes
**Interviewer style:** Will push on multi-column sort (the direction cycle and order-of-sorts), the useMemo pipeline, and virtual scroll. Will probe the shift-click range selection and CSV export edge cases.

---

> **How to use this file:**
> The sorting system (Phase 3) is the dramatic centre — multi-column sort with the three-state cycle (none → asc → desc → none) is more nuanced than it first appears. The useMemo pipeline (Phase 4) is the second most important area — filter → sort → paginate in the correct sequence. Virtual scroll (Phase 6) is where most mid-level candidates struggle to explain the mechanics.

---

## ─────────────────────────────────────
## PHASE 1 — Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design a data table component — like AG Grid or a CRM table. Go ahead.

---

**Candidate:**

A few questions to scope the requirements.

---

**Q1. How many rows — hundreds or tens of thousands?**

> **Why ask this:** This determines whether virtual scrolling is required. For 500 rows, you can render them all. For 10,000 rows, rendering all 10,000 DOM elements freezes the browser — virtual scroll is mandatory. This single number is the biggest architectural decision.

---

**Q2. Is sorting and filtering client-side or server-side?**

> **Why ask this:** Client-side: filter/sort the loaded data in memory with `useMemo`. Fast for small-medium datasets.
> Server-side: every sort/filter change triggers an API call. Required for huge datasets (millions of rows) where you can't load everything at once.
> The implementation is completely different. Client-side is in-memory JavaScript. Server-side is debounced API calls with loading states.

---

**Q3. Multi-column sort — can the user sort by multiple columns simultaneously?**

> **Why ask this:** Single-column sort (click header, toggle asc/desc) is straightforward. Multi-column sort (sort by department ASC, then by age DESC within department) is significantly more complex — you need an ordered array of sort configs, a direction cycle per column, and a visual indicator showing sort priority.

---

**Q4. Row selection — just click, or also shift-click range selection?**

> **Why ask this:** Shift-click range selection requires tracking the last-selected index as an anchor and filling all rows between the anchor and the new click. Without shift-click, selection is just a Set that toggles on click. Asking signals you know range selection has state complexity.

---

**Q5. Column resizing?**

> **Why ask this:** Column resize requires `mousedown` on the column border, then `document.addEventListener("mousemove")` to track drag delta. The event must be on `document` not just the column — otherwise fast mouse movement outside the column loses the drag. This is a non-trivial DOM detail.

---

**Interviewer:**

10,000 rows — yes, need virtual scroll. Client-side sort/filter. Yes, multi-column sort. Yes, shift-click range. Yes, column resize.

---

**Candidate:**

Good. Ten thousand rows makes virtual scroll mandatory. Multi-column sort and shift-click are the most interesting interaction problems. Let me start with the state architecture.

---

## ─────────────────────────────────────
## PHASE 2 — Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the state structure and column definition model.

---

**Candidate:**

Everything starts with the column definition — a config array that drives all behaviour:

```javascript
const columnDefs = [
  { key: "name",   header: "Name",   type: "text",   sortable: true, filterable: true, width: 200, visible: true },
  { key: "age",    header: "Age",    type: "number", sortable: true, filterable: true, width: 80  },
  { key: "email",  header: "Email",  type: "text",   sortable: false, width: 250 },
  { key: "status", header: "Status", type: "text",   sortable: true, width: 100 },
  { key: "salary", header: "Salary", type: "number", sortable: true, width: 120,
    render: (v) => `₹${v.toLocaleString()}` }
];
```

Table-level state:

```javascript
const [data,          setData]          = useState(originalData); // 10k rows
const [sortConfig,    setSortConfig]    = useState([]);  // array for multi-column
const [filters,       setFilters]       = useState({});  // { key: filterConfig }
const [selectedRows,  setSelectedRows]  = useState(new Set()); // Set of row IDs
const [columnWidths,  setColumnWidths]  = useState(
  Object.fromEntries(columnDefs.map(c => [c.key, c.width]))
);
const [visibleCols,   setVisibleCols]   = useState(
  new Set(columnDefs.map(c => c.key))
);
const lastSelectedIdx = useRef(null);  // for shift-click range
```

---

## ─────────────────────────────────────
## PHASE 3 — Multi-Column Sorting
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the sort implementation — specifically multi-column sort.

---

**Candidate:**

`sortConfig` is an ordered array of `{ key, direction }` objects. The array order matters — first element is primary sort, second is secondary, and so on:

```javascript
// Example: Sort by department ASC, then within department by age DESC
sortConfig = [
  { key: "department", direction: "asc" },
  { key: "age",        direction: "desc" }
]
```

Clicking a column header cycles through three states:

```
Not in sortConfig  → add as "asc"
Currently "asc"    → change to "desc"
Currently "desc"   → remove from sortConfig entirely
```

```javascript
const cycleSort = (columnKey) => {
  setSortConfig(prev => {
    const existing = prev.find(s => s.key === columnKey);

    if (!existing) {
      // Not sorted → add as asc (append to end of sort priority)
      return [...prev, { key: columnKey, direction: "asc" }];
    }
    if (existing.direction === "asc") {
      // asc → desc
      return prev.map(s => s.key === columnKey ? { ...s, direction: "desc" } : s);
    }
    // desc → remove
    return prev.filter(s => s.key !== columnKey);
  });
};
```

Column header shows the sort direction AND its priority number:

```jsx
<th onClick={() => cycleSort(col.key)}>
  {col.header}
  {sortInfo && (
    <>
      <span>{sortInfo.direction === "asc" ? " ↑" : " ↓"}</span>
      {sortConfig.length > 1 && (
        <sup className="sort-priority">{sortConfig.indexOf(sortInfo) + 1}</sup>
      )}
    </>
  )}
</th>
// Result: "Age ↑²" means sorted ascending, second priority
```

The actual sort:

```javascript
const sortedData = useMemo(() => {
  if (sortConfig.length === 0) return filteredData;

  return [...filteredData].sort((a, b) => {  // ← spread to avoid mutating filteredData
    for (const { key, direction } of sortConfig) {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) continue; // equal on this key → check next sort key
      if (aVal == null) return 1;  // nulls sort last
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return direction === "asc" ? cmp : -cmp;
    }
    return 0; // all sort keys equal → preserve original order (stable)
  });
}, [filteredData, sortConfig]);
```

---

**Interviewer:**

Why `[...filteredData].sort()` instead of `filteredData.sort()`?

---

**Candidate:**

`Array.sort()` mutates the array in place. `filteredData` is the result of a `useMemo` — mutating it would corrupt the cached value. The next render might read the already-sorted array as if it were the original filtered data.

Spread first creates a shallow copy:

```javascript
// Mutates original — NEVER do this with state or memo values:
filteredData.sort(...)  // ❌ corrupts filteredData

// Creates copy first, then sorts the copy:
[...filteredData].sort(...)  // ✅
```

This is the same reasoning as anywhere you sort in React — you never sort state directly.

---

## ─────────────────────────────────────
## PHASE 4 — Per-Column Filtering
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the filter implementation — different filter types per column.

---

**Candidate:**

Each column has a filter input below the header. The filter type depends on the column's data type:

```javascript
const filteredData = useMemo(() => {
  return data.filter(row =>
    Object.entries(filters).every(([key, filter]) => {
      const val = row[key];
      if (val === undefined || val === null) return false;

      switch (filter.type) {
        case "contains":
          return String(val).toLowerCase().includes(filter.value.toLowerCase());
        case "equals":
          return String(val) === filter.value;
        case "startsWith":
          return String(val).toLowerCase().startsWith(filter.value.toLowerCase());
        case "gte":  // number: greater than or equal
          return Number(val) >= Number(filter.value);
        case "lte":  // number: less than or equal
          return Number(val) <= Number(filter.value);
        case "range": // number: between min and max
          return Number(val) >= filter.min && Number(val) <= filter.max;
        case "before": // date
          return new Date(val) < new Date(filter.value);
        case "after":
          return new Date(val) > new Date(filter.value);
        case "boolEq":
          return Boolean(val) === filter.value;
        default:
          return true;
      }
    })
  );
}, [data, filters]);
```

All active filters use AND logic — a row must pass every filter to be included.

---

**Interviewer:**

The price range filter is a slider. User drags it — do you filter on every pixel drag?

---

**Candidate:**

No — same reasoning as Amazon's price range filter. Two-tier state:

```javascript
// Slider's visual position (instant response)
const [priceSlider, setPriceSlider] = useState([0, 200000]);

// Debounced value that actually triggers filtering
const debouncedPrice = useDebounce(priceSlider, 400);

// Update filter state only after debounce
useEffect(() => {
  setFilters(prev => ({
    ...prev,
    salary: { type: "range", min: debouncedPrice[0], max: debouncedPrice[1] }
  }));
}, [debouncedPrice]);
```

The slider moves instantly. The filter (and `useMemo` recomputation) fires only after the user stops dragging for 400ms.

---

## ─────────────────────────────────────
## PHASE 5 — Row Selection
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through shift-click range selection.

---

**Candidate:**

The key is tracking the "anchor" index — the last row clicked without shift. Shift-click fills from that anchor to the new click:

```javascript
const handleRowClick = (rowIndex, isShiftKey) => {
  if (isShiftKey && lastSelectedIdx.current !== null) {
    // Fill the range between anchor and current click
    const start = Math.min(lastSelectedIdx.current, rowIndex);
    const end   = Math.max(lastSelectedIdx.current, rowIndex);

    setSelectedRows(prev => {
      const next = new Set(prev);
      for (let i = start; i <= end; i++) {
        next.add(sortedData[i].id); // use row ID, not index
      }
      return next;
    });
    // Don't update lastSelectedIdx — anchor stays fixed for further shift-clicks
  } else {
    // Normal click: toggle this row, update anchor
    setSelectedRows(prev => {
      const next = new Set(prev);
      const rowId = sortedData[rowIndex].id;
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
    lastSelectedIdx.current = rowIndex;
  }
};
```

Select-all checkbox:

```javascript
const allSelected = sortedData.length > 0 &&
  sortedData.every(row => selectedRows.has(row.id));

const handleSelectAll = (checked) => {
  if (checked) {
    setSelectedRows(new Set(sortedData.map(r => r.id)));
    lastSelectedIdx.current = sortedData.length - 1;
  } else {
    setSelectedRows(new Set());
    lastSelectedIdx.current = null;
  }
};
```

---

**Interviewer:**

Why store selected row IDs (from `row.id`) rather than row indices?

---

**Candidate:**

Indices are unstable — when the user applies a filter, row 5 might become row 2. If I stored index 5 as selected, after filtering row 2 (formerly row 5) would appear selected, which is wrong. Row 5 in the original data might not even be visible anymore.

IDs are stable — they refer to the actual data record regardless of what sort or filter is applied. Row with ID `user_123` stays `user_123` whether it's at index 5, 2, or filtered out entirely.

```javascript
// After filtering, check: is this row selected?
const isSelected = selectedRows.has(row.id);  // ✅ always correct
// NOT: const isSelected = selectedRows.has(rowIndex);  // ❌ breaks on sort/filter
```

---

## ─────────────────────────────────────
## PHASE 6 — Virtual Scroll
## ─────────────────────────────────────

---

**Interviewer:**

You have 10,000 rows. Walking me through how virtual scroll works.

---

**Candidate:**

The problem: 10,000 `<tr>` elements × ~5 DOM nodes each = 50,000 DOM nodes. The browser lays out all of them even if only 20 are visible. Scroll becomes slow, memory balloons.

Virtual scroll's trick: make the container LOOK like it has 10,000 rows (maintaining the correct scroll bar height), while only rendering 20–30 rows at any time.

```javascript
const ROW_HEIGHT = 40; // fixed height per row (px)
const OVERSCAN   = 5;  // extra rows to render above/below visible area

const [scrollTop, setScrollTop] = useState(0);
const containerRef = useRef(null);
const containerHeight = 600; // visible viewport height

const totalHeight  = sortedData.length * ROW_HEIGHT;
const startIndex   = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
const endIndex     = Math.min(
  sortedData.length,
  Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
);

const visibleRows = sortedData.slice(startIndex, endIndex);
const topPadding  = startIndex * ROW_HEIGHT; // space above first rendered row
```

The render:

```jsx
<div
  ref={containerRef}
  style={{ height: containerHeight, overflowY: "auto" }}
  onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
>
  {/* Full height spacer — browser draws scroll bar correctly */}
  <div style={{ height: totalHeight, position: "relative" }}>
    {/* Only visible rows, offset to correct position */}
    <table style={{ transform: `translateY(${topPadding}px)` }}>
      <tbody>
        {visibleRows.map((row, i) => (
          <TableRow key={row.id} row={row} index={startIndex + i} />
        ))}
      </tbody>
    </table>
  </div>
</div>
```

As the user scrolls:
- `scrollTop` updates
- `startIndex` and `endIndex` recompute
- `visibleRows` changes to the new window
- Only ~30 rows exist in the DOM at any time ✅

For production, I'd use `react-virtual` or `@tanstack/virtual` which handle variable row heights, horizontal virtualisation, and edge cases.

---

## ─────────────────────────────────────
## PHASE 7 — Column Resize
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through column resizing.

---

**Candidate:**

The resize handle is the right border of each column header. Dragging it changes that column's width:

```javascript
const handleResizeStart = (e, columnKey) => {
  e.preventDefault();
  const startX     = e.clientX;
  const startWidth = columnWidths[columnKey];

  const onMouseMove = (moveEvent) => {
    const delta    = moveEvent.clientX - startX;
    const newWidth = Math.max(50, startWidth + delta); // min 50px
    setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup",  onMouseUp);
  };

  // Attach to document — not to the header element!
  // This allows the mouse to move outside the column without losing the drag
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup",   onMouseUp);
};
```

The resize handle element:

```jsx
<div
  className="resize-handle"
  style={{
    position: "absolute", right: 0, top: 0,
    width: 4, height: "100%",
    cursor: "col-resize",
    userSelect: "none"
  }}
  onMouseDown={e => handleResizeStart(e, col.key)}
/>
```

Why `document.addEventListener` rather than the element's `onMouseMove`? Because if the user drags fast, the cursor leaves the narrow resize handle element. If the handler is only on the element, the drag stops. Attaching to `document` captures mouse movement anywhere on the page.

---

## ─────────────────────────────────────
## PHASE 8 — CSV Export
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the CSV export.

---

**Candidate:**

Export applies to the currently filtered + sorted data. Only visible columns are included.

```javascript
const exportCSV = () => {
  const activeCols = columnDefs.filter(c => visibleCols.has(c.key));

  // Header row
  const header = activeCols.map(c => escapeCSV(c.header)).join(",");

  // Data rows
  const rows = sortedData.map(row =>
    activeCols.map(col => {
      const raw = row[col.key];
      // If column has a custom render, don't use it for CSV (it returns JSX)
      // Use raw value, formatted appropriately
      return escapeCSV(raw === null || raw === undefined ? "" : String(raw));
    }).join(",")
  );

  const csv = [header, ...rows].join("\n");

  // BOM (﻿) ensures Excel opens UTF-8 correctly on Windows
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href     = url;
  link.download = "export.csv";
  link.click();

  URL.revokeObjectURL(url); // clean up memory
};
```

The `escapeCSV` function handles RFC 4180 quoting:

```javascript
const escapeCSV = (value) => {
  const str = String(value);
  // Must quote if value contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
    // Quotes inside a quoted field are doubled: " → ""
  }
  return str;
};

// Examples:
// "Hello, World"  → "Hello, World"  (quoted because of comma)
// `He said "hi"`  → "He said ""hi"""  (inner quotes doubled)
// "normal"        → normal  (no special chars, no quotes needed)
```

---

**Interviewer:**

The export should only include selected rows, not all filtered rows. How do you change it?

---

**Candidate:**

```javascript
const dataToExport = selectedRows.size > 0
  ? sortedData.filter(row => selectedRows.has(row.id))
  : sortedData; // if nothing selected, export all filtered+sorted
```

Show a tooltip on the export button: "Export 3 selected rows" when rows are selected, "Export all 1,247 rows" when nothing is selected.

---

## ─────────────────────────────────────
## PHASE 9 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

User applies a filter that returns zero rows. What shows?

---

**Candidate:**

Empty state — not a blank table:

```jsx
{sortedData.length === 0 ? (
  <tr>
    <td colSpan={visibleCols.size} className="empty-state">
      <div>
        <span>🔍</span>
        <p>No results match your filters.</p>
        <button onClick={() => setFilters({})}>Clear all filters</button>
      </div>
    </td>
  </tr>
) : (
  visibleRows.map(...)
)}
```

---

## POST-INTERVIEW ANALYSIS

```
✅  Confirmed 10k rows → virtual scroll before designing anything
✅  Column definition as config (drives all behaviour)
✅  Multi-column sort as ordered array (not a Map)
✅  Sort direction cycle: none → asc → desc → none
✅  Sort priority badge: "Age ↑²"
✅  [...filteredData].sort() — spread to avoid mutation
✅  Null handling in sort (nulls last)
✅  useMemo pipeline: filter → sort (correct order)
✅  Range slider debounce (400ms before filter triggers)
✅  lastSelectedIdx as useRef (not useState — no re-render needed)
✅  Row IDs not indices for selection (stable across sort/filter)
✅  Virtual scroll mechanics — totalHeight spacer + translateY offset
✅  Column resize on document (not element) for fast mouse moves
✅  CSV BOM (﻿) for Excel UTF-8
✅  escapeCSV with RFC 4180 double-quote escaping
✅  Export selected rows only when selection is active
```

## 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | sortConfig as ordered array | "Walk me through multi-column sort" |
| 2 | Three-state direction cycle | "Click the same column 3 times — what happens?" |
| 3 | Sort priority badge | "How does user know sort priority?" |
| 4 | [...data].sort() — no mutation | "Why spread before sort?" |
| 5 | useMemo filter → sort pipeline | "Walk me through state transforms" |
| 6 | Range slider debounce | "Drag price slider — do you filter every pixel?" |
| 7 | Row IDs vs indices | "Why store row IDs, not indices?" |
| 8 | Shift-click anchor (lastSelectedIdx) | "Walk me through shift-click range selection" |
| 9 | Virtual scroll totalHeight spacer | "10,000 rows — how does virtual scroll work?" |
| 10 | document-level resize events | "Column resize — why attach to document?" |
| 11 | CSV BOM (﻿) | "What's the BOM and why add it?" |
| 12 | escapeCSV RFC 4180 | "Value has a comma — what happens in the CSV?" |
