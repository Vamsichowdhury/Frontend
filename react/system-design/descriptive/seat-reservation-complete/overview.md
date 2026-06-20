# Seat Reservation System — Interview Overview

---

## What Problem Are We Solving?

Build a movie theater / concert seat booking UI where users see a visual map of seats, select their desired seats, and complete a purchase — all while other users are doing the same simultaneously.

```
┌──────────────────────────────────────────────────────────────┐
│             🎬  SCREEN / STAGE  🎬                            │
├──────────────────────────────────────────────────────────────┤
│  PLATINUM                                                    │
│  A  [ ][ ][ ][X][ ][ ]    [ ][ ][ ][ ][ ][ ]               │
│  B  [ ][ ][■][ ][ ][ ]    [ ][ ][ ][ ][ ][ ]               │
│                                                              │
│  GOLD                                                        │
│  C  [ ][ ][ ][ ][ ][ ]    [ ][ ][⏳][ ][ ][ ]              │
│  D  [ ][ ][ ][ ][ ][ ]    [ ][ ][ ][ ][ ][ ]               │
│  E  [ ][ ][ ][ ][ ][ ]    [ ][ ][ ][ ][ ][ ]               │
│                                                              │
│  SILVER                                                      │
│  F  [ ][ ][ ][ ][ ][ ]    [ ][ ][ ][ ][ ][ ]               │
│  G  [ ][ ][ ][ ][ ][ ]    [ ][ ][ ][ ][ ][ ]               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LEGEND:  [ ] Available   [X] Booked   [■] Selected   [⏳] Held│
│                                                              │
│  Selected: A5, B3  (2 seats)                                 │
│  Total: ₹900   [Proceed to Pay]                              │
│  ⏱ Your seats are held for 9:45                              │
└──────────────────────────────────────────────────────────────┘
```

Used in: BookMyShow, Ticketmaster, PVR, INOX, Cinepolis

---

## What Makes Seat Reservation Hard

```
1. Concurrency — the hardest problem
   Alice selects A5. Bob selects A5. Both see it as available.
   Alice clicks "Proceed" first. Server holds A5 for Alice.
   Bob still sees A5 as available on his screen.
   
   Without real-time updates: Bob clicks Proceed,
   server rejects his hold, he gets an error.
   With WebSocket: Bob's seat A5 turns red instantly
   when Alice claims it.

2. Hold/lock mechanism with timer
   Seats must be held for a limited time (e.g. 10 minutes)
   while user completes payment. If timer expires, seats
   release back to available.

3. 2D grid rendering
   Theater maps have irregular layouts — some rows shorter,
   aisles in the middle, premium vs economy sections.
   Must render accurately from a data structure.

4. Real-time seat status updates
   WebSocket broadcasts every status change to all viewers.
   100 users watching the same show — all see live updates.

5. Multiple seat selection
   Max N seats per booking (usually 8–10).
   Selected seats highlighted. Deselect by clicking again.
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Max seats? Categories? Mobile?          │
│  2. Architecture    →  Grid data model, WebSocket              │
│  3. Seat state machine→ available/selected/held/booked/disabled│
│  4. Grid rendering  →  2D map from API data                    │
│  5. Selection logic →  Click toggle, max limit                 │
│  6. Concurrency     →  THE centrepiece — Alice and Bob pick A5 │
│  7. Real-time WS    →  Server pushes status changes            │
│  8. Hold timer      →  Countdown, expiry handling              │
│  9. Proceed to Pay  →  POST hold, navigate on success          │
│  10. Edge cases     →  Sold out, hold expired, WS disconnect   │
│  11. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Seat State Machine

```
           ┌──────────────┐
  click    │   AVAILABLE  │◀──── hold released / booking cancelled
────────▶  │     [ ]      │
           └──────┬───────┘
                  │ user clicks
                  ▼
           ┌──────────────┐
  click    │   SELECTED   │
────────▶  │     [■]      │ (client-side only — not yet confirmed)
           └──────┬───────┘
                  │ user clicks Proceed, API POST /holds succeeds
                  ▼
           ┌──────────────┐
           │    HELD      │ (server holds for this user, timer starts)
           │    [⏳]      │
           └──────┬───────┘
                  │
        ┌─────────┴──────────┐
        │                    │
  timer expires         payment succeeds
        │                    │
        ▼                    ▼
  ┌──────────┐         ┌──────────────┐
  │ AVAILABLE│         │    BOOKED    │
  │   [ ]    │         │    [X]       │ (permanent)
  └──────────┘         └──────────────┘

  DISABLED: [░] (broken seat / restricted view / wheelchair)
