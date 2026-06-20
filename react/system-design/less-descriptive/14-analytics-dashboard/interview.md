# Analytics Dashboard — Interview Transcript

**Level:** Hard | **Duration:** 60-75 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Architecture & Data Model | ⏹️ |
| 3 | Chart Rendering | ⏹️ |
| 4 | Real-time Updates & Filters | ⏹️ |
| 5 | Performance & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design an analytics dashboard. What do you need to know?"

**What candidate should ask:**
- [ ] What metrics? (page views, revenue, active users?)
- [ ] Real-time or periodic refresh?
- [ ] Date range filtering?
- [ ] What chart types? (line, bar, pie?)
- [ ] Can users customize the dashboard?
- [ ] Data export needed?
- [ ] Multi-tenant? (one dashboard or per-customer?)

**Interviewer answers:**
> "Page views, sessions, conversion rate. Real-time updates for current day, historical for older. Date range picker. Line + bar + metric cards. No customization. CSV export. Single tenant."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Architecture & Data Model

**Interviewer:**
> "Walk me through your architecture — what components, what state?"

**Expected layout:**
```
<Dashboard>
├── <DashboardHeader>
│   ├── <DateRangePicker>     (global filter)
│   └── <ExportButton>
├── <MetricCardsRow>          (key numbers)
│   └── <MetricCard> × N
└── <ChartsGrid>
    ├── <LineChart>           (trend over time)
    ├── <BarChart>            (by category/source)
    └── <DataTable>           (raw breakdown)
```

**Expected state:**
```javascript
const [filters, setFilters] = useState({
  dateRange: { start: "2024-01-01", end: "2024-01-31" },
  granularity: "daily"
});
// All charts subscribe to filters via Context
```

**Interviewer pushback:**
> "Should each chart manage its own data fetch or share one?"

**Expected tradeoff:**
- Shared fetch: one API call, less bandwidth, harder to show partial loading
- Independent fetch per chart: parallel requests, easier per-chart loading states, easier to add/remove charts
- Best: shared filter context + independent chart data hooks (`useChartData(metricName, filters)`)

**Candidate response:** *(write your response here)*

---

# Phase 3 — Chart Rendering

**Interviewer:**
> "Which chart library would you use and why?"

**Expected:**
```
Recharts: React-first, declarative, good docs → good default choice
Chart.js: highly customizable, large community → non-React projects
Nivo: beautiful, built on D3 → complex use cases
D3.js: full control, very steep learning curve → only if custom
```

**Expected Recharts usage:**
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="pageviews" stroke="#6366f1" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Interviewer pushback:**
> "What is `ResponsiveContainer` doing?"

**Expected:** Makes the chart fill its container width/height responsively instead of fixed pixel dimensions. Essential for responsive layouts.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Real-time Updates & Filters

**Interviewer:**
> "Today's data updates in real-time. How do you implement this without refetching everything?"

**Expected:**
```javascript
// WebSocket for live metric stream
ws.onmessage = (event) => {
  const { metric, value, timestamp } = JSON.parse(event.data);
  // Append new data point, don't refetch entire dataset
  setChartData(prev => [...prev, { date: timestamp, [metric]: value }].slice(-100));
  // Update metric card value
  setMetrics(prev => ({ ...prev, [metric]: value }));
};
```

**Interviewer:**
> "User changes date range. All 5 charts need to refetch. How do you manage this cleanly?"

**Expected Context pattern:**
```javascript
const DashboardContext = createContext();
// Each chart: const { filters } = useContext(DashboardContext)
// useEffect in each chart depends on filters → auto-refetch on change
```

**Interviewer pushback:**
> "User slides a date range picker. It fires 20 events in 1 second. Do you fetch 20 times?"

**Expected:** Debounce filter changes. Only fetch after user stops moving the slider for 500ms.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Performance & Follow-ups

**Interviewer:**
> "What if the date range spans 2 years of hourly data — millions of data points?"

**Expected:**
- Never send raw data to frontend
- Aggregate server-side by granularity (hourly, daily, weekly, monthly)
- Frontend requests the granularity it needs
- Show max ~500 data points per chart

**Interviewer:**
> "How do you export data as CSV?"

**Expected:**
```javascript
const exportCSV = () => {
  const rows = chartData.map(d => [d.date, d.pageviews, d.sessions].join(","));
  const csv = ["Date,Page Views,Sessions", ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics.csv";
  a.click();
  URL.revokeObjectURL(url);
};
```

**Interviewer final question:**
> "How do you make charts load fast — user should see data in under 1 second?"

**Expected:**
- Cache API responses by `(metric, dateRange, granularity)` key
- Show skeleton loading state immediately
- Progressive loading: load metric cards first (fastest), then charts
- `React.memo` on each chart widget

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
