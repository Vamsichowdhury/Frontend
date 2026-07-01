# Micro-Frontend Learning Guide

A beginner-friendly guide to understanding Micro-Frontends (MFEs) — what they are,
why they exist, and how to build them. All examples are taken from the shop project
in this repository so you can read the guide alongside real working code.

---

## Table of Contents

| File | What you'll learn |
|------|-------------------|
| [01-what-are-mfes.md](./01-what-are-mfes.md) | What MFEs are, why they exist, when to use them |
| [02-module-federation.md](./02-module-federation.md) | How Vite Module Federation works (host, remote, shared) |
| [03-communication.md](./03-communication.md) | How MFEs talk to each other (Custom Events) |
| [04-patterns.md](./04-patterns.md) | Mount function, StrictMode pitfall, event cleanup |
| [05-our-project.md](./05-our-project.md) | Full walkthrough of the shop project as a case study |
| [06-flow-diagrams.md](./06-flow-diagrams.md) | ASCII diagrams: Module Federation loading, Custom Event lifecycle, auth flow |
| [07-routing.md](./07-routing.md) | Routing across host + MFEs (BrowserRouter, splat routes, singleton sharing) |

---

## How to read this guide

If you are brand new to MFEs, read the files in order (01 → 05).
If you already know the basics and want to look something up, jump to the file you need.

Every concept is explained with:
- A plain-English description
- A "why does this matter?" section
- A code example from this project

---

## Quick reference — ports in this project

| App | Port | Framework |
|-----|------|-----------|
| host-app | 3000 | React |
| products-listing-mfe | 3001 | React + Redux |
| cart-mfe | 3002 | Vue + Pinia |
| orders-mfe | 3003 | React + Redux |
| wishlist-mfe | 3004 | React + React Router |
| api | 4000 | Node + Express |
