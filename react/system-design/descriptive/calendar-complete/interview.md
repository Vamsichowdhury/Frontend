# Calendar / Event Scheduler — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~50 minutes
**Interviewer style:** Will push hardest on the week view overlap algorithm — that's the visual complexity that defines a calendar UI. Will also probe the event positioning math and click-to-create interaction.

---

> **How to use this file:**
> The week view (Phases 4 & 5) is the dramatic centre — specifically the overlap column splitting algorithm. Explaining how two events at the same time get placed side-by-side (50% width each) using a greedy column assignment is the insight that separates calendar-aware candidates. The positioning math (top offset + height from timestamps) is the foundation.

---

## ─────────────────────────────────────
## PHASE 1 — Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design a calendar application — like Google Calendar. Go ahead.

---

**Candidate:**

A few questions to scope this properly.

---

**Q1. Which views — month, week, day, or all three?**

> **Why ask this:** Each view is a distinct rendering challenge. Month view is a grid of day cells. Week view is a time grid with absolute-positioned event blocks. Day view is the same as week but one column. Building all three is 3× the work. Most interviewers want all three, but confirming lets you prioritise the week view for depth.

---

**Q2. Do events support recurring patterns — daily, weekly, monthly?**

> **Why ask this:** Recurring events require expanding a single rule into multiple occurrences for the visible date range. This is non-trivial — `RRULE` parsing, `date-fns` recurrence expansion, and editing becomes complex ("edit this event" / "edit this and following" / "edit all"). Without recurring, every event is a standalone entity.

---

**Q3. Should users be able to create events by clicking an empty time slot and dragging?**

> **Why ask this:** Click-to-create with drag is a signature calendar interaction (Google Calendar does this). It requires `mousedown` + `mousemove` tracking, time snapping to 15-minute increments, and showing a ghost event during the drag. Without this, creation is just an "+ Add Event" button opening a form. Asking signals you know this interaction is non-trivial.

---

**Q4. Drag to reschedule existing events?**

> **Why ask this:** Dragging an existing event to a new time requires the same snap-to-grid logic plus updating the event's start/end. This interacts with the overlap layout algorithm — dragging changes which column events occupy. Adds meaningful scope.

---

**Interviewer:**

All three views. Recurring events as a bonus. Yes, click-to-create with drag. Yes, drag to reschedule. Single user, no collaboration.

---

**Candidate:**

Good. The week view event layout — specifically handling overlapping events — is the most interesting engineering problem here. Let me start there after a quick architecture overview.

---

## ─────────────────────────────────────
## PHASE 2 — Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the architecture.

---

**Candidate:**

```javascript
// App state
const [events,      setEvents]      = useState([]);
const [view,        setView]        = useState("week");  // "month"|"week"|"day"
const [currentDate, setCurrentDate] = useState(new Date());
const [selectedEvent, setSelectedEvent] = useState(null);

// Derived: which events fall in the visible range
const visibleEvents = useMemo(() => {
  const { start, end } = getViewRange(view, currentDate);
  return events.filter(e => e.start < end && e.end > start);
}, [events, view, currentDate]);
```

Navigation:

```javascript
const navigate = (direction) => {
  setCurrentDate(prev => {
    const d = new Date(prev);
    if (view === "month") d.setMonth(d.getMonth() + direction);
    if (view === "week")  d.setDate(d.getDate() + (7 * direction));
    if (view === "day")   d.setDate(d.getDate() + direction);
    return d;
  });
};
```

I use `date-fns` for all date math:

```javascript
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addDays } from "date-fns";
// Never write raw Date arithmetic — DST transitions and edge cases break it
```

---

## ─────────────────────────────────────
## PHASE 3 — Month View
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the month view.

---

**Candidate:**

Month view is a 7-column grid where each cell is a day. The grid always starts on Sunday. If January 1st is a Wednesday, the first three cells (Sun, Mon, Tue) are filled with December days:

```javascript
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const days     = [];

  // Pad start with previous month's days
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Pad end with next month's days
  const remaining = 42 - days.length; // 6 rows × 7 cols = 42 cells max
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  return days;
}
```

Events in month view show as colour pills:

```jsx
{/* Day cell */}
<div className={`day-cell ${!day.isCurrentMonth ? "muted" : ""}`}>
  <span className="day-number">{day.date.getDate()}</span>
  {eventsOnDay.slice(0, 3).map(e => (
    <EventPill key={e.id} event={e} onClick={() => setSelectedEvent(e)} />
  ))}
  {eventsOnDay.length > 3 && (
    <span className="more-events">+{eventsOnDay.length - 3} more</span>
  )}
</div>
```

---

## ─────────────────────────────────────
## PHASE 4 — Week View: Event Positioning
## ─────────────────────────────────────

