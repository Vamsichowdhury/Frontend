# Microfrontend Learning Project

A complete, working Microfrontend system built for learning. Six independent apps
that work together as one product — without sharing source code.

---

## What is a Microfrontend?

In a normal React app, everything is one bundle. One team, one deploy, one codebase.

In a Microfrontend architecture, the UI is split into multiple independent applications:

```
Traditional App              Microfrontend Architecture
─────────────────            ──────────────────────────────────────────────
                             ┌────────────────────────────────────────────┐
  ┌──────────────┐           │           HOST APP (Shell)                 │
  │              │           │  ┌─────────────┐ ┌─────────┐ ┌─────────┐  │
  │  Everything  │     vs    │  │ Products MFE│ │Cart MFE │ │Orders   │  │
  │  in one app  │           │  │  (React)    │ │ (Vue)   │ │MFE(React│  │
  │              │           │  └─────────────┘ └─────────┘ └─────────┘  │
  └──────────────┘           │  ┌──────────────────────────────────────┐  │
                             │  │        Wishlist MFE  (React)         │  │
                             │  └──────────────────────────────────────┘  │
                             └────────────────────────────────────────────┘
```

**Why would you do this?**
- Team A owns Products, Team B owns Cart, Team C owns Orders, Team D owns Wishlist
- Each team deploys independently — no waiting for each other
- Each team can choose their own framework and tech stack
- A bug in Cart doesn't take down Products

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            BROWSER (one tab)                                 │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      HOST APP  :3000                                  │   │
│  │  NAV: [ Products ] [ Orders ] [ Wishlist ]  [admin] [🌙] [Sign out]  │   │
│  │  URL-based routing — /products  /orders  /wishlist  /wishlist/:id     │   │
│  │                                                                       │   │
│  │  ╔═══════════════════════════════════════════════════════════════╗   │   │
│  │  ║  PRODUCTS LISTING MFE  :3001  (React + Redux Toolkit)        ║   │   │
│  │  ║                                                               ║   │   │
│  │  ║  Products  [+ Add Product]  [🛒 Cart (2)]                    ║   │   │
│  │  ║  ──────────────────────────────────────────────────────────  ║   │   │
│  │  ║  [Laptop $999]   [Add to Cart] [♥] [Delete]  ║ ┌──────────┐ ║   │   │
│  │  ║  [Mouse $29]     [Add to Cart] [♡] [Delete]  ║ │ CART MFE │ ║   │   │
│  │  ║  [Keyboard $79]  [Add to Cart] [♡] [Delete]  ║ │  :3002   │ ║   │   │
│  │  ║                                              ║ │ Vue+Pinia│ ║   │   │
│  │  ║  ✅ Saved "Laptop" to wishlist               ║ │ Laptop × │ ║   │   │
│  │  ╚══════════════════════════════════════════════╝ │ $999     │ ║   │   │
│  │                                                   │ Total$999│ ║   │   │
│  │  ╔══════════════════════════════════════════════╗ │ [Order]  │ ║   │   │
│  │  ║  ORDERS MFE  :3003  (React + Redux Toolkit)  ║ └──────────┘ ║   │   │
│  │  ║  Order #1 — Laptop ×2 — $1998  [Delete]      ║              ║   │   │
│  │  ╚══════════════════════════════════════════════╝              ║   │   │
│  │                                                                       │   │
│  │  ╔══════════════════════════════════════════════════════════════╗   │   │
│  │  ║  WISHLIST MFE  :3004  (React + React Router)                ║   │   │
│  │  ║  /wishlist          — list of saved items  (WishlistList)   ║   │   │
│  │  ║  /wishlist/:id      — item detail view     (WishlistDetail) ║   │   │
│  │  ║  Laptop $999  →  [Move to Cart]  [Remove]                   ║   │   │
│  │  ╚══════════════════════════════════════════════════════════════╝   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                       HTTP (fetch) │
                                    ▼
                   ┌────────────────────────────────┐
                   │           API  :4000            │
                   │       Node.js + Express         │
                   │       In-memory storage         │
                   │                                 │
                   │  POST                /auth/login│
                   │  GET/POST/PUT/DELETE /products  │
                   │  GET/POST/DELETE     /orders    │
                   │  GET/POST/DELETE     /cart      │
                   │  GET/POST/DELETE     /wishlist  │
                   └────────────────────────────────┘
