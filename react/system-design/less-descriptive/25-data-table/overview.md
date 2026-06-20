# Data Table - System Design Overview

**Level:** Medium  
**Time to Solve:** 50-65 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a feature-rich data table (AG Grid / TanStack Table style):
- Display tabular data with columns and rows
- Client-side sorting (click column header)
- Column-level filtering
- Row selection (single and multi-select with checkboxes)
- Pagination
- Column resizing (drag column border)
- Column visibility toggle (show/hide columns)
- CSV/JSON export
- Virtual scrolling for large datasets

---

## Real-World Examples

- AG Grid
- TanStack Table (formerly react-table)
- Excel/Google Sheets (simplified)
- Admin dashboards
- CRM tables (Salesforce)

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Sorting algorithm | Multi-column sort |
| Filter logic | Per-column filter strategies |
| Row selection state | Checkbox + shift-click range |
| Virtual scrolling | Performance with 10k+ rows |
| Column resizing | Mouse drag interaction |
| Export (CSV/JSON) | Blob API |

---

## What You'll Learn

- Sorting: single-column, multi-column, direction toggle
- Filter strategies per data type (text contains, number range, date range)
- Shift-click range selection pattern
- Column resize with `mousedown` + `mousemove` + `mouseup`
- Virtual scrolling with fixed row heights
- Generating and downloading CSV with Blob API
- Column visibility with persistent user preferences
- TanStack Table library (if interviewer accepts library)

---

## High-Level Architecture

```
<DataTable columns={[...]} data={[...]} />
├── <TableToolbar />
│   ├── <GlobalSearch />          (search all columns)
│   ├── <ColumnVisibilityMenu />  (toggle columns)
│   └── <ExportButton />          (CSV / JSON)
│
├── <TableHeader />
│   └── <HeaderCell /> × N
│       ├── Column title + sort arrow
│       ├── Filter input (per column)
│       └── Resize handle (drag right edge)
│
├── <TableBody />
│   └── <TableRow /> × N (or virtual rows)
│       └── <TableCell /> × N
│
└── <TableFooter />
    ├── <SelectionInfo />  ("3 rows selected")
    └── <Pagination />
```

---

## Data Structure

```javascript
// Column definition
{
  key: "name",
  label: "Full Name",
  type: "text",          // text | number | date | boolean
  sortable: true,
  filterable: true,
  width: 200,            // px
  visible: true,
  render: (value, row) => <strong>{value}</strong>  // optional custom renderer
}

// Sort state
const [sortConfig, setSortConfig] = useState([]);
// Multi-sort: [{ key: "age", direction: "asc" }, { key: "name", direction: "desc" }]

// Filter state
const [filters, setFilters] = useState({});
// { name: "alice", age: { min: 20, max: 40 } }

// Selection state
const [selectedRows, setSelectedRows] = useState(new Set()); // Set of row IDs
```

---

## Data Flow

```
Initial render:
  → display all rows, sorted by default (or unsorted)
  → pagination: show first 25 rows

User clicks column header "Age":
  → if not sorted: sort ascending
  → if sorted ascending: sort descending
  → if sorted descending: clear sort

Sort logic:
  → create sorted copy of data
  → don't mutate original data
  → useMemo: only re-sort when sort config changes

User types in column filter "name contains: alice":
  → update filters state
  → useMemo recomputes filteredData from sortedData

User clicks a row checkbox:
  → add rowId to selectedRows Set

User shift-clicks another row:
  → select all rows between last selected and current

User clicks Export CSV:
  → take currently filtered + sorted data
  → convert visible columns to CSV string
  → trigger download via Blob

Column resize:
  → mousedown on resize handle
  → mousemove: compute delta, update column width
  → mouseup: commit new width
```

---

## Key Concepts to Learn

### 1. Sorting (Multi-column)
```javascript
const sortedData = useMemo(() => {
  if (sortConfig.length === 0) return data;
  return [...data].sort((a, b) => {
    for (const { key, direction } of sortConfig) {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}, [data, sortConfig]);
```

### 2. Filtering (Per Column)
```javascript
const filteredData = useMemo(() => {
  return sortedData.filter(row =>
    Object.entries(filters).every(([key, filter]) => {
      const col = columns.find(c => c.key === key);
      if (col.type === "text") return row[key].toLowerCase().includes(filter.toLowerCase());
      if (col.type === "number") return row[key] >= filter.min && row[key] <= filter.max;
      if (col.type === "date") return new Date(row[key]) >= filter.start && new Date(row[key]) <= filter.end;
      return true;
    })
  );
}, [sortedData, filters]);
```

### 3. Row Selection with Shift-Click Range
```javascript
const lastSelectedIndex = useRef(null);

const handleRowSelect = (rowId, rowIndex, isShiftKey) => {
  if (isShiftKey && lastSelectedIndex.current !== null) {
    const start = Math.min(lastSelectedIndex.current, rowIndex);
    const end = Math.max(lastSelectedIndex.current, rowIndex);
    const rangeIds = filteredData.slice(start, end + 1).map(r => r.id);
    setSelectedRows(prev => new Set([...prev, ...rangeIds]));
  } else {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
    lastSelectedIndex.current = rowIndex;
  }
};
```

### 4. CSV Export
```javascript
const exportCSV = () => {
  const visibleCols = columns.filter(c => c.visible);
  const header = visibleCols.map(c => c.label).join(",");
  const rows = filteredData.map(row =>
    visibleCols.map(c => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: "export.csv" }).click();
  URL.revokeObjectURL(url);
};
```

### 5. Column Resize
```javascript
const handleResizeStart = (e, colKey) => {
  const startX = e.clientX;
  const startWidth = columnWidths[colKey];

  const onMouseMove = (e) => {
    const delta = e.clientX - startX;
    setColumnWidths(prev => ({ ...prev, [colKey]: Math.max(50, startWidth + delta) }));
  };
  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};
```

---

## Implementation Phases

### Phase 1 — Basic Table
- Render headers and rows
- Column definitions as config

### Phase 2 — Sorting
- Click header to sort
- Sort direction toggle
- Sort icon indicator

### Phase 3 — Filtering
- Per-column filter input
- Text/number filter logic
- Filter count badge

### Phase 4 — Selection
- Checkbox column
- Single select / select all
- Shift-click range

### Phase 5 — Advanced Features
- Pagination
- Column resize
- Column visibility
- CSV export
- Virtual scroll (discuss library: react-window)

---

## Library Option: TanStack Table

```javascript
// If interviewer accepts a library approach, mention:
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";

// Provides: sorting, filtering, pagination, row selection
// You handle: rendering (full control over HTML)
// Trade-off: less boilerplate, less learning value in interview
```

---

## Performance Considerations

- `useMemo` for sorted + filtered data (never sort/filter on every render)
- `React.memo` on TableRow
- Virtual scrolling with react-window for 1000+ rows
- Debounce filter inputs (don't filter on every keystroke)
- Column widths in CSS, not inline style recalculation on every render
