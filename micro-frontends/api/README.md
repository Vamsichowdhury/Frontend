# api

Node.js + Express backend. In-memory storage for products, cart, and orders.
Runs on **http://localhost:4000**.

---

## Why does this exist?

MFEs are independent apps with isolated JavaScript. They cannot share a variable
like `let sharedCart = []`. A backend API is the single source of truth that all
MFEs can read from and write to independently.

```
products-listing-mfe ──GET/POST/DELETE /products──►┐
                                                    │
cart-mfe             ──GET/POST/DELETE /cart───────►│  API (source of truth)
                     ──POST /orders────────────────►│  in-memory storage
                                                    │
orders-mfe           ──GET/DELETE /orders──────────►┘
```

---

## Install & run

```bash
npm install
npm run dev    # starts with nodemon (auto-restart on file change)
npm start      # production start (no auto-restart)
```

---

## Endpoints

### Products

| Method   | Path              | Description                        |
|----------|-------------------|------------------------------------|
| GET      | /products         | List all products                  |
| POST     | /products         | Add a new product                  |
| PUT      | /products/:id     | Update a product's name and price  |
| DELETE   | /products/:id     | Remove a product                   |

**POST /products** body: `{ "name": "Tablet", "price": 499 }`
**PUT  /products/:id** body: `{ "name": "Tablet Pro", "price": 599 }`

---

### Cart

The cart is stored server-side. Each `POST /cart` adds one unit of a product
(or increments quantity if it already exists).

| Method   | Path              | Description                            |
|----------|-------------------|----------------------------------------|
| GET      | /cart             | Get current cart items                 |
| POST     | /cart             | Add item (increments qty if exists)    |
| DELETE   | /cart/:productId  | Remove one item entirely               |
| DELETE   | /cart             | Clear the entire cart                  |

**POST /cart** body: `{ "productId": 1, "name": "Laptop", "price": 999 }`

Response from all cart routes:
```json
{
  "items": [
    { "productId": 1, "name": "Laptop", "price": 999, "quantity": 2 }
  ]
}
```

---

### Orders

| Method   | Path          | Description              |
|----------|---------------|--------------------------|
| GET      | /orders       | List all orders          |
| POST     | /orders       | Place a new order        |
| DELETE   | /orders/:id   | Delete an order          |

**POST /orders** body: `{ "items": [{ "id": 1, "name": "Laptop", "price": 999, "quantity": 2 }] }`

Response:
```json
{
  "order": {
    "id": 1,
    "items": [{ "id": 1, "name": "Laptop", "price": 999, "quantity": 2 }],
    "total": 1998,
    "createdAt": "1/1/2025, 10:30:00 AM"
  }
}
```

---

## Important notes

**In-memory means no persistence across restarts.** Products reset to the
default 6 items, cart clears, and orders reset whenever the server restarts.
For production replace with a real database (PostgreSQL, MongoDB, etc.).

**CORS is enabled for all origins.** The MFEs run on different ports
(3001–3003). Without CORS, browsers block cross-origin `fetch()` calls.
In production, restrict to specific frontend domains.

**Cart is shared across all browser windows** (same server). This is
intentional for this learning project — in production you would scope
the cart to a user session (via auth token or session cookie).
