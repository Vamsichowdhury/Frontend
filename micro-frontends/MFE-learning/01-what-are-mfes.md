# 01 — What Are Micro-Frontends?

## The problem MFEs solve

Imagine a large company like Amazon. Their website has hundreds of features:
search, product listings, cart, recommendations, reviews, payments, and more.

If all of this is one giant React app (a **monolith**), you run into problems:

- Every team has to work in the same codebase
- One team's bug can break the whole site
- To ship a small fix in the cart, you have to redeploy the entire app
- Different teams can't choose the best tool for their job — everyone has to use the same framework

**Micro-Frontends solve this by splitting the frontend into independent pieces.**
Each piece is owned by a different team, deployed separately, and composed together
at runtime.

---

## The analogy: microservices for the frontend

You've probably heard of **microservices** on the backend — instead of one giant
server, you split it into small services (auth service, payment service, etc.)
that each do one thing and communicate over APIs.

Micro-Frontends are the same idea applied to the frontend:

```
Monolith (one big app)          Micro-Frontends (many small apps)
──────────────────────          ──────────────────────────────────

┌─────────────────────┐         ┌─────────┐  ┌──────────┐
│                     │         │ Products│  │  Cart    │
│  Products           │         │   MFE   │  │   MFE    │
│  Cart               │  ─────► │  React  │  │   Vue    │
│  Orders             │         └─────────┘  └──────────┘
│  Auth               │               ↓           ↓
│                     │         ┌─────────────────────────┐
└─────────────────────┘         │      Host App (shell)   │
                                │   assembles them all     │
                                └─────────────────────────┘
```

---

## Key benefits

### 1. Independent deployment
Each MFE can be deployed on its own. The cart team can ship a fix at 2pm without
waiting for the products team to finish their feature.

### 2. Team autonomy
Each team owns their MFE end-to-end: frontend, backend, design. They can move
at their own pace.

### 3. Technology freedom
One team can use React. Another can use Vue. Another can use plain JavaScript.
They all still compose together in the browser.

### 4. Smaller codebases
Each MFE is a small, focused app. It's easier to understand, test, and maintain
than a 100,000-line monolith.

---

## Key trade-offs

MFEs are not free. Here's what you give up:

| Trade-off | Explanation |
|-----------|-------------|
| **More complexity** | You now manage multiple repos, multiple deployments, and cross-MFE communication |
| **Larger bundle size** | If two MFEs both include React, that's React loaded twice (unless you share it — covered in file 02) |
| **Harder debugging** | A bug may span multiple MFEs, making the stack trace harder to follow |
| **Coordination overhead** | Cross-team API contracts (events, shared modules) need careful design |

---

## When to use MFEs

Use MFEs when:
- Your app is large enough that multiple teams are stepping on each other
- Different parts of your app need to be deployed independently
- Different parts genuinely benefit from different frameworks or libraries

**Do NOT use MFEs when:**
- You are a solo developer or a small team
- Your app is small (a simple dashboard, a landing page)
- The overhead of coordination would slow you down more than help you

> Rule of thumb: if you can comfortably hold the whole codebase in your head,
> you don't need MFEs yet.

---

## How MFEs are composed (the three main approaches)

### 1. Build-time composition
MFEs are published as npm packages. The host imports them like regular dependencies.

```
Downside: you have to redeploy the host every time an MFE changes.
Not truly independent.
```

### 2. Server-side composition
A server (or CDN) assembles the HTML from different MFE services before sending
it to the browser.

```
Used by: large sites that need great SEO and fast first paint.
```

### 3. Runtime composition via Module Federation ✅
The host app fetches MFE JavaScript bundles from remote servers **at runtime**,
in the browser, without any rebuild step.

```
Used in this project. Covered in detail in file 02.
```

---

## How this project is structured

```
host-app (shell)
  ├── loads products-listing-mfe at runtime    (React MFE)
  │       └── loads cart-mfe at runtime        (Vue MFE — inside the React MFE)
  └── loads orders-mfe at runtime              (React MFE)

All MFEs share one backend API (Express, port 4000)
```

The host is intentionally thin — it just provides the navbar and wires together
the MFEs. All business logic lives inside the MFEs themselves.

---

## Summary

| Concept | One-liner |
|---------|-----------|
| Micro-Frontend | An independently deployable piece of a frontend application |
| Host | The shell app that loads and assembles MFEs |
| Remote | An MFE that is loaded by the host at runtime |
| Module Federation | The Webpack/Vite feature that makes runtime loading possible |

Next: [02-module-federation.md](./02-module-federation.md)
