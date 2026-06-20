# Financial Dashboard / Trading Platform — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Will immediately probe performance — this is the most important concern in trading UIs. Every answer will be challenged on "but what happens at high frequency?"

---

> **How to use this file:**
> The throttling problem (Phase 3) is the heart of this interview — just like the conflict problem was the heart of the Google Docs interview. If you understand why 300 setState calls per second melts the browser and how to fix it, you will stand out from most candidates. Read Phase 3 carefully.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design the frontend for a stock trading platform — think Zerodha Kite or Robinhood. Live prices, charts, ability to place orders. How do you approach it?

---

**Candidate:**

This is a performance-heavy domain — I want to scope it before designing to avoid building the wrong thing. A few questions first.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why clarifying questions matter here
> "Trading platform" spans a huge range — a simple portfolio tracker has very different requirements from an active day-trading terminal. The frequency of price updates, the types of instruments, and whether order placement is needed each add layers of complexity. Getting these wrong means designing a system optimised for the wrong problem.

---

**Q1. What asset class? Stocks, crypto, derivatives (F&O), commodities?**

> **Why ask this:**
> Each asset class has different data characteristics.
> - *Stocks (equities)*: Market hours (9:15am–3:30pm). Circuit breakers. Corporate actions (splits, dividends). Relatively predictable data volume.
> - *Crypto*: 24/7, no circuit breakers, extremely high tick rate, prices can move 10% in seconds. Much more demanding on the real-time pipeline.
> - *Derivatives (F&O)*: Complex instruments (options chains with Greeks — delta, gamma, theta, vega). The UI is fundamentally different — options traders need an option chain view, not just a price list.
> - *Commodities*: Different exchanges (MCX), different hours, some instruments are illiquid.
>
> The data model, chart types, and even the order form differ per asset class. This scopes the entire design.

---

**Q2. How many instruments does a user watch simultaneously?**

> **Why ask this:**
> This is the most critical performance question.
> - *5 instruments*: Rendering 5 price updates even at 10 ticks/second = 50 updates/second. Manageable with careful React state.
> - *30 instruments*: 300 updates/second. You **must** throttle. Cannot use naive setState.
> - *100+ instruments*: 1,000+ updates/second. Needs a fundamentally different architecture (mutable refs, Web Workers, virtualised list).
>
> This single number determines whether throttling is optional or mandatory.

---

**Q3. Is this real-time live data or delayed (15-minute delay)?**

> **Why ask this:**
> Real-time data via WebSocket is one architecture. Delayed data (common on free tiers of platforms) can use HTTP polling every 30 seconds. The entire real-time infrastructure is only needed if the answer is "live."
>
> Also: in India, NSE/BSE data is free in real-time for brokers. Third-party data vendors (like TrueData, Global Data Feed) charge for real-time. The data source affects the API contract.

---

**Q4. Do users place orders from the UI, or is this read-only analytics?**

> **Why ask this:**
> Order placement introduces an entirely new system:
> - Order form UI
> - Order state machine (submitting → success/failed)
> - Margin/fund validation before placement
> - Real-time order status updates
> - Risk checks ("are you sure you want to sell 10,000 shares at market price?")
>
> If it's read-only, you skip all of this. Order placement is the most sensitive part of the system — money moves. It deserves its own discussion.

---

**Q5. What charts are needed? Candlestick, line, volume? Any technical indicators?**

> **Why ask this:**
> Basic line chart = simple SVG or a library like Recharts.
> Candlestick chart = SVG struggles at 500+ candles. Canvas is required.
> Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands) = heavy math computation. Needs Web Workers to avoid blocking the main thread.
>
> Each addition multiplies complexity significantly.

---

**Q6. Mobile support?**

