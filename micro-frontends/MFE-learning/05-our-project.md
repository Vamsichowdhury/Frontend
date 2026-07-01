# 05 — Our Project: A Full Walkthrough

This file walks through the shop project in this repository as a complete
case study. Every concept from files 01–04 appears somewhere here.

---

## Architecture at a glance

```
Browser
  └── host-app (localhost:3000)  ← shell: navbar, auth, page routing
        ├── products-listing-mfe (localhost:3001)  ← products grid + cart button
        │     └── cart-mfe (localhost:3002)  ← Vue cart sidebar (nested inside React)
        └── orders-mfe (localhost:3003)  ← order history

All MFEs ──── fetch/POST/DELETE ────► api (localhost:4000)  ← Express, in-memory
```

---

## Each app's responsibility

### host-app
- Renders the navbar (brand, Products link, Orders link, theme toggle, logout)
- Owns authentication state — if not logged in, shows the login page
- Loads the two main MFEs via Module Federation (`React.lazy`)
- Does NOT contain any business logic

### products-listing-mfe
- Fetches and displays products from `GET /products`
- Add/delete products
- "Add to Cart" fires the `add-to-cart` Custom Event + opens the sidebar
- Hosts the cart sidebar (always in DOM, hidden with CSS when closed)
- Listens for `cart-updated` → updates the cart count badge
- Listens for `order-placed` → shows the success banner

### cart-mfe (Vue + Pinia)
- Fetches cart from `GET /cart` on mount (restores from API on refresh)
- Listens for `add-to-cart` → calls `POST /cart`
- Remove item → calls `DELETE /cart/:productId`
- Place order → calls `POST /orders`, then `DELETE /cart`, fires `order-placed`
- After every mutation fires `cart-updated` with the new item count

### orders-mfe
- Fetches all orders from `GET /orders` on every mount
- Listens for `order-placed` → prepends the new order live (no re-fetch needed)
- Delete order → calls `DELETE /orders/:id`

### api
- In-memory Express server (data resets on restart)
- No authentication on routes (the login gate is UI-only in this project)
- Endpoints: `/auth/login`, `/products`, `/cart`, `/orders`

---

## Full user flows

### Flow 1: Logging in

```
1. User opens localhost:3000
2. host-app checks localStorage for 'auth_user'
3. Not found → renders <Login /> instead of the shell
4. User types "admin" / "admin123" → clicks Sign In
5. host-app POSTs to /auth/login
6. API checks credentials → returns { user: { username: 'admin' } }
7. host-app stores user in localStorage + sets auth state
8. host-app now renders the full navbar + MFEs
```

### Flow 2: Viewing products

```
1. host-app renders <ProductsListing /> (loaded via Module Federation)
2. ProductsListing mounts → fetches GET /products → Redux setProducts
3. Products appear in a grid
4. CartSidebar mounts → mountCart(div) called → Vue app created inside div
5. Cart.vue mounts → fetches GET /cart → Pinia items populated
6. cart-updated event fires → products-listing-mfe updates badge count
```

### Flow 3: Adding to cart

```
1. User clicks "Add to Cart" on a product card
2. products-listing-mfe fires Custom Event 'add-to-cart' with product data
3. products-listing-mfe also dispatches Redux openSidebar()
4. cart-mfe's add-to-cart listener fires → store.addItem(product)
5. cart-mfe POSTs to /cart → API increments qty or adds new item
6. API returns updated items array
7. cart-mfe updates Pinia items → cart shows new item
8. cart-mfe fires 'cart-updated' with new count
9. products-listing-mfe's listener updates the badge number
```

### Flow 4: Placing an order

```
1. User clicks "Place Order" in the cart sidebar
2. cart-mfe calls store.placeOrder()
3. POSTs to /orders with items array
4. DELETEs /cart (clears the cart)
5. Fires 'order-placed' Custom Event with { order, message }
6. products-listing-mfe hears it → dispatches showBanner(message)
7. orders-mfe hears it → dispatches addOrder(order) → order appears at top
8. 'cart-updated' fires with count=0 → badge disappears
```

### Flow 5: Navigating to Orders

