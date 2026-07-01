# Visual Flow Diagrams

These diagrams show the exact sequence of events that happen at runtime in this project.
Read them alongside the code — every arrow maps to a real line you can find.

---

## 1. Module Federation Loading Sequence

What happens when the browser first opens `http://localhost:3000`.

```
Browser opens localhost:3000
        │
        ▼
  host-app (Vite, port 3000)
  serves index.html + main bundle
        │
        ▼
  React starts, hits this line in App.jsx:
  const ProductsListing = lazy(() => import('productsList/ProductsListing'))
        │
        │  (lazy doesn't load anything yet — it waits until the component is rendered)
        │
        ▼
  User is NOT logged in → Login page renders
  (ProductsListing never mounts, no remote fetch happens yet)
        │
        ▼
  User logs in → auth state set → App re-renders → Products page shown
        │
        ▼
  React tries to render <ProductsListing />
  Suspense activates: shows "Loading..." fallback
        │
        ▼
  Module Federation runtime fetches:
  http://localhost:3001/remoteEntry.js        ← the "manifest" of the remote
        │
        ▼
  remoteEntry.js tells the host what chunks exist
  and which packages are already shared (e.g. react)
        │
        ▼
  Host checks: "do I already have react@18?"  YES → skip download
        │
        ▼
  Federation downloads only the NEW chunk:
  http://localhost:3001/assets/ProductsListing-[hash].js
        │
        ▼
  Chunk executes → ProductsListing component is now available
        │
        ▼
  Suspense resolves → "Loading..." disappears → ProductsListing renders
        │
        ▼
  ProductsListing fetches GET /products from the API
  Products appear on screen ✓


  Second navigation (Products → Orders):
  ────────────────────────────────────────
  User clicks "Orders" button
        │
        ▼
  page state changes → <Orders /> tries to mount
  Suspense: "Loading..." again (first time only)
        │
        ▼
  Fetches http://localhost:3003/remoteEntry.js
  Then downloads the Orders chunk
        │
        ▼
  Orders renders, fetches GET /orders ✓

  NOTE: After first load, chunks are cached by the browser.
  Switching back to Products is instant — no network request.
```

---

## 2. Custom Event Lifecycle (Add to Cart)

What happens when the user clicks "Add to Cart" on a product.

```
  products-listing-mfe (React, port 3001)
  ┌──────────────────────────────────────┐
  │  User clicks "Add to Cart" button    │
  │  on the Laptop product card          │
  └─────────────┬────────────────────────┘
                │
                ▼
  ProductsListing.jsx fires a Custom Event:

  globalThis.dispatchEvent(new CustomEvent('add-to-cart', {
    detail: { productId: 1, name: 'Laptop', price: 999 }
  }))
                │
                │  (the event travels on the global window object,
                │   crossing the MFE boundary with zero imports)
                │
                ▼
  cart-mfe (Vue, port 3002) was mounted by host-app.
  Its setup() registered a listener on mount:

  globalThis.addEventListener('add-to-cart', handleAddToCart)
                │
                ▼
  handleAddToCart receives the event
  Calls POST /cart  { productId: 1, name: 'Laptop', price: 999 }
  API adds item (or increments quantity) in server memory
                │
                ▼
  API responds: { items: [...updated cart...] }
                │
                ▼
  Cart Vue component updates its local state
  Cart badge count increases (e.g. shows "1")
                │
                ▼
  Cart fires its own event back:
  globalThis.dispatchEvent(new CustomEvent('cart-updated', {
    detail: { items: [...], count: 1 }
  }))
                │
                ▼
  ProductsListing is also listening for 'cart-updated'
  Updates the badge number on the cart icon in the header ✓


  Cleanup on unmount:
  ─────────────────────────────────────────────────
  When cart-mfe unmounts (e.g. host navigates away):

  return () => {
    globalThis.removeEventListener('add-to-cart', handleAddToCart)
  }

  Without this, every remount ADDS another listener.
  After 3 mounts you'd have 3 listeners → item added 3× per click.
  React StrictMode mounts twice in dev — this is why the cancelled
  flag + removeEventListener pattern is essential.
```

---

## 3. Auth Flow

What happens from the moment the user opens the app to when they sign out.

```
  ┌─ Browser opens localhost:3000 ─────────────────────────────────┐
  │                                                                  │
  │  App.jsx runs this on first render:                             │
  │  const saved = localStorage.getItem('auth_user')               │
  │                                                                  │
  │         ┌────────────────┬──────────────────┐                  │
  │    saved = null           saved = '{"id":1,"username":"admin"}' │
  │         │                │                                      │
  └─────────┼────────────────┼──────────────────────────────────────┘
            │                │
            ▼                ▼
     auth = null        auth = { id: 1, username: 'admin' }
            │                │
            ▼                ▼
    Show Login page     Show full app (skip login) ← refresh survives!
            │
            ▼
  User types username + password, clicks "Sign in"
            │
            ▼
  Login.jsx calls:
  POST http://localhost:4000/auth/login
  { username: "admin", password: "admin123" }
            │
            ├── Wrong credentials ──────────────────────────────┐
            │                                                    │
            │                              API returns 401       │
            │                              { error: "Invalid..." }
            │                                                    │
            │                              Login shows red error box
            │                              User stays on login page ◄─┘
            │
            ├── Correct credentials ─────────────────────────────┐
            │                                                     │
            ▼                                                     │
  API returns 200                                                 │
  { user: { id: 1, username: "admin" } }                         │
            │                                                     │
            ▼                                                     │
  Login.jsx calls onLogin(user) prop                              │
            │                                                     │
            ▼                                                     │
  App.jsx handleLogin():                                          │
  localStorage.setItem('auth_user', JSON.stringify(user))        │
  setAuth(user)                                                   │
            │                                                     │
            ▼                                                     │
  auth state is now set → React re-renders                        │
  Login page unmounts, full app (navbar + MFEs) mounts ✓         │
            │                                                     │
            ▼                                                     │
  Navbar shows:  Shop | Products | Orders | [admin] [toggle] [Sign out]
            │
            ▼
  User clicks "Sign out"
            │
            ▼
  App.jsx handleLogout():
  localStorage.removeItem('auth_user')
  setAuth(null)
            │
            ▼
  auth = null → React re-renders
  Full app unmounts, Login page mounts again ✓
  (MFE state is wiped — cart badge resets, page resets to 'products')


  What the API does NOT do:
  ─────────────────────────
  • No session tokens or JWTs are issued
  • No cookie is set
  • /products, /orders, /cart are open — no auth check on any route
  • The API only validates credentials at login time
  • Session lifetime is controlled entirely by localStorage in the browser
```

---

## Summary

| Diagram | Key insight |
|---------|-------------|
| Module Federation | Remotes are downloaded lazily, only when first rendered. React is shared — downloaded once. |
| Custom Events | Events cross MFE boundaries via `globalThis`. Always remove listeners on unmount or you get duplicate handlers. |
| Auth flow | Auth lives in host-app only. `localStorage` survives refresh. MFEs are fully unaware of auth — the host simply doesn't render them until the user is logged in. |
