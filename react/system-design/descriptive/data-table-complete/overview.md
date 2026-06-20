# Data Table — Interview Overview

---

## What Problem Are We Solving?

Build a feature-rich data table component for displaying and interacting with large datasets — like AG Grid, TanStack Table, or a Salesforce CRM table.

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔍 Search all columns    [Columns ▾]  [Export CSV]  3 rows selected │
├────┬──────────────┬───────────┬────────────┬────────┬──────────────┤
│ ☑  │ Name      ↕  │ Age    ↑  │ Email      │ Status │ Salary    ↕  │
│    │ (contains)   │ (range)   │ (contains) │ (=)    │ (range)      │
├────┼──────────────┼───────────┼────────────┼────────┼──────────────┤
│ ☑  │ Alice Johnson│ 29        │ alice@...  │ Active │ ₹85,000      │
│ ☑  │ Bob Smith    │ 34        │ bob@...    │ Inactive│ ₹92,000     │
│ ☐  │ Charlie Brown│ 27        │ charlie@...│ Active │ ₹71,000      │
│ ☑  │ Diana Prince │ 31        │ diana@...  │ Active │ ₹110,000     │
│    │   ···        │           │            │        │              │
│    │   10,000 more rows virtualised below  │        │              │
├────┴──────────────┴───────────┴────────────┴────────┴──────────────┤
│  Showing 1-50 of 10,247  [ < ][ 1 ][ 2 ][ 3 ]···[ 205 ][ > ]      │
└──────────────────────────────────────────────────────────────────────┘
```

Used in: Admin dashboards, CRM systems, Analytics tools, Spreadsheet-like apps, Database GUIs

---

## What Makes a Data Table Hard

```
1. Virtual scroll for 10,000+ rows
   Rendering 10,000 <tr> elements kills the browser.
   Only ~20–30 visible rows should be in the DOM.
   Must maintain correct scroll height (as if all rows exist).

2. Multi-column sort
   Clicking column header cycles: none → asc → desc → none.
   Multiple columns sorted simultaneously (sort by dept, then by age).
   Sort is client-side for loaded data or triggers API for server-side.

3. Per-column filtering by data type
   Text column:   "contains", "starts with", "equals"
   Number column: "greater than", "less than", "between"
   Date column:   "before", "after", "between"
   Boolean:       true / false toggle
   All filters combine with AND logic.

4. Row selection with shift-click range
   Click row → select that row
   Shift+click row → select all rows between last selected and current
   Select all checkbox → select all visible rows

5. Column resizing
   Drag right edge of column header to resize.
   mousedown → mousemove tracks delta → updates column width.
   Prevent column from collapsing below min width.

6. Export to CSV
   Export currently filtered + sorted data.
   Only visible columns.
   Handle special characters (quotes, commas).
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  10k rows? Server-side? Column resize?   │
│  2. Architecture    →  Column definitions, state shape         │
│  3. Sorting         →  THE centrepiece: multi-column sort,     │
│                         direction cycle, stable sort           │
│  4. Filtering       →  Per-column type, AND logic, useMemo     │
│  5. Row selection   →  Shift-click range, select-all           │
│  6. Virtual scroll  →  Why DOM can't hold 10k rows             │
│  7. Column resize   →  mousedown + mousemove delta             │
│  8. CSV export      →  Blob API, special char escaping         │
│  9. Column toggle   →  Show/hide columns via column def        │
│  10. Performance    →  useMemo, React.memo, stable sort        │
│  11. Edge cases     →  Empty state, all selected, no results   │
│  12. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Column Definition — The Foundation

```javascript
const columns = [
  {
    key:        "name",
    header:     "Name",
    type:       "text",       // "text" | "number" | "date" | "boolean"
    sortable:   true,
    filterable: true,
    width:      200,          // px, resizable
    visible:    true,
    render:     null,         // optional: (value, row) => ReactNode
    minWidth:   80
  },
  {
    key:      "salary",
    header:   "Salary",
    type:     "number",
    sortable: true,
    render:   (v) => `₹${v.toLocaleString()}`  // custom renderer
  }
];
```

---

## Sort State — Multi-Column

```javascript
// Array of sort configs, order matters:
// Sort by department first, then by age within department
const [sortConfig, setSortConfig] = useState([]);
// [ { key: "department", direction: "asc" },
//   { key: "age", direction: "desc" } ]

// Clicking a column header:
// First click:   add to sort as "asc"
// Second click:  change to "desc"
// Third click:   remove from sort
const cycleSort = (columnKey) => {
  setSortConfig(prev => {
    const existing = prev.find(s => s.key === columnKey);
    if (!existing)
      return [...prev, { key: columnKey, direction: "asc" }];
    if (existing.direction === "asc")
      return prev.map(s => s.key === columnKey ? { ...s, direction: "desc" } : s);
    // was "desc" → remove
    return prev.filter(s => s.key !== columnKey);
  });
};
```

