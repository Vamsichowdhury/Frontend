# Analytics Dashboard - System Design Overview

**Level:** Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React + Chart libraries  

---

## Problem Statement

Build an analytics dashboard where:
- Multiple chart widgets (line, bar, pie, metric cards)
- Date range picker to filter all charts
- Real-time data updates via WebSocket
- Data aggregation (hourly, daily, weekly, monthly)
- Filter by dimensions (country, device, platform)
- Export data as CSV/PNG
- Dashboard is shareable with filters in URL

---

## Real-World Examples

- Google Analytics
- Mixpanel
- Amplitude
- Datadog
- Grafana

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Chart library integration | recharts, Chart.js, Nivo |
| Real-time data handling | WebSocket streaming metrics |
| Date range management | Complex time-based filtering |
| Data aggregation | Roll up raw events to summaries |
| State coordination | Filters affect all charts globally |
| Performance | Re-render only changed charts |

---

## What You'll Learn

- Recharts (or Chart.js) integration in React
- Real-time chart updates without full re-render
- Date range picker patterns
- Data normalization and aggregation
- Shared filter state with Context
- Memoizing expensive chart computations
- WebSocket for live metric streaming
- CSV export using Blob API

---

## High-Level Architecture

```
<DashboardApp />
├── <DashboardHeader />
│   ├── <DateRangePicker />        (global date filter)
│   ├── <DimensionFilters />       (country, device, etc.)
│   └── <ExportButton />
│
├── <MetricCardsRow />
│   └── <MetricCard /> × N         (Total users, Revenue, etc.)
│       (shows value, % change, sparkline)
│
└── <ChartsGrid />
    ├── <LineChart />              (trend over time)
    ├── <BarChart />               (comparison by category)
    ├── <PieChart />               (distribution)
    └── <DataTable />              (raw tabular data)
```

---

## Data Structure

```javascript
// Global filter state (affects all charts)
const [filters, setFilters] = useState({
  dateRange: { start: "2024-01-01", end: "2024-01-31" },
  granularity: "daily",      // hourly | daily | weekly | monthly
  country: "all",
  device: "all",
  platform: "all"
});

// Metric data shape
{
  "metric": "pageviews",
  "current": 125000,
  "previous": 112000,        // for % change calculation
  "changePercent": 11.6,
  "trend": "up"
}

// Time series data (for line/bar charts)
{
  "labels": ["Jan 1", "Jan 2", "Jan 3", ...],
  "datasets": [
    {
      "label": "Page Views",
      "data": [12000, 15000, 11000, ...]
    }
  ]
}
```

---

## Data Flow

```
Dashboard mounts:
  → read filters from URL query params
  → fetch all metrics with current filters
  → open WebSocket for real-time metric stream

User changes date range:
  → setFilters({ dateRange: newRange })
  → all charts re-fetch with new date range
  → URL updates with new params

User changes granularity ("hourly" to "daily"):
  → re-fetch with new granularity
  → chart x-axis labels update

Real-time metric arrives via WebSocket:
  → update specific metric card value
  → append new point to line chart
  → don't refetch — just update in place

User clicks Export CSV:
  → fetch raw data for current filters
  → generate CSV string
  → trigger download via Blob API

User shares dashboard URL:
  → all filters encoded in URL
  → recipient opens same view
```

---

## Key Concepts to Learn

### 1. Recharts Integration
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function TrendChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="pageviews" stroke="#8884d8" />
      <Line type="monotone" dataKey="sessions" stroke="#82ca9d" />
    </LineChart>
  );
}
```

### 2. Real-time Chart Updates
```javascript
// DON'T refetch entire dataset on every WS message
// DO append new point to existing data
const handleRealtimeUpdate = useCallback((newPoint) => {
  setChartData(prev => {
    const updated = [...prev, newPoint];
    // Keep rolling window of last 100 points
    return updated.slice(-100);
  });
}, []);

wsRef.current.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "METRIC_UPDATE") handleRealtimeUpdate(data.point);
};
```

### 3. Global Filter Context
```javascript
const DashboardContext = createContext();

function DashboardProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);

  // Each chart subscribes to filters via useContext
  return (
    <DashboardContext.Provider value={{ filters, setFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

// In each chart component:
const { filters } = useContext(DashboardContext);
// Automatically refetches when filters change
```

### 4. Memoized Data Processing
```javascript
// Expensive aggregation — only recompute when data changes
const aggregatedData = useMemo(() => {
  return rawEvents.reduce((acc, event) => {
    const key = formatDate(event.timestamp, filters.granularity);
    acc[key] = (acc[key] || 0) + event.value;
    return acc;
  }, {});
}, [rawEvents, filters.granularity]);
```

### 5. CSV Export
```javascript
const exportCSV = () => {
  const headers = ["Date", "Page Views", "Sessions", "Bounce Rate"];
  const rows = chartData.map(d => [d.date, d.pageviews, d.sessions, d.bounceRate]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics_export.csv";
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Implementation Phases

### Phase 1 — Static Dashboard
- Layout with chart placeholders
- Date range picker
- Metric cards with dummy data

### Phase 2 — Data Fetching
- API calls with filter params
- Loading states per chart
- Error handling per widget

### Phase 3 — Chart Rendering
- Recharts integration
- Proper data formatting per chart type
- Responsive containers

### Phase 4 — Real-time Updates
- WebSocket connection
- Append live data to charts
- Auto-refresh fallback (polling)

### Phase 5 — Export + Sharing
- CSV/JSON export
- URL sync for filters
- PNG chart screenshot

---

## Performance Considerations

- `React.memo` on each chart widget (only re-render if its data changes)
- `useMemo` for data aggregation
- Debounce filter changes (don't fetch on every slider move)
- Virtual scroll for large data tables
- Cache API responses by filter key

---

## Chart Library Comparison

| Library | Pros | Cons |
|---------|------|------|
| **Recharts** | React-native, declarative | Limited customization |
| **Chart.js** | Highly customizable | Imperative, harder with React |
| **Nivo** | Beautiful defaults | Heavy bundle size |
| **Visx** | Built by Airbnb, D3-based | Steep learning curve |
| **D3.js** | Full control | Very complex |