```

---

## Ports at a glance

| App                    | Port | Tech                      | Role    |
|------------------------|------|---------------------------|---------|
| host-app               | 3000 | React + Vite              | Shell   |
| products-listing-mfe   | 3001 | React + Redux RTK         | Remote  |
| cart-mfe               | 3002 | Vue 3 + Pinia             | Remote  |
| orders-mfe             | 3003 | React + Redux RTK         | Remote  |
| wishlist-mfe           | 3004 | React + React Router v6   | Remote  |
| api                    | 4000 | Node + Express            | Backend |

---

## How to run

```bash
# From the root — starts all six apps with one command
npm install
npm run dev
```

Open **http://localhost:3000** and log in with:
- `admin` / `admin123`
- `user` / `user123`

---

## The four big concepts

### 1 — Module Federation (how MFEs load each other)

Module Federation is a Vite plugin that lets one running app import code
from another running app **at runtime**.

```
Normal import (build time):          Module Federation (runtime):
────────────────────────────         ──────────────────────────────────
import X from './local/file'         import('productsList/ProductsListing')
                                              │
                                             ╔╩═════════════════════════════╗
                                             ║ MF intercepts this import    ║
                                             ║ 1. Fetch localhost:3001/     ║
                                             ║    remoteEntry.js            ║
                                             ║ 2. Read manifest →           ║
                                             ║    find chunk URL            ║
                                             ║ 3. Fetch chunk & execute     ║
                                             ║ 4. Return the component      ║
                                             ╚══════════════════════════════╝
```

**What is remoteEntry.js?**

A small manifest file generated by the MF plugin that lists:
- Which modules this app exposes (e.g. `./ProductsListing`, `./Wishlist`)
- Which shared dependencies it has (react, react-dom, react-router-dom…)
- Where to find the actual JavaScript chunks

The Host reads this on every page load — so redeploying a Remote is picked up
automatically without redeploying the Host.

**Nested loading — who loads what:**

```
host-app
  ├── loads productsList/ProductsListing  ← products-listing-mfe as Remote
  │         └── loads cartMFE/Cart        ← cart-mfe as nested Remote
  ├── loads ordersMFE/Orders              ← orders-mfe as Remote
  └── loads wishlistMFE/Wishlist          ← wishlist-mfe as Remote
```

Note: `products-listing-mfe` is BOTH a Remote (exposed to host) AND a Host
(it loads cart-mfe). An app can play both roles at the same time.

---

### 2 — URL Routing across MFEs

The host owns exactly **one** `<BrowserRouter>`. Every MFE that needs routing
shares the same `react-router-dom` singleton (declared in `shared:` config).

```
host-app/src/App.jsx                       wishlist-mfe/src/Wishlist.jsx
──────────────────────────────             ──────────────────────────────
<BrowserRouter>                            // No <BrowserRouter> here!
  <Routes>                                 // MFE just defines sub-routes.
    <Route path="/products"                export default function Wishlist() {
           element={<ProductsListing/>}/>    return (
    <Route path="/orders"                      <Routes>
           element={<Orders/>}/>                 <Route index
    <Route path="/wishlist/*"                          element={<WishlistList/>}/>
           element={<Wishlist/>}/>               <Route path=":productId"
  </Routes>                                            element={<WishlistDetail/>}/>
</BrowserRouter>                               </Routes>
                                           );
                                         }
```

The `/*` splat on `/wishlist/*` means the host hands full control of every
URL under `/wishlist/` to the Wishlist MFE — including `/wishlist/3`, which
the host never explicitly knows about.

```
URL visited           Host matches       MFE then renders
──────────────────    ───────────────    ─────────────────────────────────
/products             /products          ProductsListing (no sub-routes)
/orders               /orders            Orders (no sub-routes)
/wishlist             /wishlist/*        WishlistList (index route)
/wishlist/3           /wishlist/*        WishlistDetail — useParams → id=3
```

**react-router-dom must be a shared singleton.** Two copies = two React
contexts = MFE routes see no router and crash silently.

---

### 3 — Cross-MFE communication (Custom Events on globalThis)

MFEs have isolated JavaScript scopes. Direct imports between them are impossible:

```js
// ❌ Does NOT work — different bundles, different servers
import { cartStore } from '../cart-mfe/src/cartStore.js'
```

All MFEs in the same browser tab share one `window` object (`globalThis`).
Custom Events use it as a message bus.

**Events used in this project:**

```
Fired by                  Event name       Received by            Purpose
──────────────────────    ─────────────    ───────────────────    ──────────────────────────
products-listing-mfe      add-to-cart      cart-mfe (Vue)         Add product to cart
wishlist-mfe (detail)     add-to-cart      cart-mfe (Vue)         Move wishlist item to cart
cart-mfe (Vue)            order-placed     products-listing-mfe   Show success banner
cart-mfe (Vue)            order-placed     orders-mfe (React)     Add order to list live
cart-mfe (Vue)            cart-updated     products-listing-mfe   Update cart count badge
```

```js
// Firing an event (products-listing-mfe):
globalThis.dispatchEvent(new CustomEvent('add-to-cart', { detail: { product } }))

// Receiving it (cart-mfe):
globalThis.addEventListener('add-to-cart', (e) => store.addItem(e.detail.product))
```

Why this works: `globalThis` is the same object for ALL scripts in the same browser
tab, regardless of framework, bundle, or server origin.

---

### 4 — Mounting Vue inside React (the mount function pattern)

React cannot render a Vue component directly. The solution: expose a plain JS function.

```
REACT (CartSidebar component)        VUE (mount.js — what MF exposes)
──────────────────────────           ────────────────────────────────
const ref = useRef()
let cancelled = false

import('cartMFE/Cart')
  .then(({ mountCart }) => {
    if (!cancelled)              export function mountCart(container) {
      mountCart(ref.current) ──►   const app = createApp(Cart)
  })                               app.use(createPinia())
                                   app.mount(container)
return () => {                     return () => app.unmount()
  cancelled = true            }◄── returns cleanup fn
  unmount?.()
}

return <div ref={ref} />    // empty div Vue fills
```

**Why `cancelled` flag?** React StrictMode (dev only) mounts components twice.
Without `cancelled`, two Vue apps attach to the same div. The flag ensures only
the second (valid) mount proceeds.

**Why CartSidebar is always in the DOM:**

```jsx
// ❌ Vue app destroyed on close — event listener lost — add-to-cart missed
{sidebarOpen && <CartSidebar />}

// ✅ Vue stays alive — only hidden with CSS class
<div className={`cart-sidebar${sidebarOpen ? ' cart-sidebar--open' : ''}`}>
  <CartSidebar />   {/* always mounted */}