---

## Filter State — Per Column By Type

```javascript
const [filters, setFilters] = useState({});
// {
//   name:   { type: "contains", value: "alice" },
//   age:    { type: "range",    min: 25, max: 40 },
//   salary: { type: "gte",      value: 80000 },
//   status: { type: "eq",       value: "Active" }
// }
```

---

## useMemo Pipeline

```javascript
// All transformations in sequence: filter → sort → paginate/virtualise

const filteredData = useMemo(() => {
  return data.filter(row =>
    Object.entries(filters).every(([key, filter]) => {
      const val = row[key];
      if (filter.type === "contains")
        return String(val).toLowerCase().includes(filter.value.toLowerCase());
      if (filter.type === "range")
        return val >= filter.min && val <= filter.max;
      if (filter.type === "gte")  return val >= filter.value;
      if (filter.type === "eq")   return val === filter.value;
      return true;
    })
  );
}, [data, filters]);

const sortedData = useMemo(() => {
  if (sortConfig.length === 0) return filteredData;
  return [...filteredData].sort((a, b) => {
    for (const { key, direction } of sortConfig) {
      const aVal = a[key]; const bVal = b[key];
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ?  1 : -1;
    }
    return 0;  // equal on all sort keys → stable order preserved
  });
}, [filteredData, sortConfig]);
```

---

## Virtual Scroll — The Performance Core

```
WITHOUT virtual scroll:
  10,000 rows × ~5 DOM nodes each = 50,000 DOM nodes
  Browser: slow paint, slow scroll, high memory

WITH virtual scroll:
  Container height = 10,000 * rowHeight (CSS trick — maintains scroll bar)
  Only ~30 rows rendered in DOM at any time
  As user scrolls: recompute which rows are visible, render only those

Implementation:
  scrollTop + visibleHeight → startIndex to endIndex
  Render rows[startIndex..endIndex] only
  Offset them with paddingTop = startIndex * rowHeight
```

---

## Shift-Click Range Selection

```
User clicks row 5:        selectedRows = {5},      lastSelectedIndex = 5
User shift-clicks row 10: selectedRows = {5,6,7,8,9,10}
User shift-clicks row 3:  selectedRows = {3,4,5}   (from anchor 5 downward to 3)
                          lastSelectedIndex stays 5 (the anchor point)
```

---

## CSV Export

```javascript
const exportCSV = () => {
  const visibleCols = columns.filter(c => c.visible);

  const header = visibleCols.map(c => escapeCSV(c.header)).join(",");
  const rows   = sortedData.map(row =>
    visibleCols.map(c => escapeCSV(String(row[c.key] ?? ""))).join(",")
  );
  const csv = [header, ...rows].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  // ﻿ = BOM — makes Excel open UTF-8 correctly on Windows
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), {
    href: url, download: "export.csv"
  }).click();
  URL.revokeObjectURL(url);
};

const escapeCSV = (value) =>
  value.includes(",") || value.includes('"') || value.includes("\n")
    ? `"${value.replace(/"/g, '""')}"` // RFC 4180 escaping
    : value;
```

---

## What You Will Learn

| Concept | Why It Matters |
|---------|----------------|
| Column definition as config | Drives sort, filter, render, resize |
| Multi-column sort with direction cycle | asc → desc → remove, applied in order |
| Stable sort (spread before sort) | [...data].sort() — never mutate state |
| Per-column filter by type | Text/number/date/boolean each need different logic |
| useMemo for filter+sort pipeline | Only recomputes when data or config changes |
| Shift-click range selection | lastSelectedIndex anchor, fill range |
| Virtual scroll concept | scrollTop / rowHeight = startIndex |
| Column resize with mousedown | document-level mousemove to escape column bounds |
| CSV Blob API + BOM | ﻿ for Excel UTF-8 compatibility |
| TanStack Table as library option | If interviewer accepts libraries |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Basic table render. Column headers. Sorting one column.
Mid-level →   Multi-column sort with direction cycle.
              Per-column filtering with AND logic.
              useMemo for performance.
Senior    →   [...data].sort() — stable (no mutation).
              Shift-click range selection.
              Virtual scroll explanation.
              Column resize with document-level mouse events.
              CSV BOM for Excel.
Staff     →   Server-side sort/filter (API-driven).
              Column pinning (freeze left/right).
              Row virtualization with variable heights.
              TanStack Table internals.
```
