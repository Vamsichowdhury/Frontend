# 04 — Patterns & Pitfalls

This file covers four important patterns and pitfalls that appear in almost every
real MFE project. Each one has tripped up experienced developers, so it's worth
understanding them early.

---

## Pattern 1: The Mount Function (embedding Vue inside React)

### The problem

`products-listing-mfe` is React. It needs to render `cart-mfe`, which is Vue.
React cannot render a Vue component — `<CartComponent />` in JSX only works for
React components.

### The solution

Instead of exposing a Vue component, `cart-mfe` exposes a plain JavaScript
**function** that mounts the Vue app into any DOM element.

```
cart-mfe exposes:
  mountCart(container)   ← a function, not a component
```

Any JavaScript — React, Vue, Angular, or vanilla JS — can call a function.

### How it's implemented

```js
// cart-mfe/src/mount.js  (what Module Federation exposes)

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Cart from './Cart.vue';

export function mountCart(container) {
  const pinia = createPinia();   // fresh Pinia instance
  const app = createApp(Cart);
  app.use(pinia);
  app.mount(container);          // Vue takes over the provided div
  return () => app.unmount();    // returns a cleanup function
}
```

```jsx
// products-listing-mfe/src/ProductsListing.jsx  (the React caller)

function CartSidebar() {
  const containerRef = useRef(null);

  useEffect(() => {
    let unmount;

    import('cartMFE/Cart').then(({ mountCart }) => {
      unmount = mountCart(containerRef.current);  // Vue takes over this div
    });

    return () => unmount?.();  // React calls this on unmount → Vue tears down
  }, []);

  return <div ref={containerRef} />;  // empty div that Vue will fill
}
```

### Why this works

```
React renders:  <div ref={containerRef} />   ← empty div
                        │
                        ▼
mountCart(div) is called
                        │
                        ▼
Vue mounts Cart.vue inside that div
                        │
                        ▼
React's DOM:  <div>
                <div class="cart">  ← Vue owns this part
                  ...
                </div>
              </div>
```

React ignores everything inside the div it handed to Vue. Vue owns that slice
of the DOM. When React unmounts CartSidebar, it calls the returned cleanup
function, which calls `app.unmount()` — Vue cleans up properly.

---

## Pattern 2: Always-mounted sidebar (keeping a Vue app alive)

### The problem

`Cart.vue` registers an `add-to-cart` event listener in `onMounted`. If React
conditionally renders `<CartSidebar />` (only when the sidebar is open), then:

- Sidebar opens → Vue mounts → listener added ✅
- Sidebar closes → Vue unmounts → listener removed ❌
- User clicks "Add to Cart" while sidebar is closed → event fires → nobody hears it
- Cart item is silently lost

### The solution

Never unmount the Vue app. Keep it in the DOM at all times.
Use CSS `display: none` to hide the sidebar visually instead of removing it.

```jsx
// products-listing-mfe/src/ProductsListing.jsx

// CartSidebar is ALWAYS in the DOM — never conditionally rendered
<div className={`cart-sidebar${sidebarOpen ? ' cart-sidebar--open' : ''}`}>
  <CartSidebar />
</div>
```

```css
/* ProductsListing.css */
.cart-sidebar        { display: none; }   /* hidden but still mounted */
.cart-sidebar--open  { display: flex; }   /* visible */
```

```
Sidebar closed:  Vue app alive, listener active, user can add to cart ✅
Sidebar open:    Vue app alive, listener active, cart updates show    ✅
Sidebar closed:  Vue app alive, listener active, items not lost       ✅
```

---

## Pitfall 1: React StrictMode double-mount

### What is StrictMode?

React wraps apps in `<React.StrictMode>` in development. StrictMode intentionally
mounts every component **twice** to help you find bugs caused by side effects that
run more than once.

```jsx
// host-app/src/bootstrap.jsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

### The bug it causes

`CartSidebar` uses `useEffect` with an async `import()`:

```jsx
useEffect(() => {
  import('cartMFE/Cart').then(({ mountCart }) => {
    unmount = mountCart(containerRef.current);  // mounts Vue app
  });
  return () => unmount?.();
}, []);
```

In StrictMode:
1. React mounts CartSidebar — `import()` starts (async, not done yet)
2. React unmounts CartSidebar — cleanup runs: `unmount?.()` but `unmount` is
   still `undefined` because `import()` hasn't resolved yet. No-op.
3. React mounts CartSidebar again — another `import()` starts
4. First `import()` resolves → calls `mountCart()` → Vue app #1 created
5. Second `import()` resolves → calls `mountCart()` → Vue app #2 created

Now there are **two Vue apps**, each with their own `add-to-cart` listener.
One click fires two API calls → item added twice.

### The fix — a `cancelled` flag

```jsx
useEffect(() => {
  let unmount;
  let cancelled = false;  // ← the fix

  import('cartMFE/Cart').then(({ mountCart }) => {
    if (!cancelled && containerRef.current) {   // ← check before mounting
      unmount = mountCart(containerRef.current);
    }
  });

  return () => {
    cancelled = true;   // ← first cleanup sets this, stopping the first callback
    unmount?.();
  };
}, []);
```

Now:
1. React mounts → `import()` starts, `cancelled = false`
2. React unmounts → `cancelled = true`, `unmount?.()` no-op
3. React mounts again → new `import()` starts, new `cancelled = false`
4. First `import()` resolves → checks `cancelled` → it's `true` → skips mount ✅
5. Second `import()` resolves → checks `cancelled` → it's `false` → mounts ✅

Only one Vue app is created.

---

## Pitfall 2: Independent stores per MFE

### The mistake

Beginners sometimes assume that because multiple React MFEs are on the same page,
they share one Redux store. They do not.

```
host-app            → no Redux store
products-listing-mfe → has its OWN Redux store (products + UI state)
orders-mfe           → has its OWN Redux store (orders list)
```

Each MFE wraps its component in its own `<Provider store={store}>`:

```jsx
// products-listing-mfe/src/ProductsListing.jsx
function ProductsListing() {
  return (
    <Provider store={store}>      {/* this MFE's own store */}
      <ProductsListingContent />
    </Provider>
  );
}

// orders-mfe/src/Orders.jsx
function Orders() {
  return (
    <Provider store={store}>      {/* a completely different store */}
      <OrdersContent />
    </Provider>
  );
}
```

`useSelector` and `useDispatch` inside each component automatically use the store
of their nearest `<Provider>` ancestor. The two stores never interfere.

### Why is this the right design?

Each MFE owns its own state. If the products-listing-mfe store were global, the
orders team would have to ask the products team to add reducers every time they
needed new state — defeating the purpose of independent teams.

### When you DO need to share state across MFEs

Use a Custom Event or a shared Module Federation module (see file 03).
In this project, for example, a new order being placed is shared via the
`order-placed` Custom Event — not by accessing another MFE's Redux store.

---

## Summary of patterns

| Pattern | Rule |
|---------|------|
| Mount function | Expose a function, not a framework component, when embedding across frameworks |
| Always-mounted | Use `display: none` instead of conditional rendering to keep event listeners alive |
| Cancelled flag | Guard async `useEffect` imports with a `cancelled` flag to prevent StrictMode double-mount |
| Independent stores | Each MFE has its own store; share state via events or shared modules, not by reaching into another MFE's store |

Next: [05-our-project.md](./05-our-project.md)