</div>
```

---

## Complete user flow

```
User opens http://localhost:3000
  ├── Host checks localStorage for saved session
  ├── No session → Login page renders
  ├── User enters admin/admin123 → POST /auth/login → 200 OK
  ├── Session saved to localStorage (survives refresh)
  └── Host renders navbar + BrowserRouter → redirects to /products

User on /products page
  ├── products-listing-mfe mounts → GET /products + GET /wishlist
  ├── CartSidebar mounts (hidden) → Vue cart app starts → GET /cart
  └── Heart buttons show ♥ for already-saved items, ♡ for unsaved

User clicks "Add to Cart"
  ├── products-listing-mfe fires 'add-to-cart' event
  ├── cart-mfe receives it → POST /cart → API increments quantity if exists
  ├── cart-mfe fires 'cart-updated' with new count
  ├── products-listing-mfe updates cart badge count
  └── cart sidebar opens

User clicks ♡ heart on a product
  ├── products-listing-mfe → POST /wishlist
  ├── Heart turns ♥ red immediately (local state update)
  └── Banner: "Saved 'Laptop' to wishlist"

User clicks "Wishlist" in navbar
  ├── URL changes to /wishlist (no page reload)
  ├── wishlist-mfe lazy-loads from :3004/remoteEntry.js (first visit only)
  ├── WishlistList renders → GET /wishlist → shows saved items
  └── Each item is a <Link> to /wishlist/:productId

User clicks a wishlist item
  ├── URL changes to /wishlist/1
  ├── WishlistDetail renders — reads productId via useParams()
  ├── "Move to Cart" → fires 'add-to-cart' event + DELETE /wishlist/:id → /wishlist
  └── "Remove" → DELETE /wishlist/:id → navigate back to /wishlist

User clicks browser Back button
  └── URL history works normally — back to /wishlist list, then /products, etc.

User clicks "Place Order" in cart
  ├── Pinia: POST /orders → API stores order
  ├── Pinia: DELETE /cart → API clears cart
  ├── Pinia fires 'order-placed' event
  ├── products-listing-mfe shows green banner (5s auto-dismiss)
  └── orders-mfe (if open) adds order to list live

User clicks "Sign out"
  ├── localStorage.removeItem('auth_user')
  └── Login page returns — BrowserRouter unmounts, all MFE state wiped
```

---

## Auth

Login is host-only — MFEs know nothing about it. If you're not logged in, the host
simply doesn't render the MFE shell at all. The API has no auth middleware; routes
are open to anyone who can reach port 4000.

---

## Cart persistence

Cart items live in the API (in memory). Refreshing the browser keeps your cart
because cart-mfe calls `GET /cart` on every mount. Restarting the API clears it
(in-memory, not a database). Same applies to orders and wishlist.

---

## Async bootstrap pattern

Every MFE uses this two-file entry point:

```
src/main.jsx                    src/bootstrap.jsx
────────────────────────────    ────────────────────────────────────
import('./bootstrap.jsx')       import React from 'react'
                                import ReactDOM from 'react-dom/client'
// dynamic import = async       ReactDOM.createRoot(...).render(<App />)
// boundary for MF negotiation
```

**Why?** Module Federation negotiates shared modules asynchronously. A direct
top-level `import React` in `main.jsx` loads React before MF can negotiate
which version to use — causing:
`"Shared module is not available for eager consumption"`

The dynamic `import()` delays execution until after MF negotiates.

---

## Error isolation

Each MFE is wrapped in its own `<ErrorBoundary>` in the host. If one MFE's
server is down or crashes, only that MFE shows a "Try again" fallback — the
navbar, theme toggle, and all other MFEs keep working normally.

```jsx
<Route path="/wishlist/*" element={
  <ErrorBoundary name="Wishlist">       ← catches network errors (server down)
    <Suspense fallback="Loading...">    ← shows while chunk downloads
      <Wishlist />
    </Suspense>
  </ErrorBoundary>
} />
```

**Important:** all MFE dev servers must be running before opening the host.
If any remote's `remoteEntry.js` fails to fetch, the federation runtime may
error in a way that affects other dynamic imports. Start everything with
`npm run dev` from the root.
