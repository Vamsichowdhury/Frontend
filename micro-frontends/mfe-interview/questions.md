# MFE / Module Federation / SPA — Interview Questions

Beginner-friendly explanations with simple examples.
Each question includes: what to say, why it matters, and a code snippet.

---

## Table of Contents

- [Part 1 — SPA Fundamentals](#part-1--spa-fundamentals)
- [Part 2 — Micro-Frontend Basics](#part-2--micro-frontend-basics)
- [Part 3 — Module Federation](#part-3--module-federation)
- [Part 4 — Communication Between MFEs](#part-4--communication-between-mfes)
- [Part 5 — Patterns & Pitfalls](#part-5--patterns--pitfalls)
- [Part 6 — Architecture & Design](#part-6--architecture--design)
- [Part 7 — Advanced & Scenario Questions](#part-7--advanced--scenario-questions)
- [Quick-Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## Part 1 — SPA Fundamentals

---

### Q1. What is a Single Page Application (SPA)?

**Answer:**
A Single Page Application is a web app that loads **one HTML page** and updates
the content dynamically using JavaScript — without doing a full page reload for
every navigation.

When you click "Go to Orders", instead of the browser fetching a new HTML page
from the server, JavaScript swaps out the content on the existing page.

**Simple example — without SPA (traditional):**
```
User clicks "Orders" link
  → Browser sends GET /orders to server
  → Server returns a whole new HTML page
  → Browser discards old page, renders new one
  → All JS re-downloads, page flashes
```

**With SPA:**
```
User clicks "Orders" button
  → JavaScript intercepts the click
  → JS hides the Products section, shows the Orders section
  → URL changes to /orders (using History API)
  → No server round-trip, no page flash, instant feel
```

**One-liner:** A SPA loads once and then JavaScript handles all navigation.

---

### Q2. What is the difference between SPA and MPA (Multi-Page Application)?

| | SPA | MPA |
|---|---|---|
| Page loads | One initial load | Full reload on every navigation |
| Speed | Fast after initial load | Slower (each page is a request) |
| SEO | Harder (no HTML content by default) | Easy (server sends complete HTML) |
| Examples | Gmail, Figma, Google Maps | Wikipedia, e-commerce product pages |
| Complexity | Higher (routing, state management) | Lower |

**When to use SPA:** Apps where user interaction is the focus (dashboards, tools, chat).

**When to use MPA:** Content-heavy sites where SEO matters (news, blogs, product pages).

---

### Q3. How does routing work in a SPA?

**Answer:**
SPAs use the browser's **History API** to change the URL without reloading the page.
A JavaScript router library (React Router, Vue Router) watches the URL and renders
the right component.

```jsx
// React Router example
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/orders"  element={<Orders />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}
```

When the user visits `/orders`:
1. React Router reads `window.location.pathname`
2. Matches it to the `/orders` route
3. Renders the `<Orders />` component
4. No server request happens

**Note:** In the shop project we didn't use React Router — we used simple
`useState('products' | 'orders')` since there are only two pages.

---

### Q4. What are the drawbacks of SPAs?

**Answer — the three main ones:**

1. **First load is slow** — the browser has to download the entire JavaScript
   bundle before anything shows. A large SPA can take 5–10 seconds to load on a
   slow connection.

2. **SEO is harder** — search engine crawlers receive an empty HTML page.
   They have to wait for JavaScript to run before seeing content. Solutions:
   Server-Side Rendering (SSR) or pre-rendering.

3. **Memory management** — since the page never reloads, memory leaks accumulate.
   Event listeners that aren't cleaned up, timers that keep running, etc.

---

### Q5. What is lazy loading and why is it important in SPAs?

**Answer:**
Instead of bundling ALL your JavaScript into one giant file (downloaded on first
visit), lazy loading splits code into **chunks** that are downloaded only when
needed.

```jsx
// Without lazy loading — Orders code downloads immediately even if user never visits it
import Orders from './Orders';

// With lazy loading — Orders code downloads only when user navigates to Orders
const Orders = React.lazy(() => import('./Orders'));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Orders />
    </Suspense>
  );
}
```

**Why it matters:** A user who only ever visits the Products page should never
have to download the Orders code. Lazy loading keeps the initial bundle small
and the first load fast.

---

## Part 2 — Micro-Frontend Basics

---

### Q6. What is a Micro-Frontend?

**Answer:**
A Micro-Frontend (MFE) is an independently deployable piece of a frontend
application. The idea is taken from microservices (small independent backend
services) and applied to the frontend.

**Monolith vs MFE — simple analogy:**

Think of a large restaurant:
- **Monolith** = one chef does everything (cooking, serving, cleaning). One person's
  mistake shuts down the whole restaurant.
- **MFE** = separate teams for the kitchen, the bar, and the service. Each team
  operates independently. The bar can have a new cocktail menu without affecting
  the kitchen.

```
Monolith:                        Micro-Frontends:
───────────────────              ─────────────────────────────────
One repo                         Many repos (or one monorepo)
One build                        Each MFE builds independently
One deployment                   Each MFE deploys independently
One team touches everything      Each team owns their MFE
```

---

### Q7. Why would you use Micro-Frontends?

**Answer — three main reasons:**

1. **Independent deployment:** The cart team can fix a bug and deploy at 3pm
   without waiting for the products team to finish their feature.

2. **Team autonomy:** Each team owns their MFE end-to-end. They pick their
   own framework, tooling, and release cadence.

3. **Technology freedom:** One team uses React, another uses Vue, another uses
   Angular. They all compose together in the browser.

---

### Q8. When should you NOT use Micro-Frontends?

**Answer:**
MFEs add significant complexity. Avoid them when:

- You're a solo developer or a team of 2–3 people
- Your app is small (a landing page, a simple dashboard)
- The overhead of coordinating between MFEs outweighs the benefits
- You don't have separate deployment requirements

> Rule of thumb: if you can hold the entire codebase in your head,
> you don't need MFEs. Start as a monolith, split only when teams
> start blocking each other.

---

### Q9. What is the difference between vertical and horizontal split in MFEs?

**Answer:**

**Vertical split** (most common) — split by **business domain / page:**
```
host-app
  ├── products-mfe    (everything on the products page)
  ├── cart-mfe        (everything cart-related)
  └── orders-mfe      (everything on the orders page)
```
Each MFE owns a full vertical slice of the app.

**Horizontal split** — split by **UI layer:**
```
host-app
  ├── header-mfe      (just the top navigation)
  ├── sidebar-mfe     (just the sidebar)
  └── content-mfe     (just the main content area)
```
Different teams own different parts of the same page.

**Which is better?** Vertical split is almost always preferred. Horizontal split
creates tight coupling — every page change requires coordination between teams.

---

### Q10. What is a Host and what is a Remote in MFE architecture?

**Answer:**

**Host (Shell):** The app that **loads** other apps. It provides the overall
layout, navigation, and assembles the pieces together.

**Remote:** An app that **exposes** some of its code to be loaded by the host.

```
host-app (port 3000)  ← HOST
  ├── loads ProductsListing from products-mfe (port 3001)  ← REMOTE
  └── loads Orders from orders-mfe (port 3003)              ← REMOTE

An app can be BOTH:
products-mfe is a REMOTE to host-app
products-mfe is also a HOST because it loads cart-mfe
```

The host is intentionally thin — it just wires things together.
All business logic lives in the remotes.

---

## Part 3 — Module Federation

---

### Q11. What is Module Federation?

**Answer:**
Module Federation is a feature (originally from Webpack 5, also available in Vite)
that lets one JavaScript application load code from another application **at runtime
in the browser** — without rebuilding either app.

**Before Module Federation — the problem:**
```
If App A wants to use a component from App B:
  Option 1: publish App B as an npm package → App A must rebuild to get updates
  Option 2: use a <script> tag → works but no module system, no sharing
```

**With Module Federation:**
```
App B exposes its component via remoteEntry.js
App A loads remoteEntry.js at runtime → gets the component fresh every time
No rebuild of App A needed when App B changes
```

---

### Q12. What is `remoteEntry.js`?

**Answer:**
`remoteEntry.js` is the **manifest file** that a remote app serves. When the host
wants to load code from a remote, it first fetches this file to find out what the
remote exposes and where to download it.

```
1. Host wants to load cart-mfe's Cart component
2. Host fetches: http://localhost:3002/remoteEntry.js
3. remoteEntry.js says: "I expose './Cart', which is in chunk abc123.js"
4. Host fetches: http://localhost:3002/abc123.js
5. Host now has the Cart component
```

You never write `remoteEntry.js` yourself — Module Federation generates it
automatically when you build (or run in dev mode).

---

### Q13. What does `exposes` mean in the Module Federation config?

**Answer:**
`exposes` is the list of things a remote makes available to hosts.

```js
// cart-mfe/vite.config.js
federation({
  name: 'cartMFE',
  filename: 'remoteEntry.js',
  exposes: {
    './Cart': './src/mount.js',  // host imports 'cartMFE/Cart'
                                 // which maps to './src/mount.js' locally
  },
})
```

```js
// In the host or any consumer:
import('cartMFE/Cart').then(({ mountCart }) => {
  mountCart(document.getElementById('cart-container'));
});
```

**Key point:** The left side (`'./Cart'`) is the public name (what consumers use).
The right side (`'./src/mount.js'`) is the actual file path inside the remote.

---

### Q14. What are shared dependencies and why does the `singleton` flag matter?

**Answer:**
Without sharing, every MFE bundles its own copy of React. Two MFEs on the same
page would load React twice — wasting bandwidth and causing bugs (React breaks
when two instances exist in the same page).

`shared` tells Module Federation: "if this package is already loaded, don't load
it again — reuse the existing one."

`singleton: true` adds an extra rule: "there can only ever be ONE copy of this
package, no matter what version."

```js
// products-listing-mfe/vite.config.js
federation({
  shared: {
    react:       { singleton: true },  // ← only one React allowed
    'react-dom': { singleton: true },
  },
})
```

```
Without singleton:               With singleton:
────────────────────             ────────────────────
host loads React 18.3           host loads React 18.3
products-mfe loads React 18.3   products-mfe REUSES React 18.3
→ Two React instances           → One React instance
→ Hooks break                   → Works correctly
```

**Always mark framework-level libraries as singleton.** This includes:
`react`, `react-dom`, `vue`, `react-redux`, `pinia`, `@reduxjs/toolkit`, etc.

---

### Q15. Why does the `type: 'module'` option matter in the host's remotes config?

**Answer:**
Modern Module Federation with Vite generates remoteEntry files using
**ES module syntax** (`import`, `export`). The browser has two modes to run
JavaScript:

- **Classic script** — no `import`/`export` allowed
- **ES module** — `import`/`export` fully supported

If you don't specify `type: 'module'`, the browser treats remoteEntry.js as a
classic script. It then encounters `import` statements → crash:

```
SyntaxError: Cannot use import statement outside a module
```

**Fix:**
```js
// host-app/vite.config.js
remotes: {
  productsList: {
    type: 'module',   // ← tells the runtime to load as ESM
    entry: 'http://localhost:3001/remoteEntry.js',
  },
}
```

---

### Q16. What is the async bootstrap pattern and why is it needed?

**Answer:**
When a page loads, JavaScript modules are parsed and their imports are resolved
**synchronously**. If `main.jsx` immediately does `import React from 'react'`,
Module Federation hasn't had time to negotiate which copy of React to use yet.
React gets loaded before sharing is set up → two copies of React again.

**The fix — add one async boundary:**

```js
// main.jsx — this file does nothing except create an async gap
import('./bootstrap.jsx');   // dynamic import pauses execution

// bootstrap.jsx — React code goes here, after Module Federation has negotiated
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

The dynamic `import('./bootstrap.jsx')` gives Module Federation time to
finish negotiating shared modules. By the time bootstrap.jsx runs, React sharing
is already set up.

**Short answer:** Without async bootstrap, shared modules don't work correctly —
every MFE loads its own copy of React.

---

### Q17. How does `React.lazy` work with Module Federation?

**Answer:**
`React.lazy` is a React feature for code-splitting — it lets you load a component
only when it's first rendered. Module Federation hooks into the same dynamic
`import()` mechanism.

```jsx
// This looks like a normal lazy import:
const Orders = React.lazy(() => import('./Orders'));

// But this fetches from a remote server at runtime:
const Orders = React.lazy(() => import('ordersMFE/Orders'));
//                                        ↑          ↑
//                               remote alias    exposed name
```

When `<Orders />` is first rendered:
1. React sees it's lazy — shows `<Suspense>` fallback
2. `import('ordersMFE/Orders')` triggers Module Federation
3. Host fetches `remoteEntry.js` from the orders-mfe server
4. Downloads the Orders chunk
5. React renders the real component — fallback disappears

```jsx
<Suspense fallback={<p>Loading...</p>}>
  {page === 'orders' && <Orders />}
</Suspense>
```

---

## Part 4 — Communication Between MFEs

---

### Q18. How do Micro-Frontends communicate with each other?

**Answer — three main approaches:**

| Method | Use when |
|--------|----------|
| **Custom Events** | One MFE needs to notify another (fire and forget) |
| **Shared Module (Module Federation)** | Multiple MFEs need to read/write the same state |
| **Backend API** | Data needs to persist across page refreshes |

---

### Q19. What are Custom Events and how are they used for MFE communication?

**Answer:**
Custom Events are browser-built events that any JavaScript can fire and listen to.
Since all MFEs run in the same browser tab, they all share `window` (= `globalThis`).
This makes `globalThis` a universal message bus.

**Firing an event (sender MFE):**
```js
// products-listing-mfe — user clicked "Add to Cart"
globalThis.dispatchEvent(
  new CustomEvent('add-to-cart', {
    detail: { product: { id: 1, name: 'Laptop', price: 999 } }
  })
);
```

**Listening for an event (receiver MFE):**
```js
// cart-mfe — hears the event and adds the product
globalThis.addEventListener('add-to-cart', (event) => {
  const product = event.detail.product;
  cartStore.addItem(product);
});
```

**Key benefit:** The two MFEs don't import from each other. They're completely
decoupled — products-mfe doesn't know cart-mfe exists.

---

### Q20. Why is event listener cleanup critical in MFEs?

**Answer:**
Every time a component mounts, it adds a listener. If you don't remove the listener
when the component unmounts, listeners stack up. After navigating to Orders 5 times:
→ 5 listeners → `addOrder` fires 5 times per event → 5 duplicate orders.

**React — cleanup in useEffect:**
```js
useEffect(() => {
  function onOrderPlaced(e) {
    dispatch(addOrder(e.detail.order));
  }

  globalThis.addEventListener('order-placed', onOrderPlaced);

  // The return function runs when the component unmounts
  return () => globalThis.removeEventListener('order-placed', onOrderPlaced);
}, [dispatch]);
```

**Vue — onUnmounted:**
```js
onMounted(() => {
  globalThis.addEventListener('add-to-cart', onAddToCart);
});

onUnmounted(() => {
  globalThis.removeEventListener('add-to-cart', onAddToCart);
});
```

**Gotcha:** `removeEventListener` only works if you pass the **exact same function
reference**. That's why the handler is defined outside `onMounted`.

---

### Q21. What is `globalThis` and why is it used instead of `window`?

**Answer:**
`globalThis` is a standard JavaScript global object that works in any environment:
- In a browser: `globalThis === window` ✅
- In Node.js: `globalThis === global` ✅
- In a Web Worker: `globalThis === self` ✅

Using `globalThis` instead of `window` makes code portable — it works whether
your MFE runs in a browser, gets server-side rendered in Node, or runs in tests.

```js
// Fragile — breaks in Node.js or Web Workers
window.addEventListener('add-to-cart', handler);

// Better — works everywhere
globalThis.addEventListener('add-to-cart', handler);
```

---

### Q22. Can Micro-Frontends share Redux state?

**Answer:**
Yes, but it's usually the wrong approach. Here's why:

**Option 1: Separate Redux store per MFE (recommended)**
```
products-mfe has its own store  (products, ui state)
orders-mfe has its own store    (orders list)
```
Each store is isolated. Changes in one can't accidentally break the other.
Cross-MFE communication happens via Custom Events or the API.

**Option 2: Shared Redux store (not recommended)**
You could expose a shared Redux store via Module Federation. But then:
- All MFEs become tightly coupled to that store's shape
- The products team can't change their state structure without coordinating
  with the orders team
- Defeats the purpose of independent teams

**Rule:** Let each MFE own its own state. Share only what truly needs to be
shared (like auth state) via a dedicated shared module.

---

## Part 5 — Patterns & Pitfalls

---

### Q23. What is the Mount Function pattern?

**Answer:**
When embedding a framework-X component inside a framework-Y app, you can't use
framework-X's component syntax directly (React can't render Vue components).

The solution: expose a plain JavaScript **function** that mounts the component
into a given DOM element. Any framework can call a function.

```js
// cart-mfe/src/mount.js — exposes a function, not a Vue component
export function mountCart(container) {
  const app = createApp(Cart);
  app.use(createPinia());
  app.mount(container);           // Vue takes over the div
  return () => app.unmount();     // returns cleanup for the caller
}
```

```jsx
// products-listing-mfe — React calls the function
useEffect(() => {
  import('cartMFE/Cart').then(({ mountCart }) => {
    const unmount = mountCart(divRef.current);   // Vue renders inside this div
    return unmount;    // React calls this when CartSidebar unmounts
  });
}, []);
```

**Why this is powerful:** The caller (React) doesn't need to know anything about
Vue. It just calls a function and passes a DOM node.

---

### Q24. What is the Always-Mounted pattern?

**Answer:**
Some MFEs register event listeners on mount (`onMounted`, `useEffect`). If you
conditionally render these MFEs — showing them only when needed — the listeners
get destroyed when they unmount. Events fired while the MFE is "hidden" are lost.

**The pattern:** Keep the component in the DOM at all times.
Hide it visually with CSS instead of removing it from the DOM.

```jsx
// WRONG — Vue app unmounts when sidebar closes, loses the event listener
{sidebarOpen && <CartSidebar />}

// CORRECT — Vue app is always mounted, only visibility changes
<div style={{ display: sidebarOpen ? 'block' : 'none' }}>
  <CartSidebar />
</div>
```

Or with a CSS class:
```jsx
<div className={`cart-sidebar ${sidebarOpen ? 'cart-sidebar--open' : ''}`}>
  <CartSidebar />   {/* always in DOM */}
</div>
```

```css
.cart-sidebar       { display: none; }
.cart-sidebar--open { display: flex; }
```

---

### Q25. What is React StrictMode and why does it cause double-mount bugs in MFEs?

**Answer:**
React StrictMode (used in development) intentionally mounts every component
**twice** to help catch bugs caused by non-idempotent side effects.

**Why this is a problem with async useEffect:**

```jsx
useEffect(() => {
  import('cartMFE/Cart').then(({ mountCart }) => {
    unmount = mountCart(container);   // ← this runs TWICE in StrictMode
  });
  return () => unmount?.();
}, []);
```

StrictMode's lifecycle:
1. Mount → `import()` starts (async, not done yet)
2. Unmount → cleanup runs: `unmount?.()` → no-op (import hasn't resolved)
3. Mount again → second `import()` starts
4. First import resolves → `mountCart()` → Vue app #1
5. Second import resolves → `mountCart()` → Vue app #2

Result: two Vue apps, two listeners, every cart add fires twice.

**Fix — a `cancelled` flag:**
```jsx
useEffect(() => {
  let cancelled = false;
  let unmount;

  import('cartMFE/Cart').then(({ mountCart }) => {
    if (!cancelled) {                // ← skip if cleanup already ran
      unmount = mountCart(container);
    }
  });

  return () => {
    cancelled = true;
    unmount?.();
  };
}, []);
```

---

### Q26. Why do MFEs each need their own Provider (Redux/Pinia)?

**Answer:**
Each MFE is an independent app with its own isolated state. If two React MFEs
shared a Redux store, they'd be tightly coupled — changing one store's shape
would require updating all consumers.

**React — each MFE wraps itself in its own Provider:**
```jsx
// products-listing-mfe
function ProductsListing() {
  return (
    <Provider store={productsStore}>    {/* only this MFE's store */}
      <ProductsListingContent />
    </Provider>
  );
}

// orders-mfe — completely separate store
function Orders() {
  return (
    <Provider store={ordersStore}>      {/* different store, different data */}
      <OrdersContent />
    </Provider>
  );
}
```

`useSelector` and `useDispatch` pick up the nearest `Provider` in the tree.
The two stores are completely isolated from each other.

---

## Part 6 — Architecture & Design

---

### Q27. How do you handle authentication across MFEs?

**Answer — three approaches, from simplest to most robust:**

**Approach 1 (simplest): Host owns auth, MFEs are gated**
```
host-app checks: is user logged in?
  No  → renders <LoginPage />
  Yes → renders MFEs (they assume user is authenticated)
```
The host stores auth state in localStorage. MFEs never see unauthenticated users.
No changes needed in any MFE.

**Approach 2: Token passed via shared Module Federation module**
```js
// host-app exposes an auth module
federation({ exposes: { './auth': './src/authStore.js' } })

// any MFE
import { getToken } from 'host/auth';
fetch('/api/data', { headers: { Authorization: `Bearer ${getToken()}` } });
```

**Approach 3: Token in localStorage (read by all MFEs)**
```js
// Each MFE reads the token directly
const token = localStorage.getItem('auth_token');
fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
```

All MFEs run in the same origin when served via the host, so they share
the same localStorage.

---

### Q28. How do you handle theming / CSS across MFEs?

**Answer:**
CSS is global by default. The cleanest solution for MFEs is **CSS Custom Properties
(variables)** defined at the root level.

```css
/* host-app/src/App.css */
:root {
  --bg: #ffffff;
  --text: #1e293b;
  --primary: #6366f1;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --text: #f1f5f9;
  --primary: #818cf8;
}
```

The host sets `data-theme` on `<html>`:
```js
document.documentElement.setAttribute('data-theme', 'dark');
```

Since all MFEs are children of `<html>` in the same DOM, they all inherit the
variables. Each MFE's CSS uses `var(--bg)`, `var(--text)`, etc. — they all
respond to the theme toggle automatically.

```css
/* cart-mfe Cart.vue <style scoped> */
.cart-item {
  border-bottom: 1px solid var(--border, #e2e8f0);  /* fallback for standalone */
  color: var(--text, #1e293b);
}
```

---

### Q29. How do you handle a remote MFE being unavailable?

**Answer:**
If a remote MFE's server is down, `import('remoteMFE/Component')` will throw.
You need to handle this gracefully.

**React Error Boundary:**
```jsx
class MFEErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div>This section is temporarily unavailable.</div>;
    }
    return this.props.children;
  }
}

// Wrapping the lazy MFE:
<MFEErrorBoundary>
  <Suspense fallback={<p>Loading...</p>}>
    <RemoteMFE />
  </Suspense>
</MFEErrorBoundary>
```

**Key insight:** This is a core advantage of MFEs. If the orders MFE is down,
the rest of the app (products, cart) still works. You just show a fallback in the
orders section instead of crashing the whole app.

---

### Q30. What is the difference between build-time and run-time integration?

**Answer:**

**Build-time integration:**
```
MFE A is published to npm.
MFE B installs it as a dependency.
When B is built, A's code is bundled into B.
```
- Pros: Simple, no runtime complexity
- Cons: You must rebuild and redeploy B every time A changes. Not truly independent.

**Run-time integration (Module Federation):**
```
MFE A serves its own bundle on a server.
MFE B fetches A's bundle at runtime in the browser.
A and B are built completely separately.
```
- Pros: Truly independent — A can be updated without rebuilding B
- Cons: A must be running when B tries to load it

**Which is used in this project?** Run-time via Module Federation.

---

## Part 7 — Advanced & Scenario Questions

---

### Q31. How do you version Micro-Frontends?

**Answer:**
Since each MFE is independently deployable, versioning needs to be explicit.

**Two main strategies:**

**1. Always-latest (most common for internal apps):**
The host always loads the latest version of the remote. When the products team
deploys, all users instantly get the new version.
```js
entry: 'https://products.mycompany.com/remoteEntry.js'
// Always fetches the latest build
```

**2. Versioned URLs (for external/contractual APIs):**
```js
entry: 'https://products.mycompany.com/v2/remoteEntry.js'
// Host explicitly targets a version
```
This is safer but requires coordination when the host needs to upgrade.

**What to avoid:** Never use a `Content-Security-Policy` or CDN cache that
aggressively caches `remoteEntry.js` — you'd never get updates. Always let
`remoteEntry.js` be fresh.

---

### Q32. A user reports that adding a product to the cart sometimes adds it 2 or 3 times. What is likely the cause?

**Answer:**
This is the classic **event listener leak** caused by:

1. Not cleaning up `add-to-cart` listeners on component unmount, OR
2. React StrictMode double-mounting `CartSidebar`, creating two Vue apps
   each with their own listener

**Debug steps:**
1. Check that `onUnmounted` in Cart.vue removes the listener
2. Check that `useEffect` in CartSidebar has a cleanup function
3. Check that a `cancelled` flag prevents StrictMode double-mount

```js
// Check: is there an onUnmounted?
onUnmounted(() => {
  globalThis.removeEventListener('add-to-cart', onAddToCart);  // ← must exist
});

// Check: is there a cancelled flag?
useEffect(() => {
  let cancelled = false;
  import('cartMFE/Cart').then(({ mountCart }) => {
    if (!cancelled) unmount = mountCart(container);   // ← must have this check
  });
  return () => { cancelled = true; unmount?.(); };
}, []);
```

---

### Q33. If two MFEs depend on different versions of React, what happens?

**Answer:**
Module Federation with `singleton: true` enforces **one version per page**.

- If both MFEs declare `react: { singleton: true, requiredVersion: '^18.0.0' }`,
  Module Federation will use whichever version loads first.
- If the versions are incompatible (e.g., one needs 17.x, another 18.x),
  you get a console warning: "Unsatisfied version 17.x.x of shared singleton
  module react". The app may break.

**Solutions:**
1. Align all MFEs to the same React version (best approach)
2. Use `eager: false` and manage version negotiation carefully
3. Use `strictVersion: true` to force a crash instead of a silent mismatch

**Lesson:** Shared singleton dependencies need a version contract between teams.
Use a shared configuration file or a monorepo to keep them in sync.

---

### Q34. Can you use Micro-Frontends without Module Federation?

**Answer:**
Yes. Module Federation is one way to do run-time composition. Others include:

**1. iframes** — each MFE loads in its own iframe:
```html
<iframe src="https://products.mycompany.com" />
```
- Pros: Complete isolation (no shared globals, no CSS conflicts)
- Cons: Hard to share state, poor UX (separate scroll contexts), complex resize

**2. Web Components** — each MFE exposes a custom HTML element:
```html
<products-listing-mfe></products-listing-mfe>
```
- Pros: Framework-agnostic, works anywhere HTML works
- Cons: Complex lifecycle, React/Vue don't always play well with Web Components

**3. Script tags with a global object:**
```html
<script src="https://products.mycompany.com/bundle.js"></script>
```
Then `window.ProductsMFE.mount(container)` — the old way before Module Federation.

**Module Federation is preferred** for modern apps because it handles shared
dependencies automatically and integrates cleanly with bundler tooling.

---

### Q35. How would you test a Micro-Frontend in isolation?

**Answer — three levels of testing:**

**1. Unit tests** — test functions and components without the host:
```js
// Test a Pinia action directly
import { useCartStore } from './cartStore.js';
it('addItem increases quantity', async () => {
  const store = useCartStore();
  await store.addItem({ id: 1, name: 'Laptop', price: 999 });
  expect(store.items[0].quantity).toBe(1);
});
```

**2. Standalone mode** — each MFE runs on its own port (3001, 3002, 3003).
Open `http://localhost:3002` to test cart-mfe in isolation.
Mock the `add-to-cart` event in the browser console:
```js
globalThis.dispatchEvent(new CustomEvent('add-to-cart', {
  detail: { product: { id: 1, name: 'Laptop', price: 999 } }
}));
```

**3. Integration test** — run the host + all remotes and test end-to-end
with a tool like Playwright or Cypress:
```js
test('can add product to cart', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Add to Cart');
  await expect(page.locator('.cart-badge')).toHaveText('1');
});
```

---

## Quick-Reference Cheat Sheet

```
SPA                  Single HTML page, JavaScript handles navigation
MPA                  New HTML page from server on every navigation
Lazy loading         Download code only when it's first needed
Suspense             Shows fallback while lazy component loads

MFE                  Independently deployable frontend slice
Host                 Shell app that loads remotes
Remote               App that exposes code to be loaded by hosts
remoteEntry.js       Manifest served by each remote; host fetches this

Module Federation    Vite/Webpack feature for runtime code sharing
exposes              What a remote makes available
shared + singleton   Prevents React/Vue from loading twice
Async bootstrap      main.jsx → import('./bootstrap.jsx') to set up sharing

Custom Event         Browser event used as MFE message bus
globalThis           Universal global object (= window in browser)
Listener cleanup     removeEventListener on unmount — ALWAYS required

Mount function       Framework-agnostic function that mounts a Vue/React app
Always-mounted       display:none instead of conditional render — keeps listeners alive
Cancelled flag       Prevents double Vue app in React StrictMode
Independent stores   Each MFE has its own Redux/Pinia store
```

---

> The best way to internalize these answers is to open the shop project alongside
> this file and trace each concept through the actual code.
