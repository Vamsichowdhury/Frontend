# Seat Reservation System - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 55-70 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a seat reservation UI (BookMyShow / movie theater style):
- Visual seat map (rows × columns grid)
- Seat states: available, selected, booked, disabled
- Select multiple seats (up to N)
- Hold/lock seats temporarily while user pays (timer)
- Category-based pricing (Platinum, Gold, Silver)
- Seat tooltip on hover (row, seat number, price)
- Total price calculation
- Concurrent users — someone else can book while you're selecting

---

## Real-World Examples

- BookMyShow
- Ticketmaster
- Cinepolis
- EventBrite (standing vs seated)
- Concert seat maps

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Grid rendering | 2D seat layout |
| Multi-select state | Track selected seats |
| Seat state machine | Available → Selected → Held → Booked |
| Real-time updates | Someone else booked a seat |
| Timer/countdown | Hold expiry |
| Concurrency handling | Prevent double booking |

---

## What You'll Learn

- 2D grid data structure for seat maps
- Seat state machine (enum of states)
- Multi-select with max limit enforcement
- Optimistic hold (select immediately, confirm with API)
- Real-time seat updates via WebSocket
- Countdown timer with useEffect cleanup
- Accessibility for interactive seat grids
- Price calculation from categories

---

## High-Level Architecture

```
<SeatSelectionPage showId={id} />
├── <ShowInfo />             (movie, date, time, theater)
├── <LegendBar />            (color → state mapping)
├── <SeatMap />
│   └── <Row /> × N
│       ├── <RowLabel />     ("A", "B", "C"...)
│       └── <Seat /> × M
│           (available / selected / booked / disabled)
├── <CategoryInfo />         (Platinum $500, Gold $300, Silver $200)
├── <SelectionSummary />
│   ├── Selected seats list
│   ├── Total price
│   └── <ProceedButton />
└── <HoldTimer />            (countdown: "Your seats held for 8:45")
```

---

## Data Structure

```javascript
// Seat shape
{
  id: "A1",
  row: "A",
  number: 1,
  category: "platinum",   // platinum | gold | silver
  status: "available",    // available | selected | held | booked | disabled
  price: 500,
  heldBy: null           // userId if held by someone
}

// Seat map
const [seats, setSeats] = useState([]); // flat array of all seats

// Selected seats
const [selectedSeats, setSelectedSeats] = useState([]);  // ["A1", "A2"]
const MAX_SEATS = 8;

// Hold timer
const [holdExpiry, setHoldExpiry] = useState(null); // timestamp
const [holdTimeLeft, setHoldTimeLeft] = useState(null); // seconds remaining

// Computed: seat status lookup
const seatStatusMap = useMemo(() =>
  Object.fromEntries(seats.map(s => [s.id, s.status])),
[seats]);
```

---

## Data Flow

```
Page loads:
  → fetch seat map for showId
  → connect WebSocket for real-time seat updates

User clicks an available seat:
  → if selectedSeats.length >= MAX_SEATS: show error toast
  → add seatId to selectedSeats (local state)
  → seat visually changes to "selected"

User clicks a selected seat:
  → remove from selectedSeats (deselect)

User clicks "Proceed to Pay":
  → POST /api/holds { showId, seatIds: selectedSeats }
  → server locks seats for this user (typically 10 minutes)
  → response: { holdId, expiresAt }
  → start countdown timer
  → navigate to payment page

WebSocket message: seat booked by someone else:
  → { type: "SEAT_BOOKED", seatId: "B5" }
  → update that seat to "booked" status in local state
  → if seatId was in selectedSeats: remove + show toast "B5 was just taken"

Timer expires:
  → POST /api/holds/:holdId/release
  → redirect back to seat selection
  → show "Your hold expired" message

Payment complete:
  → POST /api/bookings
  → show confirmation with booking ID + QR code
```

---

## Key Concepts to Learn

### 1. Seat State Machine
```javascript
const SEAT_STATES = {
  AVAILABLE: "available",   // can be selected
  SELECTED: "selected",     // user has selected it (local)
  HELD: "held",            // someone else is holding it
  BOOKED: "booked",        // permanently booked
  DISABLED: "disabled"     // broken seat / not for sale
};

// Colors per state
const STATE_COLORS = {
  available: "#22c55e",   // green
  selected: "#6366f1",    // purple
  held: "#f59e0b",        // yellow/amber
  booked: "#ef4444",      // red
  disabled: "#6b7280"     // gray
};
```

### 2. Seat Selection Toggle
```javascript
const handleSeatClick = (seat) => {
  if (seat.status === "booked" || seat.status === "disabled" || seat.status === "held") return;

  setSelectedSeats(prev => {
    const isSelected = prev.includes(seat.id);
    if (isSelected) return prev.filter(id => id !== seat.id);
    if (prev.length >= MAX_SEATS) {
      toast.error(`Maximum ${MAX_SEATS} seats allowed`);
      return prev;
    }
    return [...prev, seat.id];
  });
};
```

### 3. Hold Countdown Timer
```javascript
useEffect(() => {
  if (!holdExpiry) return;

  const interval = setInterval(() => {
    const secondsLeft = Math.max(0, Math.floor((holdExpiry - Date.now()) / 1000));
    setHoldTimeLeft(secondsLeft);
    if (secondsLeft === 0) {
      clearInterval(interval);
      handleHoldExpired();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [holdExpiry]);

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
```

### 4. Real-time WebSocket Updates
```javascript
ws.onmessage = (event) => {
  const { type, seatId, status } = JSON.parse(event.data);

  if (type === "SEAT_UPDATE") {
    // Update seat in local state
    setSeats(prev => prev.map(s =>
      s.id === seatId ? { ...s, status } : s
    ));
    // If selected by us and now taken by someone else
    if (selectedSeats.includes(seatId) && status === "booked") {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      toast.warning(`Seat ${seatId} was just booked by someone else`);
    }
  }
};
```

---

## Implementation Phases

### Phase 1 — Seat Map Rendering
- Fetch and render 2D grid
- Color coding by status
- Row labels

### Phase 2 — Selection Logic
- Click to select/deselect
- Max seat enforcement
- Price calculation

### Phase 3 — Real-time Updates
- WebSocket connection
- Apply incoming seat status changes
- Warn if selected seat gets taken

### Phase 4 — Hold Flow
- Proceed to Pay → API hold request
- Countdown timer display
- Hold expired handling

### Phase 5 — UX Polish
- Hover tooltip (row, number, price)
- Legend bar
- Accessibility (keyboard navigation in grid)

---

## Concurrency: The Hard Problem

```
Scenario: Alice and Bob both select seat A5 simultaneously.
Alice clicks "Proceed" → server holds A5 for Alice.
Bob still sees A5 as "available" on his screen.

Solution:
1. WebSocket broadcasts every status change in real-time
2. Server-side hold (optimistic locking) is the source of truth
3. First to submit the hold API wins
4. Loser: frontend shows "Some seats were taken, please re-select"
```

---

## Edge Cases

| Edge Case | How to Handle |
|-----------|--------------|
| All seats booked | Disable page, show "Sold out" |
| Hold API fails | Don't navigate, show error, keep selection |
| WebSocket disconnects | Poll seat statuses every 30s as fallback |
| User navigates away with hold | Release hold via beforeunload event |
| Seat selected + booked by other | Auto-deselect + toast notification |
