# 03 — Communication Between MFEs

## The core problem

Each MFE is an isolated JavaScript application. They cannot simply import each
other's functions or share a variable directly:

```js
// This does NOT work across MFEs
import { cartStore } from '../cart-mfe/src/cartStore.js';  // ❌ different bundle
```

Even if both MFEs are on the same page, their JavaScript modules are separate
bundles. You need a communication channel that exists outside both of them.

---

## The three main options

| Approach | Best for | Used in this project? |
|----------|----------|-----------------------|
| Custom Events on `globalThis` | Loosely coupled, one-way signals | Yes |
| Shared module via Module Federation | Tightly coupled, two-way state | No |
| Backend API | Persisting data between page loads | Yes |

---

## Option 1: Custom Events (the main approach here)

The browser has a built-in event system. Any JavaScript can fire an event on
`globalThis` (which is `window` in a browser), and any other JavaScript on the
same page can listen for it.

Since all MFEs run in the same browser tab, they all share the same `globalThis`.
**This makes `globalThis` a universal message bus.**

### Firing an event

```js
// In products-listing-mfe — when user clicks "Add to Cart"
globalThis.dispatchEvent(
  new CustomEvent('add-to-cart', {
    detail: { product: { id: 1, name: 'Laptop', price: 999 } }
  })
);
```

### Listening for an event

```js
// In cart-mfe — listens for the product the user wants to add
globalThis.addEventListener('add-to-cart', (event) => {
  const product = event.detail.product;
  store.addItem(product);  // update Pinia store + call API
});
```

Notice: products-listing-mfe doesn't know cart-mfe exists. It just fires an event
and walks away. cart-mfe doesn't know products-listing-mfe exists either. It just
listens. **Neither MFE imports anything from the other.**

---

## Events in this project

Here is every Custom Event used in the shop:

```
Event name      Fired by               Heard by                  Payload
──────────────  ─────────────────────  ────────────────────────  ──────────────────────────
add-to-cart     products-listing-mfe   cart-mfe                  { product }
order-placed    cart-mfe               products-listing-mfe      { order, message }
                                       orders-mfe
cart-updated    cart-mfe               products-listing-mfe      { count }
```

### Visualising the flow

```
[User clicks "Add to Cart"]
        │
        ▼
products-listing-mfe
  fires 'add-to-cart' ──────────────────────────────► cart-mfe
                                                        calls store.addItem()
                                                        calls POST /cart
                                                        fires 'cart-updated' ──► products-listing-mfe
                                                                                  updates badge count

[User clicks "Place Order"]
        │
        ▼
cart-mfe
  calls POST /orders
  fires 'order-placed' ────────────────────────────► products-listing-mfe
                        │                              shows success banner
                        └───────────────────────────► orders-mfe
                                                        prepends new order to list
```

---

## Critical rule: always clean up your listeners

Every time you add a listener, you must also remove it when the component
unmounts. If you don't, each time the component mounts it adds another listener.
After 5 visits to the Orders page, `addOrder` fires 5 times per event.

### React (useEffect cleanup)

```js
// orders-mfe/src/Orders.jsx
useEffect(() => {
  function onOrderPlaced(e) {
    dispatch(addOrder(e.detail.order));
  }

  globalThis.addEventListener('order-placed', onOrderPlaced);

  // This return function is the cleanup — React calls it on unmount
  return () => globalThis.removeEventListener('order-placed', onOrderPlaced);
}, [dispatch]);
```

### Vue (onMounted / onUnmounted)

```js
// cart-mfe/src/Cart.vue
onMounted(() => {
  globalThis.addEventListener('add-to-cart', onAddToCart);
});

onUnmounted(() => {
  // Must mirror exactly what you added in onMounted
  globalThis.removeEventListener('add-to-cart', onAddToCart);
});
```

> Note: `removeEventListener` only works if you pass the **exact same function
> reference** that you passed to `addEventListener`. This is why `onAddToCart`
> is defined outside `onMounted` — so both calls use the same reference.

---

## Option 2: Shared module via Module Federation

Instead of events, you can expose a shared store from the host and have all MFEs
import it. Since Module Federation enforces singletons, every MFE gets the exact
same module instance — the same variables, the same state.

```js
// host-app/vite.config.js
federation({
  exposes: {
    './store': './src/sharedStore.js',
  },
})

// any-mfe/src/Component.jsx
import { sharedStore } from 'host/store';
sharedStore.setUser({ name: 'Alice' });  // all MFEs see this change
```

**When to use this instead of events:**
- When you need two-way communication (read AND write from multiple MFEs)
- When state is truly shared (e.g. the logged-in user)
- When you want type safety and direct function calls rather than string-based events

**When to stick with events:**
- When MFEs should be loosely coupled (neither knows the other exists)
- When the data flows in one direction (fire and forget)

---

## Option 3: Backend API as the source of truth

For data that must persist across page refreshes (cart contents, orders), the
backend API is the single source of truth. All MFEs read from and write to the
same API independently.

```
products-listing-mfe  ──GET /products──────► API
cart-mfe              ──GET /cart────────────► API  (all MFEs share
                      ──POST /cart───────────► API   the same database)
orders-mfe            ──GET /orders──────────► API
```

This is why refreshing the page doesn't wipe the cart — it's not stored in
JavaScript memory, it's stored in the API.

---

## Combining all three

In this project, all three approaches work together:

```
User adds product to cart:
  1. Custom Event 'add-to-cart' → cart-mfe receives it
  2. cart-mfe calls POST /cart (API) → persists to server
  3. cart-mfe fires 'cart-updated' → products-listing-mfe updates badge

User refreshes:
  1. cart-mfe mounts → calls GET /cart (API) → restores cart
  2. orders-mfe mounts → calls GET /orders (API) → restores orders
  No Custom Events needed on refresh — API is the source of truth
```

---

## Summary

| Mechanism | Direction | Persistence | When to use |
|-----------|-----------|-------------|-------------|
| Custom Event | One-way (fire and forget) | None (in-memory) | Notifying other MFEs of an action |
| Shared Module Federation module | Two-way | None (in-memory) | Shared state between tightly coupled MFEs |
| Backend API | Any | Yes (survives refresh) | Cart, orders, products — anything that needs to persist |

Next: [04-patterns.md](./04-patterns.md)