```

---

## Data Model

```javascript
// Seat map from API
{
  showId: "show_123",
  venue: "PVR Phoenix",
  sections: [
    {
      name: "PLATINUM",
      pricePerSeat: 500,
      rows: [
        {
          rowLabel: "A",
          seats: [
            { seatId: "A1", number: 1, status: "available" },
            { seatId: "A2", number: 2, status: "booked"    },
            { seatId: "A3", number: 3, status: "held"       },
            null,  // ← aisle (null = empty space in grid)
            { seatId: "A5", number: 5, status: "available" },
          ]
        }
      ]
    },
    { name: "GOLD", pricePerSeat: 300, rows: [...] },
    { name: "SILVER", pricePerSeat: 200, rows: [...] }
  ]
}

// Client state
const [seatMap, setSeatMap] = useState(null);
const [selectedSeatIds, setSelectedSeatIds] = useState(new Set());
const MAX_SEATS = 8;

// Lookup Map for O(1) status updates from WebSocket
// Built from seatMap on load: { "A1": { status, price, ... } }
const seatLookup = useMemo(() => {
  const map = new Map();
  seatMap?.sections.forEach(section =>
    section.rows.forEach(row =>
      row.seats.forEach(seat => {
        if (seat) map.set(seat.seatId, { ...seat, price: section.pricePerSeat });
      })
    )
  );
  return map;
}, [seatMap]);
```

---

## WebSocket Event Types

```
Server → Client:
  SEAT_UPDATE   { seatId, status }        ← another user claimed/released a seat
  HOLD_EXPIRED  { seatIds, userId }        ← a hold timed out, seats now available
  SHOW_SOLD_OUT { showId }                  ← last seats just booked

Client → Server:
  (None — seat status changes go through REST API, not WS)
  POST /api/shows/:id/holds  { seatIds }   ← claim seats for payment
  DELETE /api/holds/:holdId              ← release hold if user cancels
```

---

## Concurrency: The Central Problem

```
t=0:  API call: GET /api/shows/123/seats
      Response: A5 is AVAILABLE
      Alice's UI: A5 shows as green [ ]
      Bob's UI:   A5 shows as green [ ]

t=5s: Alice clicks A5 → SELECTED (local state only)
t=6s: Bob clicks A5  → SELECTED (local state only)

t=10s: Alice clicks "Proceed" → POST /api/holds { seatIds: ["A5"] }
       Server: hold A5 for Alice (atomically, database lock)
       Server: broadcast SEAT_UPDATE { seatId:"A5", status:"held" }

t=10s (same instant):
  Alice: receives 200 OK → navigate to payment page
  Bob:   receives SEAT_UPDATE via WebSocket
         Bob's UI: A5 turns amber [⏳]
         Bob's selectedSeatIds still contains "A5"!
         → auto-deselect A5 from Bob's selection
         → show toast: "A5 was just taken. Please re-select."

t=10s: Bob clicks "Proceed" with his remaining selection
       → A5 not in his selection anymore ✅
```

---

## Hold Timer Display

```javascript
const [holdExpiresAt, setHoldExpiresAt] = useState(null); // timestamp
const [timeLeft, setTimeLeft]           = useState(null);  // seconds

useEffect(() => {
  if (!holdExpiresAt) return;
  const interval = setInterval(() => {
    const secs = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
    setTimeLeft(secs);
    if (secs === 0) {
      clearInterval(interval);
      handleHoldExpired(); // redirect back to seat map with warning
    }
  }, 1000);
  return () => clearInterval(interval);
}, [holdExpiresAt]);

// Display: "⏱ Your seats held for 9:45"
const formatTimer = (s) =>
  `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
```

---

## What You Will Learn

| Concept | Why It Matters |
|---------|----------------|
| Seat state machine (5 states) | Clear model for every possible seat state |
| seatLookup Map for O(1) WS updates | Avoid scanning the 2D grid on every WS message |
| null in seat array = aisle | Compact data representation for theater layout |
| Concurrency + auto-deselect | What happens when your selected seat gets taken |
| Optimistic hold vs server hold | Client selection is local; hold is server-confirmed |
| Hold expiry countdown | useEffect with setInterval + cleanup |
| beforeunload to release hold | Don't leave orphaned holds if user navigates away |
| Sold-out detection from WS | Show "Sold Out" overlay without polling |
| Max seat enforcement | UX guard, not just validation |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Knows seats have states. Basic grid render.
              WebSocket for real-time.
Mid-level →   Seat state machine. Selection with max limit.
              WebSocket auto-deselects taken seats.
Senior    →   seatLookup Map for O(1) WS updates.
              Concurrency walk-through (Alice + Bob scenario).
              Hold expiry timer + redirect.
              beforeunload to release hold.
Staff     →   Database-level atomic holds (SELECT FOR UPDATE).
              Idempotent hold requests.
              Partial hold failures (some seats taken, others not).
```