> **Why ask this:**
> A full trading terminal (watchlist + chart + order book + order form) is nearly impossible to fit on a small screen without a fundamentally different layout. Most professional trading platforms are desktop-first.
> Mobile trading apps (like Zerodha's Kite mobile) are separate product experiences.
>
> If mobile is required, the design becomes significantly constrained — single-panel views with tabs, simplified charts.

---

**Interviewer:**

Good framing. Here's the scope:

- Equities (NSE/BSE stocks).
- User can have up to 30 instruments in their watchlist.
- Yes, real-time live data via WebSocket.
- Yes, order placement — both market and limit orders.
- Candlestick charts with at least SMA indicator.
- Desktop-first, mobile is a bonus.

---

**Candidate:**

Perfect. Thirty instruments in real-time is the number that shapes everything — that means performance is the first thing I need to address. Let me start with how data flows from the exchange to the screen.

---

## ─────────────────────────────────────
## PHASE 2 — Architecture & Data Flow
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the architecture.

---

**Candidate:**

The data flow has three stages:

```
Stage 1 — Exchange to Server
  NSE/BSE feeds price ticks to a market data server
  (proprietary exchange protocol, not HTTP)
  Server normalises and streams to connected clients

Stage 2 — Server to Browser
  WebSocket connection: wss://data.zerodha.com/feed
  Server pushes tick messages at ~10 updates/second per symbol
  30 symbols × 10 ticks/second = 300 messages/second to client

Stage 3 — Browser rendering
  ← THIS is what I design ←
  WebSocket handler → buffer → throttle → React state → UI
```

Here's the component layout:

```
<TradingApp>
│
├── <Watchlist>         ← left: 30 rows, live prices
├── <ChartPanel>        ← centre: candlestick chart
├── <OrderBook>         ← right top: bid/ask depth
├── <OrderForm>         ← right bottom: buy/sell
└── <PositionsPanel>    ← bottom: holdings + P&L
```

---

**Interviewer:**

The WebSocket delivers 300 messages per second. You call setState for each one. What happens?

---

**Candidate:**

The browser melts. Let me show the math:

```
300 setState calls/second
Each setState triggers a React re-render
A re-render of the watchlist takes ~2ms (30 rows, fairly complex)

300 × 2ms = 600ms of rendering work per second

The browser has 16ms per frame (60fps).
We're using 600ms/1000ms = 60% of all available time just re-rendering.
The UI becomes unresponsive. Animations stutter. Typing lags.
```

This is the central performance problem of a trading UI. You cannot use naive setState for tick data.

---

## ─────────────────────────────────────
## PHASE 3 — Throttling Tick Data
## ─────────────────────────────────────

---

**Interviewer:**

So how do you solve it?

---

**Candidate:**

The solution is a **mutable buffer + batched flush**. The key insight: the user's eye cannot distinguish between 10 price updates per second. They see maybe 3–4 visual updates per second before it becomes a blur. So we can throw away intermediate ticks and only render the latest price on a fixed schedule.

Here's the pattern:

```javascript
// 1. Price buffer — mutable ref, NOT state
//    Writing here does NOT trigger re-render
const priceBuffer = useRef({});
// { "RELIANCE": { ltp: 2847.30, change: 1.2, ... },
//   "TCS":      { ltp: 3912.50, change: -0.4, ... } }

// 2. WebSocket handler — writes to buffer, never to state
wsRef.current.onmessage = (event) => {
  const tick = JSON.parse(event.data);
  // Just overwrite — we only care about the LATEST tick per symbol
  priceBuffer.current[tick.symbol] = tick;
  // No setState here. Zero re-renders triggered.
};

// 3. Scheduled flush — reads buffer and updates state in ONE batch
useEffect(() => {
  const flush = () => {
    const updates = priceBuffer.current;
    if (Object.keys(updates).length === 0) return;

    setPrices(prev => ({ ...prev, ...updates })); // ONE setState, batch update
    priceBuffer.current = {}; // clear buffer
  };

  const intervalId = setInterval(flush, 250); // flush 4× per second
  return () => clearInterval(intervalId);
}, []);
```

The result:

```
WITHOUT throttle:
  300 setState calls/second → 300 re-renders → browser chokes

WITH mutable buffer + 250ms flush:
  300 tick writes to mutable ref (no renders)
  4 setState calls/second → 4 re-renders/second ✅
  75× reduction in render work
  UI stays smooth
```

---

**Interviewer:**

Why `useRef` and not just a module-level variable for the buffer?

---

**Candidate:**

A module-level variable would work technically, but it would be shared across all instances of the component. If you ever have two TradingApp instances (rare but possible in testing), they'd overwrite each other's buffers.

`useRef` gives an instance-specific mutable object that's tied to this component's lifecycle. It's cleaned up when the component unmounts. It's also the idiomatic React way to hold mutable values that shouldn't trigger renders.

---

**Interviewer:**

You used `setInterval(flush, 250)`. Any reason not to use `requestAnimationFrame` instead?

---

**Candidate:**

Good question — both work. The choice depends on the use case.

```
requestAnimationFrame (rAF):
  - Fires every 16ms (60fps)
  - Perfectly synced to browser paint cycle
  - Automatically pauses when tab is hidden (saves CPU)
  - Results in 60 flushes/second → 60 re-renders/second
    → Too frequent. Still expensive for 30 rows.

setInterval(250ms):
  - Fires 4× per second
  - Independent of browser paint cycle
  - Does NOT pause when tab is hidden
  - 4 re-renders/second → good balance of freshness vs cost

Hybrid approach (what Bloomberg/professional terminals use):
  - rAF for the currently-selected instrument (high refresh)
  - 250ms interval for background watchlist rows
```

For a Zerodha-like product, 250ms interval for the watchlist is the right call. The active chart can use rAF for a smoother live candle update.

---

**Interviewer:**

Price flash — when a price goes up, it briefly flashes green. When it drops, it flashes red. How do you implement that?

---

**Candidate:**

The trick is that the flash is a **CSS animation triggered by a state change** — not a continuous animation.

```javascript
// Per symbol, track the previous price and flash direction
const [flashMap, setFlashMap] = useState({});
// { "RELIANCE": "up", "TCS": "down", "INFY": null }

// When flushing prices, compare new vs old
const flush = () => {
  const updates = priceBuffer.current;

  const newFlashes = {};
  Object.entries(updates).forEach(([symbol, tick]) => {
    const prev = pricesRef.current[symbol];
    if (prev) {
      if (tick.ltp > prev.ltp) newFlashes[symbol] = "up";
      else if (tick.ltp < prev.ltp) newFlashes[symbol] = "down";
    }
  });

  setPrices(prev => ({ ...prev, ...updates }));
  setFlashMap(newFlashes);
  // Clear flash after animation duration
  setTimeout(() => setFlashMap({}), 400);
};
```

The CSS:

```css
@keyframes flashGreen {
  0%   { background-color: rgba(34, 197, 94, 0.4); }
  100% { background-color: transparent; }
}
@keyframes flashRed {
  0%   { background-color: rgba(239, 68, 68, 0.4); }
  100% { background-color: transparent; }
}

.flash-up   { animation: flashGreen 0.4s ease-out; }
.flash-down { animation: flashRed 0.4s ease-out; }
```

In the watchlist row:

```jsx
<WatchlistRow
  className={flashMap[symbol] === "up" ? "flash-up" : flashMap[symbol] === "down" ? "flash-down" : ""}
>
  {ltp}
</WatchlistRow>
```

When `flashMap` is set, the CSS animation triggers. It plays once and fades out naturally. The `setTimeout` clears the flash class so the next price change can trigger it again.

---

**Interviewer:**

What if the price changes 5 times in 400ms — while the first flash is still running?

---

**Candidate:**

Without handling, the animation class is already applied. Setting it again doesn't restart the animation — the browser sees no change.

Fix: use an animation key or force a DOM reflow. The cleanest approach is a key-based animation restart:

```jsx
<WatchlistRow key={`${symbol}-${flashKey[symbol]}`} className={flashClass}>
```

Where `flashKey[symbol]` is a counter that increments on each price change. The new key forces React to unmount and remount the element, restarting the animation from scratch.

Alternatively, remove the class, force a reflow, then add it back:

```javascript
element.classList.remove("flash-up");
void element.offsetWidth; // force reflow
element.classList.add("flash-up");
```

The key-based approach is cleaner in React.

---

## ─────────────────────────────────────
## PHASE 4 — Candlestick Chart
## ─────────────────────────────────────

---

**Interviewer:**

Let's talk about the chart. User opens RELIANCE and wants to see a 5-minute candlestick chart for the last 3 months. How do you approach it?

---

**Candidate:**

First — SVG or Canvas?

```
SVG:
  Each candle is a DOM element (<rect>, <line>)
  3 months of 5-min candles = ~9,000 candles
  9,000 DOM elements = very slow paint, very slow interactions
  ❌ Not suitable for large datasets

Canvas:
  All drawing is pixels, no DOM elements
  9,000 candles drawn with Canvas API = fast
  Zoom, pan, crosshair — all handled with mouse events on one element
  ✅ Right choice for a trading chart
```

The data structure for OHLCV:

```javascript
// Historical candles fetched once from REST API
GET /api/candles?symbol=RELIANCE&interval=5m&from=2024-10-01&to=2024-12-31
Response:
[
  { time: 1699012800, open: 2810.00, high: 2825.50, low: 2808.00, close: 2818.00, volume: 123456 },
  { time: 1699013100, open: 2818.00, high: 2855.00, low: 2815.00, close: 2847.30, volume: 98765 },
  ...
  // ~9,000 objects
]
```

Drawing a single candle on Canvas:

```javascript
const drawCandle = (ctx, candle, x, candleWidth, priceToY) => {
  const isGreen = candle.close >= candle.open;
  const color = isGreen ? "#22c55e" : "#ef4444";

  // Body (open to close)
  const bodyTop    = priceToY(Math.max(candle.open, candle.close));
  const bodyBottom = priceToY(Math.min(candle.open, candle.close));
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1); // min 1px

  ctx.fillStyle = color;
  ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

  // Upper wick (body top to high)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, priceToY(Math.max(candle.open, candle.close)));
  ctx.lineTo(x, priceToY(candle.high));
  ctx.stroke();

  // Lower wick (body bottom to low)
  ctx.beginPath();
  ctx.moveTo(x, priceToY(Math.min(candle.open, candle.close)));
  ctx.lineTo(x, priceToY(candle.low));
  ctx.stroke();
};
```

The full chart render loop:

```javascript
const renderChart = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate visible candle range based on zoom + pan
  const { startIdx, endIdx } = getVisibleRange(candles, viewport);
  const visibleCandles = candles.slice(startIdx, endIdx);

  // Price scale
  const { minPrice, maxPrice } = getPriceRange(visibleCandles);
  const priceToY = (price) =>
    canvas.height - ((price - minPrice) / (maxPrice - minPrice)) * canvas.height;

  // Candle width based on visible count
  const candleWidth = canvas.width / visibleCandles.length * 0.7;

  visibleCandles.forEach((candle, i) => {
    const x = (i / visibleCandles.length) * canvas.width;
    drawCandle(ctx, candle, x, candleWidth, priceToY);
  });
};
```

---

**Interviewer:**

The live market is open. A new candle is forming in real time — the last candle's close updates every tick. How does that work?

---

**Candidate:**

The live candle is the *current period's* candle. It updates with every tick.

```javascript
// When a new tick arrives for the charted symbol:
const updateLiveCandle = (tick) => {
  setCandles(prev => {
    const candles = [...prev];
    const lastCandle = candles[candles.length - 1];
    const isNewPeriod = tick.timestamp >= lastCandle.time + INTERVAL_MS;

    if (isNewPeriod) {
      // Start a new candle
      candles.push({
        time: tick.timestamp,
        open: tick.ltp, high: tick.ltp,
        low: tick.ltp, close: tick.ltp,
        volume: tick.volume
      });
    } else {
      // Update current candle
      candles[candles.length - 1] = {
        ...lastCandle,
        high:   Math.max(lastCandle.high, tick.ltp),
        low:    Math.min(lastCandle.low, tick.ltp),
        close:  tick.ltp,
        volume: tick.volume
      };
    }
    return candles;
  });
};
```

But this runs on every tick — up to 10 times/second. Updating the candles array 10 times/second and re-rendering the entire chart is expensive.

Better: buffer the live candle separately and only merge on the 250ms flush:

```javascript
const liveCandle = useRef(null); // updated on every tick, no render

// On flush (4×/second), merge into chart data and trigger ONE render
const flushLiveCandle = () => {
  if (!liveCandle.current) return;
  setCandles(prev => [...prev.slice(0, -1), liveCandle.current]);
};
```

---

**Interviewer:**

You mentioned SMA (Simple Moving Average) as an indicator. How do you compute it?

---

**Candidate:**

SMA is the rolling average of the last N closing prices. SMA-20 means the average of the last 20 candles' close prices.

```javascript
const computeSMA = (candles, period) => {
  const sma = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      sma.push(null); // not enough data yet
      continue;
    }
    const sum = candles
      .slice(i - period + 1, i + 1)
      .reduce((acc, c) => acc + c.close, 0);
    sma.push(sum / period);
  }
  return sma;
};
```

For 9,000 candles with SMA-20, SMA-50, SMA-200 — that's 27,000 calculations on the main thread. It blocks rendering for a noticeable moment.

Solution: **Web Worker**.

```javascript
// chart.worker.js
self.onmessage = (e) => {
  const { candles, indicators } = e.data;
  const results = {};

  if (indicators.includes("SMA20"))
    results.sma20 = computeSMA(candles, 20);
  if (indicators.includes("SMA50"))
    results.sma50 = computeSMA(candles, 50);
  if (indicators.includes("RSI14"))
    results.rsi14 = computeRSI(candles, 14);

  self.postMessage(results);
};

// In the component
const worker = new Worker(new URL("./chart.worker.js", import.meta.url));

worker.postMessage({ candles, indicators: selectedIndicators });
worker.onmessage = (e) => {
  setIndicatorData(e.data); // triggers chart re-render with overlays
};
```

The main thread is free to handle user interactions while the worker crunches numbers.

---

## ─────────────────────────────────────
## PHASE 5 — Order Book
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the order book component.

---

**Candidate:**

The order book shows the current buy and sell orders waiting to be executed:

```
ASK (SELL orders) — red, sorted ascending
  ┌──────────────────────────────────────┐
  │  2848.50  |  4,200  |  ████████████ │
  │  2848.00  |  2,800  |  ████████     │
  │  2847.70  |  1,500  |  █████        │
  │  2847.60  |    900  |  ████         │
  │  2847.50  |    300  |  ██           │   ← best ask (lowest sell)
  ├──────────────────────────────────────┤
  │    Spread: ₹0.40  (0.01%)           │
  ├──────────────────────────────────────┤
  │  2847.10  |    500  |  ███          │   ← best bid (highest buy)
  │  2847.00  |  1,200  |  ████         │
  │  2846.90  |    800  |  ████         │
  │  2846.50  |  2,000  |  ██████       │
  │  2846.00  |  3,500  |  ██████████  │
  └──────────────────────────────────────┘
BID (BUY orders) — green, sorted descending
```

The background bars (depth visualization) show relative quantity as a percentage of the maximum quantity in the visible rows.

```javascript
const maxQty = Math.max(...[...bids, ...asks].map(l => l.qty));

const OrderLevel = ({ price, qty, side }) => {
  const barWidth = `${(qty / maxQty) * 100}%`;
  return (
    <div className={`order-level ${side}`}>
      <div
        className="depth-bar"
        style={{
          width: barWidth,
          background: side === "bid" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"
        }}
      />
      <span className="price">{price.toFixed(2)}</span>
      <span className="qty">{qty.toLocaleString()}</span>
    </div>
  );
};
```

---

**Interviewer:**

The order book updates 50 times per second. Same throttling problem?

---

**Candidate:**

Yes — same pattern. The order book data goes through the same mutable buffer, but it's a separate buffer from the price ticks because the data shape is different:

```javascript
const orderBookBuffer = useRef(null); // entire order book snapshot

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "TICK") {
    priceBuffer.current[msg.symbol] = msg;
  }
  if (msg.type === "ORDER_BOOK" && msg.symbol === activeSymbol) {
    orderBookBuffer.current = msg; // overwrite with latest snapshot
  }
};

// On 250ms flush
const flushOrderBook = () => {
  if (!orderBookBuffer.current) return;
  setOrderBook(orderBookBuffer.current);
  orderBookBuffer.current = null;
};
```

Since the order book is a full snapshot replacement (not a diff), we always overwrite. The intermediate 49 updates in a second are discarded — we only render the latest state.

---

## ─────────────────────────────────────
## PHASE 6 — Order Placement
## ─────────────────────────────────────

---

**Interviewer:**

User clicks BUY. Walk me through the order placement flow.

---

**Candidate:**

Order placement is money moving. It needs to be clear, confirmation-driven, and handle failure gracefully.

**State machine for the order form:**

```
IDLE
 │ user fills form (qty=10, price=2847.50, type=LIMIT)
 ▼
REVIEWING
 │ show order summary: "Buy 10 RELIANCE @ ₹2847.50 = ₹28,475"
 │ + margin required, available funds
 │ user clicks "Place Order"
 ▼
SUBMITTING (spinner, button disabled — prevent double-submit)
 │
 ├── Success → ORDER_PLACED: "Order #ORD12345 placed successfully"
 │                → add to open orders list
 │                → reset form after 3 seconds
 │
 └── Failure → ORDER_FAILED: "Insufficient margin" / "Price out of range"
                  → show error inline
                  → keep form open for correction
```

Implementation:

```javascript
const [orderState, setOrderState] = useState("idle");
// "idle" | "reviewing" | "submitting" | "success" | "failed"
const [orderError, setOrderError] = useState(null);
const [placedOrder, setPlacedOrder] = useState(null);

const placeOrder = async () => {
  setOrderState("submitting");
  setOrderError(null);

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol, side, qty, price, orderType
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message); // "Insufficient margin"
    }

    const order = await response.json();
    setPlacedOrder(order);
    setOrderState("success");

    // Reset form after 3 seconds
    setTimeout(() => {
      setOrderState("idle");
      setQty("");
      setPrice("");
    }, 3000);

  } catch (err) {
    setOrderState("failed");
    setOrderError(err.message);
  }
};
```

---

**Interviewer:**

Why is there a REVIEWING state? Why not go straight to SUBMITTING?

---

**Candidate:**

Because trading mistakes are costly and irreversible in real time.

The REVIEWING state shows the user the **total cost** before they confirm:

```
"Buy 10 RELIANCE @ ₹2847.50 = ₹28,475.00"
Margin required: ₹28,475
Available: ₹45,000
---
[Cancel]    [Confirm Order]
```

This forces one explicit confirmation step. Zerodha, Upstox, and every serious broker has this. Without it, a mistyped quantity (100 instead of 10) results in a ₹2,84,750 order — a 10× mistake.

For MARKET orders specifically, the price shown in REVIEWING should say "Market Price (~₹2847.30)" because the actual execution price will vary. This sets correct expectations.

---

**Interviewer:**

The order is placed. The user now sees it in "Open Orders". The exchange fills it partially. How do you update the order status in real time?

---

**Candidate:**

Order status updates come via WebSocket — the same connection we use for price data, or a separate order update channel:

```javascript
// WebSocket message for order update
{
  type: "ORDER_UPDATE",
  orderId: "ORD12345",
  status: "PARTIAL_FILL",     // "OPEN" | "PARTIAL_FILL" | "COMPLETE" | "CANCELLED" | "REJECTED"
  filledQty: 5,               // 5 of 10 shares filled
  remainingQty: 5,
  avgFillPrice: 2847.45,
  timestamp: 1699012345678
}
```

Handling this in the app:

```javascript
case "ORDER_UPDATE":
  setOrders(prev => prev.map(order =>
    order.id === data.orderId
      ? { ...order, ...data } // merge update
      : order
  ));
  // If fully filled, also update positions
  if (data.status === "COMPLETE") {
    updatePosition(data.symbol, data.filledQty, data.avgFillPrice);
  }
  break;
```

The open orders list shows real-time fill progress:

```
RELIANCE | BUY | 10 qty | ₹2847.50 | PARTIAL (5/10 filled @ ₹2847.45)
```

---

## ─────────────────────────────────────
## PHASE 7 — Portfolio & P&L
## ─────────────────────────────────────

---

**Interviewer:**

User has 5 stocks in their portfolio. How do you compute live P&L?

---

**Candidate:**

P&L is a derived value — computed from holdings (static) and live prices (dynamic):

```javascript
// Holdings from API (static, fetched once)
const holdings = [
  { symbol: "RELIANCE", qty: 10, avgBuyPrice: 2750.00 },
  { symbol: "TCS",      qty: 5,  avgBuyPrice: 3800.00 },
  { symbol: "INFY",     qty: 20, avgBuyPrice: 1400.00 },
];

// Live prices from WebSocket (dynamic)
// prices["RELIANCE"] = { ltp: 2847.30, ... }

// Computed P&L — useMemo, recalculates when prices change
const portfolioSummary = useMemo(() => {
  let totalInvested = 0;
  let totalCurrent = 0;

  const positions = holdings.map(h => {
    const ltp = prices[h.symbol]?.ltp ?? h.avgBuyPrice;
    const invested = h.qty * h.avgBuyPrice;
    const current  = h.qty * ltp;
    const pnl      = current - invested;
    const pnlPct   = (pnl / invested) * 100;

    totalInvested += invested;
    totalCurrent  += current;

    return { ...h, ltp, invested, current, pnl, pnlPct };
  });

  return {
    positions,
    totalInvested,
    totalCurrent,
    totalPnl:    totalCurrent - totalInvested,
    totalPnlPct: ((totalCurrent - totalInvested) / totalInvested) * 100
  };
}, [holdings, prices]); // recalculates when prices batch-updates
```

Since `prices` only updates 4 times per second (our throttled flush), this `useMemo` only runs 4 times per second — not 300 times. The throttling pays dividends here too.

---

**Interviewer:**

What if the user has 50 holdings? Is the P&L recalculation still fast?

---

**Candidate:**

50 holdings × simple arithmetic = negligible. The computation is O(n) with constant-time operations per holding. Even 50 holdings recalculating 4 times per second is 200 operations/second — nothing for a modern CPU.

The expensive part would be if we were doing something complex per holding — like computing options Greeks or running a correlation matrix. For basic P&L on equities, even 500 holdings would be fast.

---

## ─────────────────────────────────────
## PHASE 8 — Stale Data Detection
## ─────────────────────────────────────

---

**Interviewer:**

The WebSocket connection is up but the market data server stops sending ticks — maybe the exchange feed went down. How do you detect and communicate that?

---

**Candidate:**

This is the **stale price problem** — arguably more dangerous than a disconnection because the connection looks healthy while the data is stale. A trader might see ₹2847.30 and think that's the live price, but the market has moved to ₹2900 while the feed was silent.

Detection — track the timestamp of the last received tick:

```javascript
const lastTickTime = useRef(Date.now());

// In WS message handler
wsRef.current.onmessage = (event) => {
  lastTickTime.current = Date.now(); // update on EVERY message
  // ... rest of handler
};

// Watchdog — checks if feed has gone silent
useEffect(() => {
  const watchdog = setInterval(() => {
    const timeSinceLastTick = Date.now() - lastTickTime.current;

    if (timeSinceLastTick > 5000) {         // 5 seconds of silence
      setFeedStatus("stale");
    } else if (timeSinceLastTick > 2000) {  // 2 seconds of silence
      setFeedStatus("slow");
    } else {
      setFeedStatus("live");
    }
  }, 1000); // check every second

  return () => clearInterval(watchdog);
}, []);
```

UI response to stale data:

```
feedStatus === "slow":
  → Subtle yellow dot next to prices: "●  Slow feed"

feedStatus === "stale":
  ┌────────────────────────────────────────────────────┐
  │  ⚠️  Market data feed is delayed. Prices shown    │
  │  may not reflect current market conditions.       │
  │  Do not trade based on these prices.              │
  └────────────────────────────────────────────────────┘
  → Grey out all prices (no longer show green/red)
  → Disable the [Place Order] button

feedStatus === "live":
  → No warning. Normal operation.
```

Disabling the order button when data is stale is critical. A trader should never execute an order when the price they see might be 30 seconds old.

---

**Interviewer:**

Strong answer. What's the difference between stale feed and WebSocket disconnect?

---

**Candidate:**

```
WebSocket disconnect:
  ws.onclose fires
  We know immediately: connection is down
  Show "Reconnecting..." banner
  Reconnect with exponential backoff

Stale feed (the harder case):
  ws.onclose does NOT fire
  Connection is technically open
  But the market data server stopped sending
  ws.onmessage simply... stops being called
  Only way to detect: check how long since last message

Both need the watchdog, but the disconnect also needs reconnect logic.
The stale feed case only needs the warning + order disable.
```

---

## ─────────────────────────────────────
## PHASE 9 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

What happens when the market is closed? NSE is closed on weekends and public holidays.

---

**Candidate:**

The WebSocket still connects but no ticks flow. Prices shown are the previous day's closing prices — they should be clearly labelled as such.

```
Market status banner:
  ┌────────────────────────────────────┐
  │  Market Closed · Opens Mon 9:15am  │
  └────────────────────────────────────┘

Price display:
  RELIANCE  ₹2847.30  +1.2%  (prev close)
                               ↑ label to clarify it's not live

Order form:
  [Place Order] button disabled with tooltip:
  "Market is currently closed. Orders will be placed at next opening."
  (AMO — After Market Orders are a real feature on Zerodha)
```

---

**Interviewer:**

What is a circuit breaker and how does your UI handle it?

---

**Candidate:**

A circuit breaker is when the exchange temporarily halts trading on a specific stock because of extreme price movement — typically ±10%, ±15%, or ±20% in a short time. The stock becomes untradeable for a few minutes to prevent panic selling.

When a circuit breaker triggers:

```
WebSocket tick for that symbol:
{
  symbol: "ADANIENT",
  ltp: 2100.00,
  circuitBreakerStatus: "UPPER_CIRCUIT",  // or "LOWER_CIRCUIT"
  circuitBreaker: { direction: "up", limit: 2100.00 }
}
```

UI response:

```
WatchlistRow:
  ADANI ENT  ₹2,100  🔴 UPPER CIRCUIT

Chart:
  Horizontal dashed line at ₹2,100 (circuit limit)
  No new candles form (no trading happening)

Order Form:
  ┌──────────────────────────────────────┐
  │  ⛔ ADANI ENT is in Upper Circuit.  │
  │  Trading is currently suspended.    │
  └──────────────────────────────────────┘
  [Place Order] disabled
```

---

## ─────────────────────────────────────
## PHASE 10 — Performance Summary
## ─────────────────────────────────────

---

**Interviewer:**

Summarise all the performance techniques you used.

---

**Candidate:**

```
┌──────────────────────────────────────────────────────────────────┐
│              PERFORMANCE TECHNIQUES SUMMARY                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Mutable ref price buffer                                     │
│     300 tick writes → 0 React re-renders                        │
│     250ms flush → 4 batch re-renders/second                     │
│                                                                  │
│  2. Canvas for charts (not SVG)                                  │
│     9,000 candles = 0 DOM nodes                                  │
│     Only re-draws visible viewport on zoom/pan                   │
│                                                                  │
│  3. Web Worker for indicator computation                         │
│     SMA/RSI/MACD calculated off main thread                      │
│     Main thread stays responsive during computation             │
│                                                                  │
│  4. React.memo on WatchlistRow                                   │
│     Only the rows whose prices actually changed re-render        │
│                                                                  │
│  5. useMemo for P&L calculation                                  │
│     Recalculates 4×/second (with batch flush) not 300×/second   │
│                                                                  │
│  6. Virtual scroll for order book                               │
│     Only render 10 visible bid/ask levels, not full depth        │
│                                                                  │
│  7. Key-based animation restart for price flash                  │
│     Ensures flash animation plays correctly on rapid changes     │
│                                                                  │
│  8. requestAnimationFrame for live candle update                 │
│     Chart redraws sync to browser paint cycle (60fps max)        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ─────────────────────────────────────
## PHASE 11 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

Final summary — what are the three most important decisions in this design?

---

**Candidate:**

**1. Mutable buffer + batch flush for tick data.**
This is the foundational performance decision. Without it, the app is unusable at 30 instruments. Everything else builds on top of a responsive UI.

**2. Canvas for charts, not SVG.**
9,000 candles in the DOM is unworkable. Canvas rendering scales to any amount of historical data with constant DOM cost.

**3. Stale data detection with order form lock.**
In a financial product, showing stale prices while allowing order placement is a liability. The watchdog + order disable is a non-negotiable safety feature.

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

In priority order:

1. **Price alerts** — user sets "notify me when RELIANCE crosses ₹2900." Compare every incoming tick against user-defined alert thresholds. Show a toast notification. Use the Web Worker to run this comparison off the main thread.

2. **Advanced order types** — Stop Loss (SL), Stop Loss Market (SLM), Bracket Order, Cover Order. Each needs a different form UI and explanation.

3. **Options chain view** — for F&O traders, a table of all strike prices with call/put premiums, IV, delta, gamma. This is a separate high-complexity component.

4. **Trade journal** — annotate charts with notes for past trades. "I bought here because of this pattern." Stored locally or synced to backend.

5. **Keyboard shortcuts** — professional traders don't want to use the mouse. B for buy, S for sell, numbers for quantity. Zerodha and NEST all have this.

---

**Interviewer:**

Excellent. Very thorough grasp of the domain.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked about instrument count upfront — the critical performance variable
✅  Identified 300 setState/second as the core problem before any solution
✅  Explained mutable ref + 250ms interval with exact math (75× reduction)
✅  Distinguished setInterval vs rAF with correct reasoning
✅  Described price flash animation with CSS keyframes + key-based restart fix
✅  Chose Canvas over SVG for charts with correct reasoning (DOM node count)
✅  Described Web Worker for indicator computation
✅  Included REVIEWING state in order flow — justified with "money mistake" reasoning
✅  Described real-time order status via WebSocket
✅  Described stale feed detection — separate from disconnect
✅  Circuit breaker and market closed states covered
✅  P&L as derived/computed value — not stored state
```

---

## What Would Have Hurt the Score

```
❌  Calling setState on every WebSocket tick
❌  Using SVG for a 9,000-candle chart
❌  Not knowing what a candlestick chart is made of (OHLCV)
❌  Going directly from "click BUY" to "submitting" without REVIEWING state
❌  Confusing WebSocket disconnect (known immediately) with stale feed (silent)
❌  Not mentioning stale data risk — this shows lack of domain awareness
❌  Computing P&L inside the WebSocket handler (too frequent)
❌  Not knowing what a circuit breaker is
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Tick data volume problem | "300 messages/second. setState each one. What happens?" |
| 2 | Mutable ref + batch flush | "How do you solve it?" |
| 3 | setInterval vs rAF for flush | "Why not requestAnimationFrame?" |
| 4 | Price flash animation | "Price goes up — green flash. How?" |
| 5 | Animation restart on rapid change | "Price changes 5× in 400ms — flash already playing" |
| 6 | Canvas vs SVG for charts | "3-month candlestick chart. SVG or Canvas?" |
| 7 | Live candle buffering | "New tick arrives. How does the forming candle update?" |
| 8 | Web Worker for indicators | "SMA on 9,000 candles. Main thread?" |
| 9 | Order placement state machine | "Walk me through the BUY click" |
| 10 | P&L as useMemo derived value | "50 holdings, live P&L. How?" |
| 11 | Stale feed detection + order lock | "Feed goes silent. Connection stays open. What happens?" |
| 12 | Circuit breaker UI | "What is a circuit breaker and how does your UI handle it?" |
