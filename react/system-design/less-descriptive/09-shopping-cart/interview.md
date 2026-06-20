# Shopping Cart — Interview Transcript

**Level:** Medium | **Duration:** 50-60 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Data Structure & Architecture | ⏹️ |
| 3 | CRUD Operations | ⏹️ |
| 4 | Calculations & Coupon | ⏹️ |
| 5 | Persistence & Edge Cases | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a shopping cart. What do you need to know?"

**What candidate should ask:**
- [ ] Is cart client-side only or synced to backend?
- [ ] Can user change quantities or just add/remove?
- [ ] Is there a coupon/discount system?
- [ ] Should cart persist across sessions (localStorage)?
- [ ] Multiple tabs — should they share the same cart?
- [ ] Do we need to handle out-of-stock items?

**Interviewer answers:**
> "Client-side with localStorage. Yes quantity controls. Yes basic coupon code. Persist to localStorage. No tab sync needed for now. Show out-of-stock warning."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Data Structure & Architecture

**Interviewer:**
> "How would you model the cart state?"

**Expected data structure:**
```javascript
// Each cart item
{
  productId: "prod_123",
  name: "React T-Shirt",
  price: 29.99,       // locked at time of adding
  image: "...",
  quantity: 2,
  maxQuantity: 10,
  inStock: true
}

// State
const [cartItems, setCartItems] = useState([]);
const [coupon, setCoupon] = useState(null);
```

**Expected architecture:**
```
CartContext (wraps app)
├── <ProductPage>
│   └── <AddToCartButton> (uses useCart hook)
└── <CartPage>
    ├── <CartItemList>
    │   └── <CartItem> × N
    └── <OrderSummary>
        └── <CouponInput>
```

**Interviewer pushback:**
> "Why Context API instead of passing props?"

**Expected:** Cart is needed in multiple unrelated components (product page, nav badge, cart page). Prop drilling 3+ levels is painful. Context makes it globally available.

**Candidate response:** *(write your response here)*

---

# Phase 3 — CRUD Operations

**Interviewer:**
> "Walk me through add, update, and remove logic."

**Expected:**
```javascript
const addToCart = (product) => {
  setCartItems(prev => {
    const existing = prev.find(i => i.productId === product.id);
    if (existing) {
      return prev.map(i =>
        i.productId === product.id
          ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQuantity) }
          : i
      );
    }
    return [...prev, { ...product, productId: product.id, quantity: 1 }];
  });
};

const removeFromCart = (productId) =>
  setCartItems(prev => prev.filter(i => i.productId !== productId));

const updateQuantity = (productId, qty) => {
  if (qty <= 0) return removeFromCart(productId);
  setCartItems(prev =>
    prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
  );
};
```

**Interviewer pushback:**
> "Why `Math.min(quantity + 1, maxQuantity)`?"

**Expected:** Enforces stock limit. Can't add more than available inventory. Should also disable the "+" button at max.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Calculations & Coupon

**Interviewer:**
> "How do you calculate subtotal, tax, and total?"

**Expected:**
```javascript
const summary = useMemo(() => {
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = coupon ? subtotal * coupon.discountRate : 0;
  const taxable = subtotal - discount;
  const tax = taxable * 0.08; // 8% tax
  return {
    subtotal,
    discount,
    tax,
    total: taxable + tax,
    itemCount: cartItems.reduce((n, i) => n + i.quantity, 0)
  };
}, [cartItems, coupon]);
```

**Interviewer pushback:**
> "Why useMemo here?"

**Expected:** Recalculating on every render is wasteful, especially with many items. `useMemo` only recomputes when `cartItems` or `coupon` changes.

**Interviewer:**
> "How do you validate the coupon code?"

**Expected:** API call: `POST /api/coupons/validate { code: "SAVE10" }`. On success: store coupon object. On failure: show inline error message.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Persistence & Edge Cases

**Interviewer:**
> "How does the cart survive page refresh?"

**Expected:**
```javascript
// Load from localStorage on mount
const [cartItems, setCartItems] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch { return []; }
});

// Save on every change
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}, [cartItems]);
```

**Interviewer:**
> "Product price changed from $29.99 to $39.99 while cart item is stored at $29.99. What happens at checkout?"

**Expected:** Prices should be re-validated at checkout against the server. Never trust client-side prices for payment. Show "Price has changed" warning and update to current price.

**Interviewer final question:**
> "Cart has 50 items. User navigates away and back. Is localStorage a concern?"

**Expected:** localStorage is ~5MB. 50 items × ~1KB each = ~50KB. Fine. Problem at thousands of items. Could also sync to backend for logged-in users.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
