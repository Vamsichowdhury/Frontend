# cart-mfe

Vue 3 + Pinia Microfrontend. Runs on **http://localhost:3002**.
Loaded by `products-listing-mfe` (React) via a mount function.

---

## What it does

- Fetches and displays the current cart from the API on mount
- Listens for `add-to-cart` events from products-listing-mfe
- Each "Add to Cart" click makes a POST /cart API call (quantity increments if same product)
- Shows each item with quantity badge (×2) when more than one
- "Remove" button calls DELETE /cart/:productId
- "Place Order" POSTs to /orders, clears the cart, and fires a Custom Event

---

## Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3002 standalone. The `add-to-cart` event only works when
embedded inside products-listing-mfe (both must share the same browser tab).

---

## Module Federation config

```js
federation({
  name: 'cartMFE',
  filename: 'remoteEntry.js',
  exposes: {
    './Cart': './src/mount.js',   // exposes a JS function, not a Vue component
  },
  shared: { vue: { singleton: true } },
})
```

**Why expose `mount.js` instead of `Cart.vue` directly?**

products-listing-mfe is React. React cannot render a Vue component.
But any JavaScript can call a plain function. `mount.js` exports
`mountCart(container)` — a framework-agnostic JS function any caller can use.

---

## The mount function pattern

```
mount.js (what Module Federation exposes)
──────────────────────────────────────────────────────────────────────

export function mountCart(container) {
  const pinia = createPinia()    // fresh Pinia instance per mount
  const app = createApp(Cart)
  app.use(pinia)
  app.mount(container)           // Vue takes over the provided div
  return () => app.unmount()     // returns cleanup for the caller (React)
}
```

React calls `mountCart(divRef.current)` once. Vue owns that div.
When React unmounts CartSidebar, it calls the returned cleanup function,
tearing down the Vue app cleanly.

---

## Pinia store — cartStore.js

```
state
  ├── items: []        ← [{ productId, name, price, quantity }] from API
  ├── placing: false   ← true while POST /orders is in flight
  └── loading: false   ← true while GET /cart is in flight

getters
  └── total            ← sum of price × quantity for all items

actions
  ├── fetchCart()      ← GET /cart — called on mount
  ├── addItem(product) ← POST /cart — called when 'add-to-cart' event fires
  ├── removeItem(id)   ← DELETE /cart/:productId
  ├── placeOrder()     ← POST /orders + DELETE /cart + fire 'order-placed'
  └── broadcastCount() ← fire 'cart-updated' event with current item count
```

**Why API-backed and not local state only?**
Cart data persists across page refreshes because the cart lives in the API.
When the Vue app mounts, it calls `fetchCart()` and restores the saved cart.

---

## Cart persistence flow

```
User adds product                  User refreshes browser
──────────────────────────         ──────────────────────────────
'add-to-cart' event fires          Cart.vue mounts
  │                                  │
  ▼                                  ▼
store.addItem(product)             store.fetchCart()
  │                                  │
  ▼                                  ▼
POST /cart                         GET /cart
  │                                  │
  ▼                                  ▼
API: increments qty or adds item   API: returns saved items
  │                                  │
  ▼                                  ▼
this.items = response.items        this.items = response.items
broadcastCount()                   broadcastCount()
```

---

## 'add-to-cart' event listener

Cart.vue registers the listener in `onMounted` and removes it in `onUnmounted`:

```js
onMounted(async () => {
  await store.fetchCart()
  globalThis.addEventListener('add-to-cart', onAddToCart)
})
onUnmounted(() => {
  globalThis.removeEventListener('add-to-cart', onAddToCart)
})
```

**Why the Vue app must stay alive when the sidebar is closed:**
If products-listing-mfe conditionally unmounted CartSidebar, `onUnmounted`
would fire and remove the listener. Any "Add to Cart" clicks while the
sidebar was closed would be silently ignored. By keeping the Vue app
alive (via `display: none` on the wrapper), the listener is always active.

---

## Events fired

```
Event           When                  Payload
────────────    ──────────────────    ─────────────────────────────────────────
order-placed    after placeOrder()    { order, message }
cart-updated    after any mutation    { count }  ← total item quantity
```

`order-placed` is received by both products-listing-mfe (banner) and
orders-mfe (live list update).

`cart-updated` is received by products-listing-mfe to update the cart
count badge on the cart button.
