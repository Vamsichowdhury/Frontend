# Shopping Cart - System Design Overview

**Level:** Medium  
**Time to Solve:** 50-60 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a shopping cart where:
- Users can add/remove/update items
- Quantity can be changed per item
- Subtotal, tax, total calculated automatically
- Cart persists across page refresh
- Items can be out-of-stock
- Coupon/promo code can be applied
- Cart syncs across browser tabs

---

## Real-World Examples

- Amazon cart
- Flipkart cart
- Shopify storefronts
- Swiggy/Zomato order summary

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Complex state management | Cart items with quantities and prices |
- Calculation logic | Subtotal, tax, discount, total |
| Optimistic updates | Immediate UI response before API confirm |
| Persistence | Cart survives page refresh |
| State sync | Multiple tabs share same cart |
| Error handling | Out-of-stock, quantity limits |

---

## What You'll Learn

- Cart data structure design (item + quantity map)
- Computed values from state (subtotal, tax, total)
- Context API for global cart state
- localStorage for persistence
- Optimistic UI update pattern
- BroadcastChannel API (sync across tabs)
- Handling price changes between add and checkout

---

## High-Level Architecture

```
<App />
├── CartProvider (Context — wraps entire app)
│
├── <ProductPage />
│   └── <ProductCard />
│       └── <AddToCartButton />  (uses useCart hook)
│
└── <CartPage />
    ├── <CartItemList />
    │   └── <CartItem />  × N
    │       ├── Quantity controls (+ / -)
    │       └── Remove button
    ├── <CouponInput />
    └── <OrderSummary />
        ├── Subtotal
        ├── Discount
        ├── Tax
        └── Total
```

---

## Data Structure

```javascript
// Cart item shape
{
  productId: "prod_123",
  name: "React T-Shirt",
  price: 29.99,        // price at time of adding
  quantity: 2,
  image: "https://...",
  maxQuantity: 10,     // stock limit
  inStock: true
}

// Cart state (using Map for O(1) lookup)
const [cartItems, setCartItems] = useState(new Map());
// key: productId, value: cartItem

// Or as array (simpler, but O(n) lookup)
const [cartItems, setCartItems] = useState([]);

// Coupon state
const [coupon, setCoupon] = useState(null);
// { code: "SAVE10", discount: 0.10, type: "percentage" }
```

---

## Data Flow

```
User clicks "Add to Cart":
  → check if item already in cart
  → if yes: increment quantity
  → if no: add new item with quantity 1
  → save to localStorage
  → broadcast to other tabs

User clicks "+" quantity:
  → check against maxQuantity
  → increment if allowed, show error if at limit

User clicks "-" quantity:
  → decrement; if quantity reaches 0, remove item

User clicks "Remove":
  → filter out item by productId

User applies coupon "SAVE10":
  → validate coupon via API
  → store coupon in state
  → recompute total with discount

Total calculation:
  → subtotal = sum of (price × quantity)
  → discount = coupon ? subtotal × coupon.discount : 0
  → tax = (subtotal - discount) × taxRate
  → total = subtotal - discount + tax
```

---

## Key Concepts to Learn

### 1. Cart State (Array Approach)
```javascript
const addToCart = (product) => {
  setCartItems(prev => {
    const existing = prev.find(item => item.productId === product.id);
    if (existing) {
      return prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, item.maxQuantity) }
          : item
      );
    }
    return [...prev, { ...product, productId: product.id, quantity: 1 }];
  });
};

const removeFromCart = (productId) => {
  setCartItems(prev => prev.filter(item => item.productId !== productId));
};

const updateQuantity = (productId, quantity) => {
  if (quantity === 0) return removeFromCart(productId);
  setCartItems(prev =>
    prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    )
  );
};
```

### 2. Computed Totals (useMemo)
```javascript
const cartSummary = useMemo(() => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon ? subtotal * coupon.discountRate : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;

  return { subtotal, discount, tax, total, itemCount: cartItems.length };
}, [cartItems, coupon]);
```

### 3. Context API for Global Cart
```javascript
const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
const useCart = () => useContext(CartContext);
```

### 4. Cross-Tab Sync with BroadcastChannel
```javascript
const channel = new BroadcastChannel("cart_sync");

// Send updates to other tabs
useEffect(() => {
  channel.postMessage({ type: "CART_UPDATE", cartItems });
}, [cartItems]);

// Receive updates from other tabs
useEffect(() => {
  channel.onmessage = (event) => {
    if (event.data.type === "CART_UPDATE") {
      setCartItems(event.data.cartItems);
    }
  };
  return () => channel.close();
}, []);
```

---

## Implementation Phases

### Phase 1 — Core Cart State
- cartItems state
- Add / remove / update quantity

### Phase 2 — Computed Summary
- useMemo for subtotal, tax, total
- Item count badge

### Phase 3 — Context + Persistence
- CartContext wrapping app
- localStorage sync with useEffect

### Phase 4 — Coupon System
- Coupon input component
- API validation
- Discount calculation

### Phase 5 — Edge Cases
- Out-of-stock handling
- Max quantity enforcement
- Cross-tab sync

---

## Performance Considerations

- useMemo for cart totals (avoid recalculation on every render)
- React.memo on CartItem (only re-renders if that item changes)
- Optimistic updates — update UI immediately, sync to API in background

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Item runs out of stock after adding | Show "Out of stock" warning in cart |
| Price changes between add and checkout | Re-validate prices at checkout |
| Max quantity reached | Disable "+" button, show message |
| Cart empty | Empty state with "Continue Shopping" CTA |
| Coupon already used | API error → show message |
| Very long product names | CSS truncation with title tooltip |

---

## Interview Tips for This Question

- Ask: "Should cart sync with a backend API or stay client-side only?"
- Ask: "Do we need authentication to save cart?"
- Discuss optimistic updates — don't wait for API before showing changes
- Mention localStorage for persistence but discuss its 5MB limit
