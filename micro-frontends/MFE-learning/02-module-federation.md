# 02 — Module Federation

## What problem does Module Federation solve?

Before Module Federation existed, if you wanted one JavaScript app to load code
from another, you had two options:

1. Copy the code into your bundle at build time (not independent)
2. Use a `<script>` tag pointing to the other app's URL (works, but no shared
   dependencies — React would load twice)

**Module Federation lets two separate apps share JavaScript modules at runtime,
in the browser, including the ability to share React so it only loads once.**

It was originally a Webpack feature (Webpack 5, 2020). This project uses the
Vite equivalent: `@module-federation/vite`.

---

## Core concepts

### Host
The app that **loads** code from other apps. It decides what to load and when.

```
host-app = the shell
  - Has a navbar
  - Decides to show Products or Orders
  - Loads ProductsListing from products-listing-mfe at runtime
  - Loads Orders from orders-mfe at runtime
```

### Remote
An app that **exposes** some of its code for others to load.

```
products-listing-mfe = a remote
  - Runs as its own dev server on port 3001
  - Exposes its ProductsListing component via Module Federation
  - When the host loads it, the component appears in the host's page
```

### remoteEntry.js
When a remote app is built (or running in dev mode), it produces a special file
called `remoteEntry.js`. This is the "entry point" the host fetches to discover
what the remote exposes.

```
http://localhost:3001/remoteEntry.js  ← host fetches this
http://localhost:3002/remoteEntry.js  ← host fetches this (via products-listing-mfe)
http://localhost:3003/remoteEntry.js  ← host fetches this
```

---

## The config: host side

In `host-app/vite.config.js`:

```js
federation({
  name: 'host',
  remotes: {
    // "productsList" is the local alias — used in import('productsList/...')
    productsList: {
      type: 'module',   // remoteEntry.js is an ES module
      name: 'productsList',
      entry: 'http://localhost:3001/remoteEntry.js',
    },
    ordersMFE: {
      type: 'module',
      name: 'ordersMFE',
      entry: 'http://localhost:3003/remoteEntry.js',
    },
  },
})
```

**Why `type: 'module'`?**
Without it, the browser tries to load remoteEntry.js as a classic script.
But Module Federation generates ES module syntax (`import`/`export`).
Classic scripts don't allow `import`, so you get:
```
SyntaxError: Cannot use import statement outside a module
```

---

## The config: remote side

In `products-listing-mfe/vite.config.js`:

```js
federation({
  name: 'productsList',
  filename: 'remoteEntry.js',   // the file hosts will fetch
  exposes: {
    // './ProductsListing' is what the host imports
    // './src/ProductsListing.jsx' is the actual file
    './ProductsListing': './src/ProductsListing.jsx',
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

## Shared dependencies — the `singleton` flag

This is one of the most important concepts in Module Federation.

**The problem without singletons:**

Both `host-app` and `products-listing-mfe` depend on React.
Without sharing, both bundles include React. The browser loads React twice.
Now there are two separate copies of React in memory — two roots, two event systems.
React breaks badly in this situation.

**The solution — `singleton: true`:**

```js
shared: {
  react: { singleton: true },
}
```

This tells Module Federation: "if React is already loaded, reuse it — don't load
a second copy." Both apps now share the exact same React instance.

```
Without singleton:                With singleton:
──────────────────                ───────────────
host-app  → loads React v18       host-app  → loads React v18
products-mfe → loads React v18    products-mfe → reuses React v18 from host
                                  (saves ~130KB, no duplicate roots)
```

**Rule: always mark framework libraries as `singleton: true`.**
This includes: `react`, `react-dom`, `vue`, `react-redux`, `pinia`, etc.

---

## Loading a remote component in the host

In `host-app/src/App.jsx`:

```jsx
import React, { lazy, Suspense } from 'react';

// This looks like a normal import, but it is NOT.
// At runtime, the browser fetches remoteEntry.js from localhost:3001,
// then dynamically loads the ProductsListing chunk.
const ProductsListing = lazy(() => import('productsList/ProductsListing'));
const Orders          = lazy(() => import('ordersMFE/Orders'));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ProductsListing />
    </Suspense>
  );
}
```

**`lazy()` + `import()`** — this is standard React code for dynamic imports.
Module Federation hooks into the module resolution so that
`import('productsList/ProductsListing')` fetches from `localhost:3001`,
not from the local file system.

**`Suspense`** is required because the remote chunk takes time to download
on the first visit. `Suspense` shows the fallback during that download.

---

## The async bootstrap pattern

You may notice that `host-app/src/main.jsx` looks like this:

```js
// main.jsx
import('./bootstrap.jsx');   // dynamic import of bootstrap
```

```js
// bootstrap.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

**Why not just put the React code directly in main.jsx?**

Module Federation needs to negotiate shared modules (like React) before any code
runs. If `main.jsx` immediately `import React from 'react'`, the negotiation
hasn't happened yet, so React loads twice.

The dynamic `import('./bootstrap.jsx')` pauses execution long enough for Module
Federation to finish its negotiation. Then bootstrap runs with shared modules
already in place.

---

## What happens step by step when you open the app

```
1. Browser loads host-app (localhost:3000)
2. main.jsx runs: import('./bootstrap.jsx')
   └── Module Federation negotiates shared modules
3. bootstrap.jsx runs: renders <App />
4. App renders <Suspense> with a fallback
5. lazy(() => import('productsList/ProductsListing')) triggers
6. Browser fetches http://localhost:3001/remoteEntry.js
7. remoteEntry.js tells the browser which chunks to load
8. Browser downloads the ProductsListing chunk
9. React renders ProductsListing — Suspense fallback disappears
```

---

## Summary

| Term | Meaning |
|------|---------|
| Module Federation | Vite/Webpack feature — lets apps share code at runtime |
| Host | Loads code from remotes |
| Remote | Exposes code for hosts to load |
| `remoteEntry.js` | The entry file a remote serves; host fetches this |
| `exposes` | What the remote makes available |
| `shared` + `singleton` | Prevents frameworks from loading twice |
| Async bootstrap | Pattern to ensure shared modules negotiate before code runs |

Next: [03-communication.md](./03-communication.md)
