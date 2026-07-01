# products-listing-mfe

React + Redux Toolkit Microfrontend. Runs on **http://localhost:3001**.
Exposed to the Host as a Module Federation Remote.

---

## What it does

- Fetches and displays a grid of products from the API
- Lets users add new products or delete existing ones
- Each product has an "Add to Cart" button that adds it to the cart via API
- Shows a cart count badge that updates in real time
- Hosts the Cart sidebar (which renders the Vue cart-mfe inside it)
- Shows a success banner when an order is placed (auto-closes in 5s)

---

## Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3001 to run standalone.

---

## Module Federation config

```js
federation({
  name: 'productsList',
  filename: 'remoteEntry.js',
  exposes: {
    './ProductsListing': './src/ProductsListing.jsx',
  },
  remotes: {
    // This MFE loads cart-mfe to render inside its sidebar
    cartMFE: {
      type: 'module',
      entry: 'http://localhost:3002/remoteEntry.js',
      ...
    },
  },
})
```

This MFE is both a **Remote** (exposed to host-app) and a **Host** (loads cart-mfe).

```
host-app
  └── loads productsList/ProductsListing   ← this MFE
        └── loads cartMFE/Cart             ← cart-mfe nested inside
```

---

## Redux store

```
store
 ├── ui
 │    ├── sidebarOpen: false   ← is the cart sidebar visible?
 │    └── banner: null         ← success message string, or null
 │
 └── products
      └── items: []            ← product list from API
```

Actions:
```
openSidebar()            sidebarOpen = true
closeSidebar()           sidebarOpen = false
showBanner(message)      banner = message
hideBanner()             banner = null

setProducts(array)       items = array (full replace on fetch)
addProduct(product)      items.push(product)
removeProduct(id)        items = items.filter(p => p.id !== id)
```

---

## Cart sidebar — mounting Vue inside React

CartSidebar is always mounted (never conditionally rendered). When the sidebar
is closed, only the wrapper div gets `display: none` — the Vue app stays alive.

```jsx
// CartSidebar component — mounts the Vue app once, keeps it alive
function CartSidebar() {
  const containerRef = useRef(null)

  useEffect(() => {
    let unmount
    let cancelled = false   // prevents double-mount in React StrictMode

    import('cartMFE/Cart').then(({ mountCart }) => {
      if (!cancelled && containerRef.current) {
        unmount = mountCart(containerRef.current)  // Vue takes over this div
      }
    })

    return () => { cancelled = true; unmount?.() }  // cleanup on unmount
  }, [])

  return <div ref={containerRef} />  // empty div Vue fills
}

// Always in the DOM — only hidden with CSS when closed
<div style={{ display: sidebarOpen ? 'block' : 'none' }}>
  <CartSidebar />
</div>
```

**Why always mounted?**
Cart.vue registers an `add-to-cart` event listener in `onMounted`. If
CartSidebar were conditionally rendered, the Vue app would unmount when the
sidebar closed — destroying that listener. Products added while the cart was
closed would silently disappear.

---

## Cart button and count badge

The cart button lives here (not in the host navbar) so it can directly call
`dispatch(openSidebar())` without any cross-MFE event.

The count badge listens for `cart-updated` events fired by cart-mfe after
every add/remove API call:

```js
globalThis.addEventListener('cart-updated', (e) => setCartCount(e.detail.count))
```

---

## Events received

```
Event           Source     Action
────────────    ────────   ────────────────────────────────────────
order-placed    cart-mfe   dispatch(showBanner(e.detail.message))
cart-updated    cart-mfe   setCartCount(e.detail.count)
```

## Events fired

```
Event           Destination   Payload
────────────    ───────────   ─────────────────────────────────────
add-to-cart     cart-mfe      { product: { id, name, price } }
```

---

## Banner — auto-dismiss + manual dismiss

```js
function Banner({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)  // auto-close after 5s
    return () => clearTimeout(timer)          // cancel if user closes first
  }, [onClose])
}
```

If the user clicks × before 5 seconds, `clearTimeout` cancels the timer.
If they wait, `setTimeout` fires `onClose` automatically.