```
1. User clicks "Orders" in the navbar
2. host-app unmounts <ProductsListing /> (React.lazy conditional render)
3. host-app renders <Orders /> (downloaded from localhost:3003 if first visit)
4. Orders mounts → fetches GET /orders → shows all orders, newest first
5. 'order-placed' listener registered — live updates ready
```

---

## How Module Federation is wired up

```
host-app loads:
  productsList/ProductsListing  ←  http://localhost:3001/remoteEntry.js
  ordersMFE/Orders              ←  http://localhost:3003/remoteEntry.js

products-listing-mfe loads:
  cartMFE/Cart                  ←  http://localhost:3002/remoteEntry.js

Note: host-app does NOT directly load cart-mfe.
      cart-mfe is nested inside products-listing-mfe.
```

The host only knows about MFEs it renders directly. The cart lives inside the
products sidebar — that relationship is internal to products-listing-mfe.

---

## Shared dependencies

```
React shared singletons (products-listing-mfe + orders-mfe):
  react, react-dom, react-redux, @reduxjs/toolkit

Vue shared singletons (cart-mfe):
  vue

Result: React loads once. Vue loads once. No duplicates.
```

---

## State ownership map

```
Who owns what state:

host-app
  ├── auth: { username } | null        ← localStorage + React useState
  ├── page: 'products' | 'orders'     ← React useState
  └── isDark: boolean                  ← localStorage + React useState

products-listing-mfe (Redux)
  ├── products.items: []               ← from GET /products
  ├── ui.sidebarOpen: boolean
  ├── ui.banner: string | null
  └── [local] cartCount: number        ← from 'cart-updated' events

cart-mfe (Pinia)
  ├── items: []                        ← from GET /cart (API)
  ├── placing: boolean
  └── loading: boolean

orders-mfe (Redux)
  └── orders.items: []                 ← from GET /orders
```

State never crosses MFE boundaries directly.
Cross-MFE communication only happens via Custom Events or the API.

---

## What this project deliberately leaves out (for simplicity)

| Feature | Why left out |
|---------|-------------|
| JWT tokens / real auth | "Login page only" was the requirement — API routes stay open |
| Per-user cart/orders | Adds complexity; global cart is fine for learning |
| Error boundaries | Would obscure the main concepts |
| Loading skeletons | CSS/UX work that distracts from MFE concepts |
| Tests | Would double the codebase size |
| CI/CD | Out of scope for a local learning project |
| TypeScript | The project uses plain JavaScript to keep config simple |

---

## Things to try to deepen your understanding

1. **Open the Network tab** in browser DevTools while loading the app.
   Watch `remoteEntry.js` files load from ports 3001, 3002, 3003.

2. **Stop one remote** (e.g. kill the cart-mfe dev server).
   Notice the host still loads — but the cart sidebar fails silently.
   This is the "independent deployability" property: one MFE failing doesn't
   take down the others.

3. **Add a console.log to `mountCart`** in `cart-mfe/src/mount.js`.
   Reload and watch it fire once. Then remove the `cancelled` flag from
   CartSidebar and watch it fire twice.

4. **Add a new product** and refresh. It disappears — the API is in-memory.
   This demonstrates why real apps use a database.

5. **Open the Orders page in a second tab** while placing an order from the
   first tab. The second tab won't update — Custom Events don't cross browser
   tabs. The second tab needs a WebSocket or polling for live cross-tab updates.

6. **Try adding the same product twice**. Notice the quantity shows ×2 instead
   of two separate items — this is handled by the API's `POST /cart` which
   increments quantity when the same `productId` already exists.

---

## Congratulations

You now understand:

- What Micro-Frontends are and when to use them
- How Module Federation loads remote code at runtime
- How Custom Events let MFEs communicate without coupling
- The mount function pattern for embedding Vue inside React
- The always-mounted pattern for keeping listeners alive
- The cancelled flag for React StrictMode
- Independent Redux/Pinia stores per MFE
- How auth can live entirely in the host shell

The best next step is to build a small MFE project of your own.
Start with two React MFEs that communicate via one Custom Event.
Then add a third MFE in a different framework.
