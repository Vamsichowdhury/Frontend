# Financial Dashboard / Trading Platform — Interview Overview

---

## What Problem Are We Solving?

A financial trading dashboard lets users monitor live market prices, analyse charts, and execute buy/sell orders — all in real time. Think Zerodha Kite, NSE NOW, Bloomberg Terminal, or Robinhood.

```
Exchange feeds:
  RELIANCE  ₹2,847.30  ▲ +1.2%
  TCS       ₹3,912.50  ▼ -0.4%    ← prices changing multiple times/second
  INFY      ₹1,456.80  ▲ +0.8%

User sees:
  ┌──────────────────────────────────────────────────────┐
  │  📈 RELIANCE   ₹2,847.30  +1.2%  [BUY]  [SELL]     │
  │                  ████████████████ candlestick chart  │
  │  Order Book:  Bid 2847.10  |  Ask 2847.50            │
  └──────────────────────────────────────────────────────┘
```

---

## What Makes This Problem Uniquely Hard

```
Normal dashboard:      Fetch data → render → done
Financial dashboard:   50+ instruments × 10 price updates/second
                       = 500 state updates/second
                       = browser melts without throttling ❌

Also unique:
  - Stale price = financial risk (user might trade at wrong price)
  - Order placement = real money, must be reliable
  - Flashing price changes = UX expectation (Bloomberg, Zerodha)
  - Charts must draw 1000s of candles without janking
  - Order book updates 10–50 times/second
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements     →  Scope: stocks? crypto? F&O?            │
│  2. Architecture     →  Data flow from exchange to screen      │
│  3. Tick data        →  WebSocket + throttle + batching        │
│  4. Price flash      →  Green/red animation on change          │
│  5. Candlestick chart→  Canvas rendering, OHLC data            │
│  6. Order book       →  Bid/ask ladder, virtual scroll         │
│  7. Order placement  →  Buy/sell flow, optimistic update       │
│  8. Portfolio P&L    →  Live computation from holdings + prices │
│  9. Performance      →  Web Workers, RAF, mutable refs          │
│  10. Stale data      →  Detect feed silence, show warning      │
│  11. Edge cases      →  Market halt, circuit breaker, no data  │
│  12. Scale           →  1M users, market open surge            │
└────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       EXCHANGE / DATA FEED                       │
│  NSE / BSE / MCX market data (tick data — price, volume, OI)     │
└────────────────────────┬─────────────────────────────────────────┘
                         │  (FIX protocol / proprietary feed)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND MARKET DATA SERVER                    │
│  - Subscribes to exchange feed                                   │
│  - Normalises and aggregates tick data                           │
│  - Fans out to connected clients via WebSocket                   │
│  - Stores historical OHLCV data for charts                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │  WebSocket (wss://)
                         │  ~10–50 messages/second per client
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                                                                  │
│  WebSocket Handler                                               │
│       │                                                          │
│       ├─▶ priceBuffer (mutable ref, not state)                   │
│       │                                                          │
│       └─▶ throttled flush every 250ms                            │
│               │                                                  │
│               ▼                                                  │
│       React State Update (batch)                                 │
│               │                                                  │
│     ┌─────────┴──────────────────────┐                           │
│     │                                │                           │
│     ▼                                ▼                           │
│  Watchlist                       Chart Component                 │
│  (price + flash)                 (Canvas, OHLCV data)            │
│     │                                │                           │
│     ▼                                ▼                           │
│  Order Book                      Portfolio P&L                   │
│  (bid/ask ladder)                (live recalculation)            │
└──────────────────────────────────────────────────────────────────┘
                         │
                         │  HTTP POST (order placement)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                       ORDER MANAGEMENT SYSTEM                    │
│  - Validates order                                               │
│  - Routes to exchange                                            │
│  - Returns order ID + status                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
<TradingApp />
│
├── <TopBar />
│     ├── Search instruments (typeahead)
│     ├── Market status (OPEN / CLOSED / PRE-OPEN)
│     └── Account info + P&L summary
│
├── <Watchlist />                          (left panel)
│     └── <WatchlistRow /> × N
│           ├── Symbol + company name
│           ├── LTP (Last Traded Price)   ← flashes green/red
│           ├── Change % + absolute       ← colored
│           ├── Bid / Ask
│           └── [BUY] [SELL] quick buttons
│
├── <ChartPanel />                         (centre, largest)
│     ├── <ChartToolbar />
│     │     ├── Timeframe selector (1m, 5m, 15m, 1H, 1D)
│     │     └── Indicator selector (SMA, EMA, RSI, MACD)
│     ├── <CandlestickChart />            (Canvas element)
│     │     ├── Price axis (Y)
│     │     ├── Time axis (X)
│     │     ├── OHLC candles
│     │     └── Volume bars (bottom)
│     └── <CrosshairTooltip />            (follow mouse)
│
├── <OrderBook />                          (right panel)
│     ├── Asks (sell orders, red, top)
│     ├── <SpreadIndicator />             (best bid–ask spread)
│     └── Bids (buy orders, green, bottom)
│
├── <OrderForm />                          (bottom right)
│     ├── [BUY] / [SELL] toggle
│     ├── Quantity input
│     ├── Price input (LIMIT / MARKET)
│     └── [Place Order] button
│
└── <OrdersAndPositions />                (bottom panel)
      ├── Tab: Open Orders
      ├── Tab: Positions (holdings + unrealised P&L)
      └── Tab: Trade History
```

---

## Tick Data Structure

