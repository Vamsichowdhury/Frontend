# Routing in Micro-Frontends

Before this chapter, navigation in our shop was fake — `useState('page')` swapped components,
but the URL never changed. No back button, no shareable links, no refresh-friendly state.

This chapter adds **real routing** with `react-router-dom`, and uses the new **wishlist-mfe**
to demonstrate the most important pattern in MFE routing: **the host owns top-level routes,
and each MFE owns its own internal sub-routes.**

---

## The single most important rule

> **Only ONE `<BrowserRouter>` can exist in the entire app.**

`<BrowserRouter>` listens to the browser's URL bar and provides a React context. If you put
two of them in the page, the inner one wins for its subtree — and your outer URL state stops
working. It silently breaks.

So in an MFE setup:
- The **host** owns the BrowserRouter
- Every MFE uses only `<Routes>` / `<Route>` / hooks (`useParams`, `useNavigate`, `<Link>`, `<NavLink>`)
- They all share the SAME router instance via Module Federation singletons

---

## Step 1 — Share `react-router-dom` as a singleton

In both `host-app/vite.config.js` and `wishlist-mfe/vite.config.js`:

```js
shared: {
  react:            { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom':      { singleton: true, requiredVersion: '^18.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
}
```

**Why singleton?**
React Router stores its current URL/match state in a React context. If host and MFE each
bundle their own copy of react-router-dom, they create separate contexts. The MFE's
`<Routes>` would look for a router context, not find one, and either crash or just
render nothing.

Singleton = "only ONE copy of react-router-dom in the running app." Whoever loads first
brings their copy; everyone else uses it.

---

## Step 2 — Host wraps the app in `<BrowserRouter>` and defines top-level routes

From `host-app/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';

const Wishlist = lazy(() => import('wishlistMFE/Wishlist'));

return (
  <BrowserRouter>
    <nav>
      <NavLink to="/products">Products</NavLink>
      <NavLink to="/orders">Orders</NavLink>
      <NavLink to="/wishlist">Wishlist</NavLink>
    </nav>

    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<ProductsListing />} />
      <Route path="/orders"   element={<Orders />} />
      <Route path="/wishlist/*" element={<Wishlist />} />
    </Routes>
  </BrowserRouter>
);
```

Two things to notice:

### `<NavLink>` vs `<Link>`
Both navigate without a page reload. `NavLink` also adds an `active` class when its `to`
matches the current URL — perfect for navbar styling.

### The `/*` splat — **the key MFE routing pattern**
`<Route path="/wishlist/*" element={<Wishlist />} />` means:
> "Match `/wishlist`, `/wishlist/anything`, `/wishlist/anything/else/too`. Send all of them
> to the Wishlist MFE. I (the host) don't care about anything past `/wishlist/`."

Without the `/*`, the route would ONLY match `/wishlist` exactly — sub-paths like
`/wishlist/3` would 404. The splat hands the sub-tree to the MFE.

---

## Step 3 — Wishlist MFE owns its own sub-routes

From `wishlist-mfe/src/Wishlist.jsx` (the federated export):

```jsx
import { Routes, Route } from 'react-router-dom';
import WishlistList from './WishlistList.jsx';
import WishlistDetail from './WishlistDetail.jsx';

// NO <BrowserRouter> here — the host already owns it.
export default function Wishlist() {
  return (
    <Routes>
      <Route index element={<WishlistList />} />
      <Route path=":productId" element={<WishlistDetail />} />
    </Routes>
  );
}
```

| URL the user visits | Host matches | MFE then matches |
|---|---|---|
| `/wishlist`        | `/wishlist/*` → renders `<Wishlist />` | `index` → `<WishlistList />` |
| `/wishlist/3`      | `/wishlist/*` → renders `<Wishlist />` | `:productId` → `<WishlistDetail />` (productId = "3") |

The host has **no idea** that `/wishlist/3` even exists. The wishlist team could add
`/wishlist/3/edit` tomorrow without changing a single line in the host.

That's the magic — and the reason MFEs are powerful: independent teams ship independent screens.

---

## Step 4 — Standalone mode still needs a router

When you run `cd wishlist-mfe && npm run dev` and visit `http://localhost:3004`, there is
no host. Wishlist.jsx still has `<Routes>` — but without a `<BrowserRouter>` ancestor it
would crash.

Solution: the standalone bootstrap provides one. From `wishlist-mfe/src/bootstrap.jsx`:

```jsx
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

In federated mode `bootstrap.jsx` is **never executed** — the host imports
`./Wishlist` directly and bypasses it. So the standalone `<BrowserRouter>` only runs
when developing the MFE alone. No conflict, no double-router.

This is the **dual-mode pattern**: each MFE works in two environments, and the same
component code runs in both.

---

## Step 5 — Hooks work identically inside an MFE

From `wishlist-mfe/src/WishlistDetail.jsx`:

```jsx
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function WishlistDetail() {
  const { productId } = useParams();   // reads :productId from URL
  const navigate = useNavigate();      // programmatic navigation

  function handleRemove() {
    fetch(`/wishlist/${productId}`, { method: 'DELETE' })
      .then(() => navigate('/wishlist'));
  }

  return <Link to="/wishlist">Back</Link>;
}
```

These hooks use the same context the host provides. Because of the singleton, there's
literally one instance of react-router-dom in the page — the MFE's `useParams` reads
from the same store the host's URL writes to.

---

## Common pitfalls

| Mistake | What goes wrong | Fix |
|---|---|---|
| Putting `<BrowserRouter>` in BOTH host and MFE | Inner router takes over its subtree, breaks NavLink active state, breaks navigation between MFE and host pages | Only host wraps in BrowserRouter; MFE bootstrap wraps only for standalone |
| Forgetting `singleton: true` on `react-router-dom` | MFE renders nothing or crashes — its `useParams` finds no router context | Add singleton in BOTH vite.config.js files |
| `<Route path="/wishlist">` without `/*` | Sub-routes like `/wishlist/3` don't match anywhere — 404 | Use the splat: `path="/wishlist/*"` |
| MFE uses `<a href="/wishlist/3">` | Browser does a full page reload, the URL works but the whole app re-downloads | Use `<Link>` / `<NavLink>` from react-router-dom |
| MFE re-exports `<BrowserRouter>` accidentally | Same as #1 — nested routers | Only export the component containing `<Routes>` |

---

## Summary

| Concept | Where to look |
|---|---|
| Host wraps in BrowserRouter | `host-app/src/App.jsx` |
| Splat route (`/wishlist/*`) | `host-app/src/App.jsx` `<Routes>` block |
| MFE owns its sub-routes | `wishlist-mfe/src/Wishlist.jsx` |
| Standalone-only router | `wishlist-mfe/src/bootstrap.jsx` |
| `useParams`/`useNavigate` in MFE | `wishlist-mfe/src/WishlistDetail.jsx` |
| Singleton `react-router-dom` | `host-app/vite.config.js`, `wishlist-mfe/vite.config.js` (`shared:` blocks) |

The pattern in one sentence:
**One BrowserRouter (the host's), many `<Routes>` blocks (one per MFE), all sharing one
react-router-dom singleton.**