---

**Interviewer:**

The week view shows events as blocks positioned by time. Walk me through how that works.

---

**Candidate:**

Each day is a vertical column. Events are absolutely positioned within their column. The math:

```javascript
const HOUR_HEIGHT = 64; // px per hour
const START_HOUR  = 0;  // grid starts at midnight

const getEventStyle = (event) => {
  const startHours = event.start.getHours() + event.start.getMinutes() / 60;
  const endHours   = event.end.getHours()   + event.end.getMinutes()   / 60;
  const top        = (startHours - START_HOUR) * HOUR_HEIGHT;
  const height     = Math.max((endHours - startHours) * HOUR_HEIGHT, 20);

  return { position: "absolute", top, height, left: 0, right: 0 };
};

// Event at 10:30am → 11:15am:
// top    = (10 + 30/60) * 64 = 10.5 * 64 = 672px
// height = (0.75 * 64) = 48px
```

The day column is a `position: relative` container with `height: 24 * HOUR_HEIGHT`:

```jsx
<div className="day-column" style={{ position: "relative", height: 24 * 64 }}>
  {/* Hour grid lines */}
  {Array.from({ length: 24 }, (_, h) => (
    <div key={h} className="hour-line" style={{ top: h * HOUR_HEIGHT }} />
  ))}
  {/* Events */}
  {dayEvents.map(event => (
    <EventBlock
      key={event.id}
      event={event}
      style={getEventStyle(event)}
    />
  ))}
</div>
```

---

## ─────────────────────────────────────
## PHASE 5 — Overlap Detection
## ─────────────────────────────────────

---

**Interviewer:**

Two events overlap in time on the same day. How do they appear?

---

**Candidate:**

Without overlap handling, they'd stack on top of each other — the later event would obscure the earlier one. With overlap detection, they split into sub-columns and each gets a percentage of the day column's width.

```
Team Sync (10am-11am) and DB Meeting (10:30am-12pm):
  Without handling:  DB Meeting covers Team Sync entirely ❌
  With handling:     Side by side, each 50% wide ✅
```

The algorithm:

```javascript
function getEventColumns(dayEvents) {
  // 1. Sort by start time
  const sorted = [...dayEvents].sort((a, b) => a.start - b.start);
  const columns = [];

  for (const event of sorted) {
    // 2. Find first column where the last event ended before this one starts
    let placed = false;
    for (const col of columns) {
      const lastEvent = col[col.length - 1];
      if (event.start >= lastEvent.end) {
        col.push(event);
        placed = true;
        break;
      }
    }
    // 3. No room in existing columns → create a new one
    if (!placed) columns.push([event]);
  }

  // 4. Assign layout info to each event
  const totalCols = columns.length;
  columns.forEach((col, colIndex) => {
    col.forEach(event => {
      event._colIndex = colIndex;
      event._totalCols = totalCols;
    });
  });

  return sorted; // events now have _colIndex and _totalCols
}
```

Then in `getEventStyle`:

```javascript
const getEventStyle = (event) => {
  const top    = (event.start.getHours() + event.start.getMinutes()/60) * HOUR_HEIGHT;
  const height = Math.max(
    ((event.end - event.start) / 3600000) * HOUR_HEIGHT, 20
  );
  const colWidth = 100 / event._totalCols;
  const left     = event._colIndex * colWidth;

  return {
    position: "absolute",
    top,
    height,
    left:   `${left}%`,
    width:  `${colWidth}%`,
    boxSizing: "border-box"
  };
};
```

For 3 overlapping events: each gets 33.3% width.

---

**Interviewer:**

Walk me through a concrete example. Events A (9am-11am), B (10am-12pm), C (10:30am-1pm) on the same day. What columns do they get?

---

**Candidate:**

```
Sorted by start: A(9am), B(10am), C(10:30am)

Process A(9am-11am):
  columns = []   → no existing column
  Create col[0] = [A]

Process B(10am-12pm):
  col[0] last event is A, ends 11am
  B starts 10am < 11am → OVERLAP in col[0]
  No other columns → create col[1] = [B]

Process C(10:30am-1pm):
  col[0] last event is A, ends 11am
  C starts 10:30am < 11am → OVERLAP in col[0]
  col[1] last event is B, ends 12pm
  C starts 10:30am < 12pm → OVERLAP in col[1]
  No other columns → create col[2] = [C]

Result: 3 columns → each event gets 33.3% width

  colIndex: A=0, B=1, C=2
  totalCols: all 3

Rendered:
  ┌──────┐ ┌──────┐ ┌──────┐
  │  A   │ │      │ │      │  9am
  │ 9-11 │ │  B   │ │      │ 10am
  │      │ │10-12 │ │  C   │ 10:30
  └──────┘ │      │ │10:30 │ 11am
           │      │ │ -1pm │ 12pm
           └──────┘ │      │ 12:30
                    └──────┘  1pm
```

