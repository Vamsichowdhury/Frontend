# Seat Reservation System — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~50 minutes
**Interviewer style:** Will push hard on the concurrency scenario — what happens when two users try to book the same seat. Also probes the hold timer and the state machine.

---

> **How to use this file:**
> The concurrency problem (Phase 6) is the dramatic centre. The key insight: client-side "selected" is only local state. The server hold is the real lock. WebSocket broadcasts the status change to all viewers so they auto-deselect stolen seats. The hold timer (Phase 8) is the second most interesting area.

---

## ─────────────────────────────────────
## PHASE 1 — Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design the seat selection UI for a movie booking platform — like BookMyShow. Go ahead.

---

**Candidate:**

A few questions to scope this.

---

**Q1. What's the maximum number of seats a user can select?**

> **Why ask this:** Max seat limit changes the UX — disable seat clicks beyond the limit, show count badge. Also determines whether you need bulk-selection affordances.

---

**Q2. Are seats in categories (Platinum, Gold, Silver) with different prices?**

> **Why ask this:** Different pricing sections need visual separation (section headers, different colours) and price calculation changes based on which section the selected seats are in. A flat single-price grid is much simpler.

---

**Q3. Is real-time status required — should the map update live as others book?**

> **Why ask this:** This is the question that brings in WebSocket. Without real-time, you show the status at page load and only discover conflicts when the user tries to hold seats. With real-time, the map stays live. The concurrency story is completely different in each case.

---

**Q4. What happens if the user navigates away during payment — are their seats released?**

> **Why ask this:** Held seats that are never paid for tie up inventory. A real system needs the hold to expire (timer) OR be released on navigation. The `beforeunload` event handles navigation. This question signals you think about inventory leakage.

---

**Interviewer:**

Max 8 seats. Yes, Platinum/Gold/Silver sections. Yes, live WebSocket updates. Yes, release on navigation.

---

**Candidate:**

Good. The concurrency problem — two users picking the same seat — is the most interesting part. Let me start with the data model and state machine, then get to the concurrency discussion.

---

## ─────────────────────────────────────
## PHASE 2 — Seat State Machine
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the states a seat can be in.

---

**Candidate:**

Five states, each with a distinct visual representation:

```
AVAILABLE   [ ]   green     ← can be selected
SELECTED    [■]   blue      ← user's own selection (client-side only)
HELD        [⏳]  amber     ← someone else is in payment flow
BOOKED      [X]   red       ← permanently purchased
DISABLED    [░]   grey      ← broken/restricted, not for sale
```

The critical distinction: **SELECTED is client-side only**. When the user clicks a seat, it turns blue immediately — but no API call has been made. The seat is not locked on the server yet.

**HELD** means a server-level lock exists. Someone has clicked "Proceed to Pay" and the server is holding those seats for up to 10 minutes while they complete payment.

```javascript
const SEAT_STATUS = {
  AVAILABLE: "available",
  SELECTED:  "selected",   // local client state, not stored in API
  HELD:      "held",
  BOOKED:    "booked",
  DISABLED:  "disabled"
};
```

The `status` field in the API response is always one of: `available`, `held`, `booked`, `disabled`. The `selected` state is pure React state — derived from `selectedSeatIds`:

```javascript
const getDisplayStatus = (seat) => {
  if (selectedSeatIds.has(seat.seatId)) return "selected";
  return seat.status; // from API / WebSocket updates
};
```

---

## ─────────────────────────────────────
## PHASE 3 — Grid Rendering
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through rendering the seat grid from the API data.

---

**Candidate:**

The API returns a structured layout with sections, rows, and seats. `null` values represent aisles:

```javascript
// A row with an aisle in the middle:
{ rowLabel: "A", seats: [
  { seatId:"A1" }, { seatId:"A2" }, { seatId:"A3" },
  null,   // ← aisle gap
  { seatId:"A5" }, { seatId:"A6" }
]}
```

Rendering:

```jsx
function SeatMap({ seatMap, selectedSeatIds, onSeatClick }) {
  return (
    <div className="seat-map">
      <div className="screen">🎬 SCREEN 🎬</div>

      {seatMap.sections.map(section => (
        <div key={section.name} className="section">
          <h3>{section.name} — ₹{section.pricePerSeat}</h3>
          {section.rows.map(row => (
            <div key={row.rowLabel} className="row">
              <span className="row-label">{row.rowLabel}</span>
              {row.seats.map((seat, idx) => (
                seat === null
                  ? <div key={`aisle-${idx}`} className="aisle" />
                  : <Seat
                      key={seat.seatId}
                      seat={seat}
                      displayStatus={getDisplayStatus(seat)}
                      onClick={() => onSeatClick(seat)}
                    />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

The `Seat` component is `React.memo` — the entire grid re-renders minimally when only one or two seats change status:

```jsx
const Seat = React.memo(({ seat, displayStatus, onClick }) => {
  const isClickable = displayStatus === "available" || displayStatus === "selected";
  return (
    <button
      className={`seat seat-${displayStatus}`}
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      title={`${seat.seatId} - ${displayStatus}`}
      aria-label={`Seat ${seat.seatId}, ${displayStatus}`}
    />
  );
});
```

---

## ─────────────────────────────────────
## PHASE 4 — Selection Logic
## ─────────────────────────────────────

---

**Interviewer:**

User clicks seat A5. Walk me through the click handler.

---

**Candidate:**

```javascript
const handleSeatClick = (seat) => {
  const status = seat.status; // from API/WS — not the display status

  // Only available seats can be selected
  if (status !== "available") return;

  setSelectedSeatIds(prev => {
    const next = new Set(prev);
    if (next.has(seat.seatId)) {
      next.delete(seat.seatId); // deselect
    } else {
      if (next.size >= MAX_SEATS) {
        showToast(`Maximum ${MAX_SEATS} seats can be selected.`);
        return prev; // no change
      }
      next.add(seat.seatId);
    }
    return next;
  });
};
```

The total price updates reactively:

```javascript
const totalPrice = useMemo(() => {
  return Array.from(selectedSeatIds).reduce((sum, seatId) => {
    const seat = seatLookup.get(seatId);
    return sum + (seat?.price ?? 0);
  }, 0);
}, [selectedSeatIds, seatLookup]);
```

---

## ─────────────────────────────────────
## PHASE 5 — WebSocket Integration
## ─────────────────────────────────────

---

**Interviewer:**

How does the WebSocket work for live seat updates?

---

**Candidate:**

The WebSocket is opened when the seat map page loads. The server sends `SEAT_UPDATE` events whenever any seat status changes for this show:

```javascript
useEffect(() => {
  const ws = new WebSocket(`wss://api.bookmyshow.com/shows/${showId}/seats`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "SEAT_UPDATE":
        handleSeatStatusChange(msg.seatId, msg.status);
        break;
      case "HOLD_EXPIRED":
        msg.seatIds.forEach(id => handleSeatStatusChange(id, "available"));
        break;
      case "SHOW_SOLD_OUT":
        setIsSoldOut(true);
        break;
    }
  };

  return () => ws.close();
}, [showId]);
```

The `handleSeatStatusChange` function updates the seatLookup Map (which is derived state — actually I'd keep the raw seat data in state):

```javascript
const handleSeatStatusChange = (seatId, newStatus) => {
  // Update the seat's status in the data
  setSeatMap(prev => updateSeatInMap(prev, seatId, newStatus));
};
```

For performance, I need O(1) seat access. Traversing the nested `sections.rows.seats` structure on every WebSocket message is O(n). I maintain a flat lookup:

```javascript
const [seatStatusOverrides, setSeatStatusOverrides] = useState(new Map());
// { "A5": "held", "B3": "booked" }
// Overlay this on top of the base seatMap on render

const handleSeatStatusChange = (seatId, newStatus) => {
  setSeatStatusOverrides(prev => new Map(prev).set(seatId, newStatus));
};

// In getDisplayStatus:
const getDisplayStatus = (seat) => {
  if (selectedSeatIds.has(seat.seatId)) return "selected";
  return seatStatusOverrides.get(seat.seatId) ?? seat.status;
};
```

Now WebSocket updates are O(1) Map operations. The `Seat` component re-renders only for the specific seat that changed.

---

## ─────────────────────────────────────
## PHASE 6 — The Concurrency Problem
## ─────────────────────────────────────

---

**Interviewer:**

Alice and Bob are both looking at the same show. Both see A5 as available. Alice clicks A5 and then "Proceed to Pay" first. Walk me through what happens to Bob.

---

**Candidate:**

This is the central problem. Let me walk through the full timeline:

```
t=0s:
  Alice's screen: A5 = available (green)
  Bob's screen:   A5 = available (green)

t=5s:
  Alice clicks A5 → selectedSeatIds = {"A5"} (blue on her screen)
  Bob clicks A5  → selectedSeatIds = {"A5"} (blue on his screen)
  → No API call yet. Both are just local state.

