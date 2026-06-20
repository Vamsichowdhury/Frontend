# Calendar / Event Scheduler — Interview Overview

---

## What Problem Are We Solving?

Build a calendar application (Google Calendar style) with month, week, and day views. Users can create, edit, and delete events. Events are visually positioned by their start/end time and must handle simultaneous overlapping events side by side.

```
┌────────────────────────────────────────────────────────────────┐
│  ◀ Jan 2024   Week View   Day  Week  Month  + New Event        │
├──────┬─────┬──────┬──────┬──────┬──────┬──────┬──────┐        │
│      │ Sun │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │        │
├──────┼─────┼──────┼──────┼──────┼──────┼──────┼──────┤        │
│  9am │     │      │      │┌────┐│      │      │      │        │
│      │     │      │      ││Stan│││      │      │      │        │
│ 10am │     │┌────┐│      ││Up  │││┌────┐│      │      │        │
│      │     ││Team││      │└────┘││Design│      │      │        │
│ 11am │     ││Sync│││┌──┐│      ││Review│      │      │        │
│      │     │└────┘│││DB ││      ││      │      │      │        │
│ 12pm │     │┌────┐│││Mtg││      │└────┘│      │      │        │
│      │     ││Lunch│││   ││      │      │      │      │        │
│  1pm │     │└────┘│└┘───┘│      │      │      │      │        │
├──────┴─────┴──────┴──────┴──────┴──────┴──────┴──────┘        │
│  Wed 10:30 has TWO events overlapping → split into 2 columns   │
└────────────────────────────────────────────────────────────────┘
```

Used in: Google Calendar, Apple Calendar, Outlook, Notion Calendar, Calendly

---

## What Makes Calendar Hard

```
1. Week view event rendering — the hardest visual challenge
   Events are absolutely positioned by time within a day column.
   When two events overlap in time, they must split horizontally
   into sub-columns. Three overlapping = three sub-columns each 33% wide.
   Detecting and resolving overlaps requires a graph algorithm.

2. Date/time arithmetic
   "What is the 3rd Monday of next month?" requires real math.
   Time zones, DST transitions, leap years all bite you.
   Use date-fns or dayjs — never raw JS Date math.

3. Month view grid padding
   January 2024 starts on Monday. But the grid starts on Sunday.
   Need to backfill preceding days from December 2023.
   Need to pad the end with days from February.

4. Drag to reschedule
   Drag an event block to a new time slot.
   Must snap to 15-minute increments.
   Must show a ghost at the new time while dragging.

5. Click-to-create
   Click an empty time slot → event creation starts at that time.
   Drag to extend the duration before releasing.
   Requires tracking mousedown start time + mousemove end time.
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Which views? Recurring events? Mobile?  │
│  2. Architecture    →  State, routing, date library            │
│  3. Month view      →  Grid padding, event pills               │
│  4. Week view       →  THE centrepiece: absolute positioning   │
│                         + overlap column splitting             │
│  5. Time grid       →  Height per hour, top offset calculation │
│  6. Overlap detection→ getEventColumns algorithm               │
│  7. Click-to-create →  mousedown + drag to set duration        │
│  8. Drag reschedule →  Ghost event, snap to 15min              │
│  9. Day view        →  Single column, same as week             │
│  10. Edge cases     →  All-day events, midnight-crossing        │
│  11. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Week View — Core Visual Challenge

```
Day column for Wednesday:

TIME      │  COLUMN LAYOUT
──────────┼─────────────────────────────────────────
 9:00am   │  ┌──────────────────────────────────┐
           │  │  Standup (9am-9:30am)            │
 9:30am   │  └──────────────────────────────────┘
10:00am   │  ┌──────────────┐ ┌────────────────┐
           │  │  Team Sync   │ │  DB Meeting    │
10:30am   │  │  (10-11am)   │ │  (10:30-12pm)  │
11:00am   │  └──────────────┘ │                │
11:30am   │                   │                │
12:00pm   │                   └────────────────┘