---

**Interviewer:**

Event A ends at 11am. Event D starts at 11am. Are they considered overlapping?

---

**Candidate:**

No — they're consecutive, not overlapping. The condition is `event.start >= lastEvent.end`, so `D.start === A.end` means D can reuse A's column:

```
col[0] = [A (9-11am), D (11am-12pm)]  ← D reuses col[0] because 11 >= 11
```

D gets column 0. If B and C are in columns 1 and 2, D only overlaps with B and C (if it does), not A. The algorithm places D in col[0] regardless.

---

## ─────────────────────────────────────
## PHASE 6 — Click-to-Create
## ─────────────────────────────────────

---

**Interviewer:**

User clicks on an empty time slot and drags downward. Walk me through creating an event.

---

**Candidate:**

This mimics Google Calendar's click-drag creation:

```javascript
const [creatingEvent, setCreatingEvent] = useState(null);
// { start: Date, end: Date, columnDate: Date } — shown as a ghost event

const handleMouseDown = (e, columnDate) => {
  // Convert click Y position to a time
  const rect       = e.currentTarget.getBoundingClientRect();
  const clickY     = e.clientY - rect.top;
  const clickHours = clickY / HOUR_HEIGHT;

  // Snap to 15-minute increments
  const snappedMinutes = Math.round((clickHours % 1) * 60 / 15) * 15;
  const snappedHours   = Math.floor(clickHours) + snappedMinutes / 60;

  const startTime = new Date(columnDate);
  startTime.setHours(Math.floor(snappedHours), snappedMinutes, 0, 0);
  const endTime   = addMinutes(startTime, 30); // default 30min

  setCreatingEvent({ start: startTime, end: endTime, columnDate });
};

const handleMouseMove = (e, columnDate) => {
  if (!creatingEvent) return;
  const rect       = e.currentTarget.getBoundingClientRect();
  const moveY      = e.clientY - rect.top;
  const moveHours  = moveY / HOUR_HEIGHT;

  const snappedMinutes = Math.round((moveHours % 1) * 60 / 15) * 15;
  const endTime = new Date(columnDate);
  endTime.setHours(Math.floor(moveHours), snappedMinutes, 0, 0);

  // Ensure end is at least 15min after start
  if (endTime > addMinutes(creatingEvent.start, 15)) {
    setCreatingEvent(prev => ({ ...prev, end: endTime }));
  }
};

const handleMouseUp = () => {
  if (!creatingEvent) return;
  // Open event creation form pre-filled with these times
  setNewEventDraft(creatingEvent);
  setCreatingEvent(null);
};
```

The ghost event renders using the same `getEventStyle`:

```jsx
{creatingEvent && (
  <EventBlock
    event={{ ...creatingEvent, title: "(New Event)", color: "#94a3b8" }}
    style={getEventStyle(creatingEvent)}
    isGhost={true}
  />
)}
```

---

## ─────────────────────────────────────
## PHASE 7 — Drag to Reschedule
## ─────────────────────────────────────

---

**Interviewer:**

User drags an existing event to a different time. How does that work?

---

**Candidate:**

```javascript
const [draggingEvent, setDraggingEvent] = useState(null);
const [dragOffset,    setDragOffset]    = useState(0);
// dragOffset: where within the event the user started dragging (in hours)
// Prevents the event from jumping to align its top with the cursor

const handleEventMouseDown = (e, event) => {
  e.stopPropagation(); // prevent column's mousedown (click-to-create)
  const rect        = e.currentTarget.getBoundingClientRect();
  const offsetY     = e.clientY - rect.top;
  const offsetHours = offsetY / HOUR_HEIGHT;
  setDragOffset(offsetHours);
  setDraggingEvent({ ...event });
};

const handleColumnMouseMove = (e, columnDate) => {
  if (!draggingEvent) return;
  const rect        = e.currentTarget.getBoundingClientRect();
  const y           = e.clientY - rect.top;
  const cursorHours = y / HOUR_HEIGHT;
  const startHours  = cursorHours - dragOffset;

  // Snap to 15-minute increments
  const totalMinutes   = Math.round(startHours * 60 / 15) * 15;
  const snappedHours   = Math.floor(totalMinutes / 60);
  const snappedMinutes = totalMinutes % 60;

  const duration = draggingEvent.end - draggingEvent.start;
  const newStart = new Date(columnDate);
  newStart.setHours(snappedHours, snappedMinutes, 0, 0);
  const newEnd = new Date(newStart.getTime() + duration);

  setDraggingEvent(prev => ({
    ...prev,
    start: newStart,
    end:   newEnd
  }));
};

const handleColumnMouseUp = () => {
  if (!draggingEvent) return;
  // Commit the drag
  updateEvent(draggingEvent.id, { start: draggingEvent.start, end: draggingEvent.end });
  // Optimistic — update local state, API in background
  setEvents(prev => prev.map(e => e.id === draggingEvent.id ? draggingEvent : e));
  setDraggingEvent(null);
  setDragOffset(0);
};
```