t=10s:
  Alice clicks "Proceed to Pay"
  → POST /api/shows/123/holds { seatIds: ["A5"] }
  → Server: atomically checks A5 status. It's available.
  → Server: sets A5 status = "held", holderId = Alice
  → Server: returns { holdId: "hold_789", expiresAt: Date.now() + 600000 }
  → Server: broadcasts SEAT_UPDATE { seatId: "A5", status: "held" } via WebSocket

t=10s (same moment, two different recipients):
  Alice: receives 200 OK → navigate to /payment?holdId=hold_789
  Bob:   receives WebSocket SEAT_UPDATE { seatId:"A5", status:"held" }
```

On Bob's WebSocket handler:

```javascript
case "SEAT_UPDATE":
  const { seatId, newStatus } = msg;

  // Update visual status (A5 turns amber ⏳)
  setSeatStatusOverrides(prev => new Map(prev).set(seatId, newStatus));

  // If this seat was in Bob's selection, auto-deselect it
  if (selectedSeatIds.has(seatId) && newStatus !== "available") {
    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      next.delete(seatId);
      return next;
    });
    showToast(`Seat ${seatId} was just taken. Please select another.`);
  }
```

Bob sees:
- A5 changes from blue (selected) to amber (held)
- Toast notification: "Seat A5 was just taken. Please select another."
- His selection is now empty — he must pick a different seat

If Bob had already clicked "Proceed to Pay" at the same millisecond as Alice:
- Server receives both requests nearly simultaneously
- Database `SELECT FOR UPDATE` or optimistic locking ensures only one succeeds
- Alice wins (she was first)
- Bob gets a 409 Conflict response
- Bob's UI: "Sorry, seat A5 was booked by someone else. Please re-select."

---

**Interviewer:**

What if Bob clicks "Proceed to Pay" AFTER Alice's hold, but BEFORE the WebSocket message arrives on Bob's side (network delay)?

---

**Candidate:**

Bob's POST request reaches the server. The server checks A5's status — it's now "held" by Alice. The server rejects Bob's request:

```
Response: 409 Conflict
{
  "error": "SEATS_UNAVAILABLE",
  "unavailableSeats": ["A5"],
  "message": "Some seats are no longer available"
}
```

Bob's `handleProceed` function:

```javascript
const handleProceed = async () => {
  setProceedState("submitting");
  try {
    const result = await fetch(`/api/shows/${showId}/holds`, {
      method: "POST",
      body: JSON.stringify({ seatIds: Array.from(selectedSeatIds) })
    }).then(r => {
      if (!r.ok) throw r;
      return r.json();
    });
    // Success
    setHoldId(result.holdId);
    setHoldExpiresAt(result.expiresAt);
    navigate(`/payment?holdId=${result.holdId}`);
  } catch (errResponse) {
    const error = await errResponse.json();
    if (error.error === "SEATS_UNAVAILABLE") {
      // Remove unavailable seats from selection
      setSelectedSeatIds(prev => {
        const next = new Set(prev);
        error.unavailableSeats.forEach(id => next.delete(id));
        return next;
      });
      // Update their visual status
      error.unavailableSeats.forEach(id =>
        setSeatStatusOverrides(prev => new Map(prev).set(id, "held"))
      );
      showToast("Some seats were just taken. Please re-select.");
      setProceedState("idle");
    }
  }
};
```

This is the safety net when WebSocket delivery is delayed. The server is always the source of truth.

---

## ─────────────────────────────────────
## PHASE 7 — Hold Timer
## ─────────────────────────────────────

---

**Interviewer:**

User is on the payment page. The hold timer shows "9:45" and counts down. Walk me through this.

---

**Candidate:**

After a successful hold, the server returns `expiresAt` as a Unix timestamp. The countdown is computed from that:

```javascript
const [holdExpiresAt, setHoldExpiresAt] = useState(null);
const [timeLeft,      setTimeLeft]       = useState(null);

useEffect(() => {
  if (!holdExpiresAt) return;

  const tick = () => {
    const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
    setTimeLeft(remaining);
    if (remaining === 0) {
      clearInterval(timer);
      handleHoldExpired();
    }
  };

  tick(); // run immediately
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}, [holdExpiresAt]);
```

When timer hits zero:

```javascript
const handleHoldExpired = () => {
  // Navigate back to seat selection with a warning
  navigate(`/book/${showId}?expired=true`);
};