```javascript
// Single tick message from WebSocket
{
  symbol: "RELIANCE",
  ltp: 2847.30,          // Last Traded Price
  open: 2810.00,
  high: 2855.00,
  low: 2808.50,
  close: 2820.00,        // previous day's close
  change: 27.30,         // ltp - close
  changePct: 0.97,       // (change / close) * 100
  volume: 4523890,
  totalBuyQty: 23400,
  totalSellQty: 18900,
  bid: 2847.10,          // best bid
  ask: 2847.50,          // best ask
  timestamp: 1699012345678
}

// Order book depth (market depth)
{
  symbol: "RELIANCE",
  bids: [
    { price: 2847.10, qty: 500 },
    { price: 2847.00, qty: 1200 },
    { price: 2846.90, qty: 800 },
    { price: 2846.50, qty: 2000 },
    { price: 2846.00, qty: 3500 }
  ],
  asks: [
    { price: 2847.50, qty: 300 },
    { price: 2847.60, qty: 900 },
    { price: 2847.70, qty: 1500 },
    { price: 2848.00, qty: 2800 },
    { price: 2848.50, qty: 4200 }
  ]
}
```

---

## The Throttle Problem — Why You Can't setState on Every Tick

```
EXCHANGE tick rate: 10 ticks/second per symbol
WATCHLIST symbols:  30 instruments
TOTAL UPDATES:      300 setState calls/second

React re-render cost: ~2ms per re-render
300 × 2ms = 600ms of rendering per second
= browser is rendering 60% of the time
= UI freezes, jank, unusable ❌

SOLUTION — Batch and throttle:

WebSocket message → priceBuffer (mutable ref, no re-render)
                         │
                    requestAnimationFrame (or setInterval 250ms)
                         │
                    ONE batch setState with ALL buffered updates
                         │
                    React re-renders ONCE with all new prices ✅

Result: 4 re-renders/second (250ms × 4 = 1000ms)
instead of 300 re-renders/second
= 75× reduction in render work
```

---

## Candlestick Chart Anatomy

```
Price
  │
2860│
    │                    ┃  ← upper wick (high)
2855│               ┌────┨
    │               │ 🟩 ┃  ← body (open to close, green = close > open)
2850│    ┃          │    ┃
    │    ┃     ┌────┤    ┃
2845│    ┗━━━━━┥ 🟥 │    ┃  ← red body (close < open)
    │         └────┤    ┃
2840│              ┃    ┗  ← lower wick (low)
    │              ┃
    └─────────────────────────────────────── Time
         9:30  9:35  9:40  9:45

Each candle = OHLC data for a time period:
  Open  = first trade price in period
  High  = highest trade price in period
  Low   = lowest trade price in period
  Close = last trade price in period
  Volume = total shares traded in period
```

---

## Order Placement State Machine

```
                ┌─────────────┐
                │    IDLE     │
                └──────┬──────┘
                       │ user clicks BUY / fills form
                       ▼
                ┌─────────────┐
                │  REVIEWING  │  ← show order preview (qty × price = total)
                └──────┬──────┘
                       │ user confirms
                       ▼
                ┌─────────────┐
                │  SUBMITTING │  ← show spinner, disable button
                └──────┬──────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
  ┌─────────────────┐    ┌─────────────────┐
  │     SUCCESS     │    │     FAILED      │
  │ Order #12345    │    │ Insufficient    │
  │ placed ✅       │    │ funds ❌        │
  └─────────────────┘    └─────────────────┘
           │                       │
           └───────────┬───────────┘
                       │ 3 seconds
                       ▼
                ┌─────────────┐
                │    IDLE     │  (reset for next order)
                └─────────────┘
```

---

## P&L Calculation

```
Holdings:
  RELIANCE: 10 shares @ avg buy price ₹2,750

Live LTP from WebSocket: ₹2,847.30

Unrealised P&L:
  = (LTP - avgBuyPrice) × quantity
  = (2847.30 - 2750.00) × 10
  = ₹973.00 (+3.54%)

This recalculates on EVERY price tick for that symbol.
With 30 holdings updating 10× per second = 300 P&L recalculations/second.
Must be throttled the same way as price display.
```

---

## Key Concepts You Will Learn

| Concept | Why It Matters |
|---------|---------------|
| Tick data throttling | 300 updates/sec → UI freeze without batching |
| Mutable ref as price buffer | Skip React renders for intermediate prices |
| requestAnimationFrame batching | Sync updates to browser paint cycle |
| Canvas for charts | SVG can't handle 1000 candles without lag |
| Order book virtualization | 50-deep order book, updates 50×/sec |
| Price flash animation | Visual feedback for up/down price movement |
| Stale price detection | Show warning if feed goes silent |
| Web Workers for indicators | Heavy math (RSI, MACD) off main thread |
| Order placement state machine | Handle submit → confirm → success/fail flow |
| Circuit breaker / market halt UI | Edge case: exchange suspends trading |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Knows WebSocket is needed.
              Basic chart and watchlist components.
Mid-level →   Mentions throttling/debouncing tick data.
              Describes candlestick chart with Canvas.
              Understands order placement flow.
Senior    →   Mutable ref buffer + RAF batching.
              Web Workers for technical indicators.
              Stale data detection.
              Order book virtualisation.
              Precise P&L recalculation performance.
Staff     →   Tick data pipeline architecture.
              Market data normalisation layer.
              Risk checks before order placement.
              Websocket sharding for 1M+ users.
```