The dragged event renders at its current draggingEvent position (ghost), while the original renders with low opacity:

```jsx
{events.map(event => {
  const isDragging = draggingEvent?.id === event.id;
  return (
    <EventBlock
      key={event.id}
      event={isDragging ? draggingEvent : event}
      style={getEventStyle(isDragging ? draggingEvent : event)}
      opacity={isDragging ? 0.4 : 1}  // dim original while dragging
    />
  );
})}
```

---

## ─────────────────────────────────────
## PHASE 8 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

An event starts at 11pm and ends at 1am the next day. How does the week view handle it?

---

**Candidate:**

A midnight-crossing event spans two day columns. The strategy is to split it at midnight:

```javascript
const normaliseEvents = (events) => {
  const result = [];
  for (const event of events) {
    const startDay = startOfDay(event.start);
    const endDay   = startOfDay(event.end);

    if (isSameDay(event.start, event.end)) {
      result.push(event); // normal case
    } else {
      // Split at midnight: first segment
      result.push({ ...event, end: endOfDay(event.start), _continued: true });
      // Second segment (and further if spans 3+ days)
      let current = startOfDay(event.end);
      while (!isSameDay(current, event.start)) {
        const isLast = isSameDay(current, endDay);
        result.push({
          ...event,
          id: `${event.id}_${format(current, "yyyy-MM-dd")}`,
          start: current,
          end: isLast ? event.end : endOfDay(current),
          _continuation: true
        });
        current = addDays(current, 1);
      }
    }
  }
  return result;
};
```

Events with `_continued: true` show an arrow ›  at the bottom. Events with `_continuation: true` show an arrow ‹ at the top.

---

**Interviewer:**

All-day events like "Alice's Birthday" or "Company Holiday." Where do they render?

---

**Candidate:**

All-day events go in a separate row at the top of the week view, above the time grid:

```
┌───────────────────────────────────────────────────────┐
│       │ Sun │ Mon   │ Tue │ Wed       │ Thu │ Fri │ Sat│
│All-day│     │ 🎂    │     │ 🏢 Holiday│     │     │    │
├───────┼─────┼───────┼─────┼───────────┼─────┼─────┼────│
│ 9am   │     │       │ ... │           │ ... │     │    │
```

They're filtered separately:

```javascript
const allDayEvents = visibleEvents.filter(e => e.allDay);
const timedEvents  = visibleEvents.filter(e => !e.allDay);
```

The all-day row height is dynamic — if multiple all-day events fall on the same day, the row grows to accommodate them.

---

## ─────────────────────────────────────
## POST-INTERVIEW ANALYSIS
## ─────────────────────────────────────

```
✅  Used date-fns (not raw Date math) — acknowledged DST/leap year risk
✅  Month grid padding — both leading and trailing days
✅  HOUR_HEIGHT constant for consistent positioning
✅  top = hours * HOUR_HEIGHT (clean, testable math)
✅  height = duration_hours * HOUR_HEIGHT (min 20px floor)
✅  Overlap detection algorithm — greedy column assignment
✅  Concrete walkthrough: A(9-11), B(10-12), C(10:30-1) → 3 columns
✅  Start >= end for consecutive (not overlapping)
✅  Click-to-create with dragOffset (prevents event jumping to cursor)
✅  15-minute snap: Math.round(minutes/15) * 15
✅  Midnight-crossing events split at day boundary
✅  All-day events in separate row above time grid
```

## 11 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | date-fns over raw Date | "What library for date math?" |
| 2 | Month grid padding algorithm | "Walk me through month view" |
| 3 | top = hours * HOUR_HEIGHT | "How are events positioned by time?" |
| 4 | height = duration * HOUR_HEIGHT | "How tall is an event block?" |
| 5 | Overlap detection greedy algorithm | "Two events overlap — what happens?" |
| 6 | Column width = 100% / totalCols | "Three events overlap — widths?" |
| 7 | Concrete A/B/C walkthrough | "Walk me through the algorithm" |
| 8 | Start >= end = consecutive not overlap | "Event ends at 11am, another starts at 11am" |
| 9 | dragOffset to prevent cursor jump | "Walk me through drag to reschedule" |
| 10 | Midnight-crossing event split | "Event starts 11pm, ends 1am next day" |
| 11 | All-day event separate row | "Where do all-day events render?" |
