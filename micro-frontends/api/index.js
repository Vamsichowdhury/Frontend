const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ── Auth ────────────────────────────────────────────────────
// Demo users — in production replace with a real database + hashed passwords

const USERS = [
  { id: 1, username: "admin", password: "admin123" },
  { id: 2, username: "user", password: "user123" },
];

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user)
    return res.status(401).json({ error: "Invalid username or password" });
  console.log(`[POST /auth/login] "${username}" logged in`);
  res.json({ user: { id: user.id, username: user.username } });
});

// ── In-memory data ──────────────────────────────────────────

let products = [
  { id: 1, name: "Laptop", price: 999 },
  { id: 2, name: "Mouse", price: 29 },
  { id: 3, name: "Keyboard", price: 79 },
  { id: 4, name: "Monitor", price: 399 },
  { id: 5, name: "Headphones", price: 149 },
  { id: 6, name: "Webcam", price: 89 },
];
let nextProductId = 7;

let orders = [];
let nextOrderId = 1;

let cart = []; // [{ productId, name, price, quantity }]

// ── Product routes ──────────────────────────────────────────

app.get("/products", (req, res) => {
  res.json({ products });
});

app.post("/products", (req, res) => {
  const { name, price } = req.body;
  const product = { id: nextProductId++, name, price: Number(price) };
  products.push(product);
  console.log(`[POST /products] Added "${name}" $${price}`);
  res.json({ product });
});

app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, price } = req.body;
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ error: "Not found" });
  product.name = name;
  product.price = Number(price);
  console.log(`[PUT /products/${id}] Updated to "${name}" $${price}`);
  res.json({ product });
});

app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  products = products.filter((p) => p.id !== id);
  console.log(`[DELETE /products/${id}]`);
  res.json({ ok: true });
});

// ── Order routes ────────────────────────────────────────────

app.get("/orders", (req, res) => {
  res.json({ orders });
});

// items: [{ id, name, price, quantity }]
app.post("/orders", (req, res) => {
  const { items } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = {
    id: nextOrderId++,
    items,
    total,
    createdAt: new Date().toLocaleString(),
  };
  orders.push(order);
  console.log(`[POST /orders] Order #${order.id} placed - total $${total}`);
  res.json({ order });
});

app.delete("/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  orders = orders.filter((o) => o.id !== id);
  console.log(`[DELETE /orders/${id}]`);
  res.json({ ok: true });
});

// ── Cart routes ──────────────────────────────────────────────

app.get("/cart", (req, res) => {
  res.json({ items: cart });
});

app.post("/cart", (req, res) => {
  const { productId, name, price } = req.body;
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, name, price: Number(price), quantity: 1 });
  }
  console.log(
    `[POST /cart] Added "${name}" (qty: ${existing ? existing.quantity : 1})`,
  );
  res.json({ items: cart });
});

app.delete("/cart/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  cart = cart.filter((i) => i.productId !== productId);
  console.log(`[DELETE /cart/${productId}]`);
  res.json({ items: cart });
});

app.delete("/cart", (req, res) => {
  cart = [];
  console.log(`[DELETE /cart] Cleared`);
  res.json({ items: cart });
});

// ── Wishlist routes ─────────────────────────────────────────
// Wishlist is a simple set keyed by productId — no quantity, no duplicates.

let wishlist = []; // [{ productId, name, price }]

app.get("/wishlist", (req, res) => {
  res.json({ items: wishlist });
});

app.post("/wishlist", (req, res) => {
  const { productId, name, price } = req.body;
  // De-duplicate: saving the same item twice is a no-op
  if (wishlist.find((i) => i.productId === productId)) {
    console.log(`[POST /wishlist] "${name}" already saved (no-op)`);
    return res.json({ items: wishlist });
  }
  wishlist.push({ productId, name, price: Number(price) });
  console.log(`[POST /wishlist] Saved "${name}"`);
  res.json({ items: wishlist });
});

app.delete("/wishlist/:productId", (req, res) => {
  const productId = Number(req.params.productId);
  wishlist = wishlist.filter((i) => i.productId !== productId);
  console.log(`[DELETE /wishlist/${productId}]`);
  res.json({ items: wishlist });
});

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`  POST   /auth/login`);
  console.log(`  GET    /products`);
  console.log(`  POST   /products`);
  console.log(`  PUT    /products/:id`);
  console.log(`  DELETE /products/:id`);
  console.log(`  GET    /orders`);
  console.log(`  POST   /orders`);
  console.log(`  DELETE /orders/:id`);
  console.log(`  GET    /cart`);
  console.log(`  POST   /cart`);
  console.log(`  DELETE /cart/:productId`);
  console.log(`  DELETE /cart`);
  console.log(`  GET    /wishlist`);
  console.log(`  POST   /wishlist`);
  console.log(`  DELETE /wishlist/:productId`);
});