// On seat map page, if expired=true:
if (searchParams.get("expired") === "true") {
  showToast("Your held seats have been released. Please re-select.", { type: "warning" });
}
```

Why use `expiresAt` (server timestamp) rather than a client-side countdown from `10 * 60` seconds? Because the user might have a tab open and walk away — the server's expiry is absolute. If the user comes back to the tab after 5 minutes, the timer correctly shows ~5 minutes remaining, not 10.

---

**Interviewer:**

User has selected 3 seats and navigates away from the booking page without completing payment. Are the seats stuck in "held"?

---

**Candidate:**

Two mechanisms prevent this:

**1. Hold timer expiry (server-side)**
The server automatically releases held seats when `expiresAt` passes. No client cooperation needed. This is the primary safety net.

**2. `beforeunload` release (best-effort)**

```javascript
useEffect(() => {
  const releaseHold = () => {
    if (holdId) {
      // Use sendBeacon — fires even as page is unloading
      // fetch() might be cancelled mid-unload
      navigator.sendBeacon(`/api/holds/${holdId}/release`);
    }
  };

  window.addEventListener("beforeunload", releaseHold);
  return () => window.removeEventListener("beforeunload", releaseHold);
}, [holdId]);
```

`navigator.sendBeacon` is important here. Regular `fetch()` or XHR calls may be cancelled by the browser as the page unloads. `sendBeacon` queues the request and fires it even after the page closes. It's the correct API for "fire and forget on page unload."

This is best-effort — mobile browsers may kill the tab without firing `beforeunload`. The server-side expiry is the guaranteed release mechanism.

---

## ─────────────────────────────────────
## PHASE 8 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

All seats for the show are booked. What does the seat map show?

---

**Candidate:**

```
Server sends SHOW_SOLD_OUT event via WebSocket:
  → setIsSoldOut(true)
  → Overlay appears over the seat map:

┌─────────────────────────────────────────────────────┐
│                                                     │
│   [greyed out seat map underneath]                  │
│                                                     │
│   ┌─────────────────────────────────┐               │
│   │  SOLD OUT                       │               │
│   │  All seats for this show have   │               │
│   │  been booked.                   │               │
│   │                                 │               │
│   │  [Check other shows ›]          │               │
│   └─────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘

  [Proceed to Pay] button is disabled
  Selected seats cleared
```

---

**Interviewer:**

WebSocket disconnects while the user is selecting seats. What happens?

---

**Candidate:**

Two risks:
1. Seat status changes aren't received — user might try to book a seat that was taken while they were disconnected
2. The user doesn't know the real-time data is stale

Handling:

```javascript
ws.onclose = () => {
  setIsRealtimeConnected(false);
  scheduleReconnect(); // exponential backoff
};

// Show a warning banner when disconnected
{!isRealtimeConnected && (
  <div className="realtime-warning">
    ⚠️ Live updates paused. Seat availability may be outdated.
    <button onClick={reconnect}>Reconnect</button>
  </div>
)}
```

On reconnect: refetch the full seat map to sync any missed updates:

```javascript
ws.onopen = () => {
  setIsRealtimeConnected(true);
  // Resync missed updates
  fetch(`/api/shows/${showId}/seats`)
    .then(r => r.json())
    .then(data => {
      setSeatMap(data);
      setSeatStatusOverrides(new Map()); // clear overrides, fresh from server
    });
};
```

---

## ─────────────────────────────────────
## POST-INTERVIEW ANALYSIS
## ─────────────────────────────────────

```
✅  Asked about real-time requirement upfront (brings in WebSocket)
✅  Asked about beforeunload / hold release
✅  SELECTED state is client-only — HELD is server-confirmed
✅  seatStatusOverrides Map for O(1) WebSocket updates
✅  React.memo on Seat component (grid has 100+ seats)
✅  Alice and Bob concurrency: full timeline with auto-deselect
✅  409 Conflict handling for race condition at Proceed time
✅  expiresAt (server timestamp) not client countdown for timer
✅  navigator.sendBeacon for beforeunload release
✅  WS disconnect banner + refetch on reconnect
✅  SHOW_SOLD_OUT overlay
```

## 10 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | SELECTED is client-only | "Walk me through seat states" |
| 2 | seatStatusOverrides Map | "100 WebSocket updates/min — performance?" |
| 3 | React.memo on Seat | "100+ seats — click triggers re-render?" |
| 4 | O(1) WS update via Map overlay | "How do WS updates apply to the grid?" |
| 5 | Concurrency timeline | "Alice and Bob pick A5 simultaneously" |
| 6 | Auto-deselect on SEAT_UPDATE | "Bob's selected seat gets taken" |
| 7 | 409 handling at Proceed | "Bob clicks Proceed just after Alice" |
| 8 | expiresAt vs client countdown | "Walk me through the hold timer" |
| 9 | sendBeacon for beforeunload | "User navigates away — seats released?" |
| 10 | WS disconnect + refetch resync | "WebSocket drops mid-session" |
