# host-app

React shell application. Runs on **http://localhost:3000**.
Provides the navbar and loads Remote MFEs at runtime via Module Federation.

---

## What it does

- Renders the navbar with Products and Orders navigation links
- Switches between the Products page and the Orders page
- Loads `products-listing-mfe` and `orders-mfe` via Module Federation at runtime

The host is intentionally thin. All business logic (cart, products, orders)
lives inside the MFEs that own it.

---

## Install & run

```bash
npm install
npm run dev
```

Requires all remotes running first (ports 3001, 3002, 3003) and the API (port 4000).

---

## Module Federation config

```js
federation({
  name: 'host',
  remotes: {
    productsList: {
      type: 'module',   // remoteEntry.js is ESM — must specify 'module'
      entry: 'http://localhost:3001/remoteEntry.js',
      ...
    },
    ordersMFE: {
      type: 'module',
      entry: 'http://localhost:3003/remoteEntry.js',
      ...
    },
    // cartMFE is NOT here — products-listing-mfe loads it, not the host
  },
})
```

**Why `type: 'module'`?**
`@module-federation/vite` generates ES module remoteEntry files. Without
`type: 'module'`, the runtime loads them as classic scripts and throws
`SyntaxError: Cannot use import statement outside a module`.

**Why isn't cartMFE listed?**
The host only knows about MFEs it renders directly. The cart lives inside
products-listing-mfe's sidebar — that MFE loads cart-mfe on its own.

```
host-app
  ├── productsList → products-listing-mfe  (renders products + cart sidebar)
  └── ordersMFE   → orders-mfe             (renders order history)
```

---

## Remote loading with React.lazy + Suspense

```jsx
// These trigger Module Federation at runtime — NOT local imports
const ProductsListing = lazy(() => import('productsList/ProductsListing'))
const Orders          = lazy(() => import('ordersMFE/Orders'))

<Suspense fallback={<p>Loading...</p>}>
  {page === 'products' && <ProductsListing />}
  {page === 'orders'   && <Orders />}
</Suspense>
```

On first visit to a page, the remote chunk is fetched and cached.
Suspense shows the fallback during that initial download.

---

## Why the cart button is NOT in the host

In earlier designs, the host had a cart button that fired a `cart-open` event
across the MFE boundary. That required:
- A `globalThis` event listener in products-listing-mfe
- A `globalThis.__openCartOnMount` flag for the navigate-then-open case

Moving the cart button inside products-listing-mfe eliminates all of that.
The cart open/close is now a plain `dispatch(openSidebar())` — no cross-boundary
events needed just to open a sidebar.

**Rule of thumb:** if a UI element only makes sense on one page, keep it in
that page's MFE, not in the host navbar.

---

## What the host does NOT do

- Manage cart state → belongs to cart-mfe (Pinia + API)
- Manage product list → belongs to products-listing-mfe (Redux + API)
- Show a cart button → the cart button lives inside products-listing-mfe
- Handle order placement → belongs to cart-mfe
- Import source code from MFEs → only via Module Federation remotes

---

## File structure

```
host-app/
  src/
    main.jsx        ← async bootstrap (import('./bootstrap.jsx'))
    bootstrap.jsx   ← creates React root, renders App
    App.jsx         ← navbar + page state + lazy MFE components
    App.css         ← minimal global styles
  index.html
  vite.config.js    ← Module Federation host config
  package.json
```