EXPLANATION:
  Team Sync (10am-11am) and DB Meeting (10:30am-12pm) overlap.
  They are placed in two sub-columns.
  Each gets 50% width within the day column.
  
  If a third event also overlapped: each would get 33.3% width.
```

---

## Event Positioning Math

```javascript
const HOUR_HEIGHT = 64;     // px per hour in the time grid
const START_HOUR  = 0;      // grid starts at midnight (or 7am for business)

// Event's top offset from top of grid:
const getTopOffset = (event) => {
  const startHour    = event.start.getHours() + event.start.getMinutes() / 60;
  return (startHour - START_HOUR) * HOUR_HEIGHT;
};

// Event's height based on duration:
const getHeight = (event) => {
  const durationHours =
    (event.end.getTime() - event.start.getTime()) / 3600000;
  return Math.max(durationHours * HOUR_HEIGHT, 20); // min 20px height
};

// Example:
// Team Sync: 10am-11am
//   top    = (10 - 0) * 64 = 640px from top
//   height = 1.0 * 64 = 64px
```

---

## Overlap Detection Algorithm

```javascript
function getEventColumns(dayEvents) {
  // Sort by start time
  const sorted = [...dayEvents].sort((a, b) => a.start - b.start);
  const columns = []; // each column is an array of events

  for (const event of sorted) {
    // Find first column where event doesn't overlap with last event
    let placed = false;
    for (let col of columns) {
      const lastInCol = col[col.length - 1];
      if (event.start >= lastInCol.end) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]); // needs a new column
  }

  // Each event gets: left = colIndex/totalCols * 100%, width = 100%/totalCols
  const totalCols = columns.length;
  columns.forEach((col, colIndex) => {
    col.forEach(event => {
      event._colIndex = colIndex;
      event._totalCols = totalCols;
    });
  });

  return columns.flat();
}
```

---

## Month View Grid

```javascript
function getMonthGrid(year, month) {
  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startPad  = firstDay.getDay();       // 0=Sun, 1=Mon...
  const endPad    = 6 - lastDay.getDay();

  const days = [];
  // Prev month padding
  for (let i = startPad - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Next month padding
  for (let i = 1; i <= endPad; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  return days; // always 35 or 42 entries (5 or 6 weeks)
}
```

---

## Data Structures

```javascript
// Event
{
  id: "evt_1",
  title: "Team Sync",
  start: new Date("2024-01-15T10:00:00"),
  end:   new Date("2024-01-15T11:00:00"),
  color: "#6366f1",
  allDay: false,
  recurring: null   // or { frequency: "weekly", days: ["MO","WE","FR"] }
}

// App state
const [events, setEvents]    = useState([]);
const [view,   setView]      = useState("week");   // month | week | day
const [currentDate, setCurrentDate] = useState(new Date());
const [selectedEvent, setSelectedEvent] = useState(null); // for edit modal
const [creatingEvent, setCreatingEvent] = useState(null); // for new event
```

---

## What You Will Learn

| Concept | Why It Matters |
|---------|----------------|
| Absolute positioning by time | top = hours * HOUR_HEIGHT |
| Overlap detection algorithm | Greedy column assignment, O(n log n) |
| Per-column width calculation | colIndex/totalCols * 100% |
| Month grid with padding | Fill leading/trailing days from adj months |
| date-fns / dayjs for date math | Never raw Date arithmetic |
| Click-to-create with drag | mousedown start + mousemove end = duration |
| 15-minute snap | Math.round(minutes / 15) * 15 |
| All-day event row | Separate row above the time grid |
| Recurring event expansion | Expand RRULE to individual occurrences |
| Navigate between views | Date context preserved across view switches |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Month grid. Basic event display. View switching.
Mid-level →   Week view absolute positioning math.
              Knows overlap is a problem.
Senior    →   Overlap column splitting algorithm.
              Click-to-create drag interaction.
              date-fns/dayjs (not raw Date math).
              All-day event row separation.
Staff     →   Recurring events (RRULE expansion).
              Time zone handling.
              Performance for 1,000+ events per view.
```
