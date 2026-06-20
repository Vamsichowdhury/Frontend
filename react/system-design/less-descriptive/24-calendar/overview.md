# Calendar / Event Scheduler - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a calendar application (Google Calendar style):
- Month, week, and day views
- Create, edit, delete events
- Drag to reschedule events
- Recurring events (daily, weekly, monthly)
- Multi-day events (spans across day columns)
- Event color coding by category
- Time zone support
- Mini calendar (date picker)

---

## Real-World Examples

- Google Calendar
- Apple Calendar
- Outlook Calendar
- Calendly (booking variant)
- Notion Calendar

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Date/time manipulation | Core domain knowledge |
| Grid-based layout | Day/week view column layout |
| Event overlap rendering | Two events at same time |
| Drag to reschedule | Complex mouse interaction |
| Recurring event logic | Complex scheduling rules |
| View switching | Month/week/day with same data |

---

## What You'll Learn

- Date math with JavaScript Date or date-fns/dayjs
- Building week view: time grid with absolute positioned events
- Event overlap detection and column splitting
- Multi-day event rendering across week boundaries
- Drag and drop to reschedule (time snapping)
- Recurring event expansion (RRULE)
- Mini calendar picker built from scratch
- Time zone conversion concepts

---

## High-Level Architecture

```
<CalendarApp />
├── <CalendarHeader />
│   ├── <ViewToggle />        (Month / Week / Day)
│   ├── <NavArrows />         (← Today →)
│   └── <DateDisplay />       ("January 2024")
│
├── <Sidebar />
│   ├── <MiniCalendar />      (compact month view for navigation)
│   └── <CalendarList />      (My Calendar, Work, Personal)
│
└── <MainView />
    ├── <MonthView />         OR
    ├── <WeekView />          OR
    └── <DayView />
        └── (all share <EventBlock />)
```

---

## Data Structure

```javascript
// Event shape
{
  id: "evt_abc",
  title: "Team Standup",
  description: "Daily sync",
  start: "2024-01-15T09:00:00",   // ISO string
  end: "2024-01-15T09:30:00",
  color: "#6366f1",
  calendarId: "work",
  allDay: false,
  recurring: {
    frequency: "weekly",           // daily | weekly | monthly | yearly
    days: ["MO", "WE", "FR"],      // RRULE spec
    until: "2024-12-31"            // end date for recurrence
  }
}

// App state
const [events, setEvents] = useState([]);
const [view, setView] = useState("week");          // month | week | day
const [currentDate, setCurrentDate] = useState(new Date());
const [selectedEvent, setSelectedEvent] = useState(null);
const [isCreating, setIsCreating] = useState(false);
```

---

## Data Flow

```
Week view renders:
  → calculate 7 days for current week
  → filter events that overlap with this week range
  → for each event: calculate top (start time), height (duration)
  → detect overlapping events → split into columns

User clicks empty time slot:
  → record clicked date + time
  → open EventCreateModal with start pre-filled
  → user fills in title, end time, color
  → POST /api/events
  → add to events state

User drags an event:
  → onMouseDown: track drag start (event + original time)
  → onMouseMove: calculate time delta from cursor position
  → snap to 15-minute intervals
  → update event position visually (preview)
  → onMouseUp: confirm new time
  → PATCH /api/events/:id { start, end }

User clicks an event:
  → show EventDetailPopover (title, time, edit/delete buttons)

Recurring event:
  → expand into individual occurrences for visible range
  → editing: ask "This event" / "This and following" / "All events"
```

---

## Key Concepts to Learn

### 1. Week View Layout (Time Grid)
```javascript
const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 7;   // show from 7am

// Convert event time to CSS top position
const getTopOffset = (dateTime) => {
  const hours = new Date(dateTime).getHours();
  const minutes = new Date(dateTime).getMinutes();
  return (hours - START_HOUR + minutes / 60) * HOUR_HEIGHT;
};

const getEventHeight = (start, end) => {
  const durationHours = (new Date(end) - new Date(start)) / 3600000;
  return durationHours * HOUR_HEIGHT;
};
```

### 2. Overlap Detection (Column Splitting)
```javascript
// Events at the same time side-by-side
function getEventColumns(dayEvents) {
  const sorted = dayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
  const columns = [];

  sorted.forEach(event => {
    // Find first column where event doesn't overlap
    let placed = false;
    for (let col of columns) {
      const lastInCol = col[col.length - 1];
      if (new Date(event.start) >= new Date(lastInCol.end)) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]);
  });

  return columns;
  // Each event gets: left = colIndex / totalCols * 100%, width = 100% / totalCols
}
```

### 3. Month View Grid
```javascript
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0=Sun
  const endPadding = 6 - lastDay.getDay();

  const days = [];
  // Pad start with prev month days
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Pad end with next month days
  for (let i = 1; i <= endPadding; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  return days;
}
```

### 4. Date Navigation
```javascript
const navigate = (direction) => {
  setCurrentDate(prev => {
    const d = new Date(prev);
    if (view === "month") d.setMonth(d.getMonth() + direction);
    if (view === "week") d.setDate(d.getDate() + (7 * direction));
    if (view === "day") d.setDate(d.getDate() + direction);
    return d;
  });
};
```

---

## Implementation Phases

### Phase 1 — Month View
- Calendar grid (7×5 or 7×6)
- Current month days + padding
- Today highlight
- Events shown as colored pills

### Phase 2 — Week View
- Time column (7am–10pm)
- 7 day columns
- Events positioned absolutely by time

### Phase 3 — Event CRUD
- Click empty slot to create
- Click event to view/edit/delete
- Form modal

### Phase 4 — Overlap Handling
- Detect overlapping events
- Split into side-by-side columns

### Phase 5 — Drag to Reschedule
- Drag event to new time slot
- 15-minute snapping
- Visual preview during drag

---

## Libraries Worth Knowing

| Library | What it does |
|---------|-------------|
| **date-fns** | Date math utilities (lightweight) |
| **dayjs** | date-fns alternative, smaller |
| **FullCalendar** | Full calendar UI component |
| **react-big-calendar** | Week/month/day views |
| **rrule** | Parse and expand recurring event rules |
