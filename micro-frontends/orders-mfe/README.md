# orders-mfe

React + Redux Toolkit Microfrontend. Runs on **http://localhost:3003**.
Shows the full order history with delete support.

---

## What it does

- Fetches all existing orders from `GET /orders` on every mount (newest first)
- Displays each order with its items (with quantity), total, and timestamp
- Each order has a Delete button (`DELETE /orders/:id`)
- If the Orders page is open when a new order is placed, the list updates live
  via the `order-placed` Custom Event — no page refresh needed

---

## Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3003 standalone.

---

## Module Federation config

```js
federation({
  name: 'ordersMFE',
  filename: 'remoteEntry.js',
  exposes: {
    './Orders': './src/Orders.jsx',
  },
  shared: {
    react:              { singleton: true },
    'react-dom':        { singleton: true },
    'react-redux':      { singleton: true },
    '@reduxjs/toolkit': { singleton: true },
  },
})
```

---

## Redux store

```
state
  └── orders
        └── items: []    ← order list

actions
  ├── setOrders(array)    replaces entire list (used on mount fetch)
  ├── addOrder(order)     prepends one order (used on live event)
  └── removeOrder(id)     filters out one order by id (used on delete)
```

---

## Two ways orders appear in the list

```
Path 1 — Navigate to Orders page
──────────────────────────────────────────────────────────
orders-mfe mounts → fetch GET /orders → dispatch(setOrders(...))
All existing orders shown, newest first (.slice().reverse())

Path 2 — Order placed while Orders page is open
──────────────────────────────────────────────────────────
cart-mfe fires 'order-placed' event
  └── listener: dispatch(addOrder(event.detail.order))
        └── New order prepended to list instantly (unshift)
```

Path 1 ensures you never miss orders when navigating to the page.
Path 2 gives live updates if the page is already open.
These two paths are complementary, not redundant.

---

## Event received

```
Event          Source      Action
────────────   ─────────   ────────────────────────────────────────
order-placed   cart-mfe    dispatch(addOrder(event.detail.order))
```

Listener setup and cleanup in `useEffect`:
```js
function onOrderPlaced(e) { dispatch(addOrder(e.detail.order)) }
globalThis.addEventListener('order-placed', onOrderPlaced)
return () => globalThis.removeEventListener('order-placed', onOrderPlaced)
```

The cleanup (`return () => ...`) is critical. Without it, every navigation
to the Orders page adds another listener. After 5 visits, `addOrder` would
fire 5 times per event — showing duplicate orders.

---

## Why fetch on every mount?

The `useEffect` dependency array is `[dispatch]`, which never changes —
so the effect runs once per mount. Every time the user navigates to Orders,
the component mounts fresh, the fetch runs, and state is replaced with the
current server data.

This handles the case where the user placed an order on the Products page
while the Orders page was not mounted (missed the `order-placed` event).
On next navigation to Orders, the fetch catches everything up.

---

## Provider pattern

```jsx
function Orders() {
  return (
    <Provider store={store}>    // this MFE's own Redux store
      <OrdersContent />
    </Provider>
  )
}
```

Each MFE has its own independent Redux store instance. The `Provider` scopes
`useSelector` and `useDispatch` to this store only — no interference with the
`products-listing-mfe` store.
