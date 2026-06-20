# PWA with Offline Support & Sync - System Design Overview

**Level:** Hard  
**Time to Solve:** 70-85 minutes  
**Tech Stack:** React + Service Workers + IndexedDB  

---

## Problem Statement

Build a Progressive Web App that:
- Works fully offline (reads and writes)
- Syncs local changes when back online
- Resolves conflicts if same data changed online + offline
- Caches assets and API responses
- Shows offline indicator
- Background sync queues failed requests

---

## Real-World Examples

- Google Maps (offline maps)
- Slack (offline message queue)
- Notion (offline editing, sync on reconnect)
- Spotify (offline playlists)
- Gmail (offline compose, send later)

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Service Worker lifecycle | How offline caching works |
| IndexedDB for offline storage | Persist data in browser |
| Background Sync API | Queue operations for later |
| Cache strategies | Network-first, cache-first, stale-while-revalidate |
| Conflict resolution | Same data changed offline and online |
| Network state detection | Respond to online/offline events |

---

## What You'll Learn

- Service Worker registration and lifecycle (install, activate, fetch)
- Caching strategies with Cache API
- IndexedDB for structured offline data storage
- Background Sync API to retry failed requests
- Offline indicator (navigator.onLine + online/offline events)
- Conflict resolution strategies (last-write-wins, merge, manual)
- How PWA installation works (manifest.json)

---

## High-Level Architecture

```
Browser
├── <React App />
│   ├── <OfflineIndicator />       (shows when offline)
│   ├── <SyncStatusBanner />       (shows pending sync queue)
│   └── <DataComponent />          (reads from local first)
│
├── Service Worker (sw.js)
│   ├── Cache API                  (caches assets + API responses)
│   └── Background Sync            (retries queued requests)
│
└── IndexedDB
    ├── "todos" object store        (local data)
    └── "sync_queue" object store   (pending operations)
```

---

## Cache Strategies Explained

```
1. Cache First (Assets: JS, CSS, images):
   → Check cache → if hit, return immediately
   → If miss, fetch network, cache it, return

2. Network First (Fresh data: API responses):
   → Try network first
   → If offline/slow, fall back to cache
   → Good for frequently changing data

3. Stale-While-Revalidate (Semi-fresh data: user profiles):
   → Return cache immediately (fast!)
   → Fetch network in background to update cache
   → Next request gets fresh data

4. Network Only (POST/PUT/DELETE):
   → Always go to network
   → If offline, queue for Background Sync
```

---

## Data Structure

```javascript
// IndexedDB stores
// Store 1: app data
const todosStore = {
  key: "id",
  data: [
    { id: "todo_1", text: "Buy milk", completed: false, updatedAt: 1699000000 }
  ]
};

// Store 2: sync queue (pending offline operations)
const syncQueueStore = {
  key: "queueId",
  data: [
    {
      queueId: "q_abc",
      operation: "CREATE",
      endpoint: "/api/todos",
      payload: { text: "Buy milk", completed: false },
      createdAt: 1699000000,
      retryCount: 0
    }
  ]
};

// App state
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [pendingSyncCount, setPendingSyncCount] = useState(0);
```

---

## Data Flow

```
ONLINE FLOW:
User creates a todo:
  → POST /api/todos
  → On success: save to IndexedDB as well
  → UI updates immediately

OFFLINE FLOW:
User creates a todo while offline:
  → Network request fails
  → Save to IndexedDB immediately (optimistic)
  → Queue operation in sync_queue
  → Register Background Sync tag: "sync-todos"
  → UI shows item immediately with "pending sync" indicator

Back ONLINE:
  → browser fires "online" event
  → Service Worker Background Sync fires
  → Process sync_queue one by one
  → For each: retry the original request
  → On success: remove from queue, mark as synced
  → On conflict: resolve and update

CONFLICT SCENARIO:
User edits todo offline: "Buy milk" → "Buy oat milk"
Someone else changes it online: "Buy milk" → "Buy almond milk"

Resolution strategies:
  1. Last-write-wins: whichever timestamp is newer wins
  2. Server-wins: server version always takes priority
  3. Manual resolution: show conflict UI to user
```

---

## Key Concepts to Learn

### 1. Service Worker Registration
```javascript
// In React app (index.js)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(registration => console.log("SW registered"))
    .catch(err => console.error("SW failed", err));
}
```

### 2. Service Worker Cache (sw.js)
```javascript
const CACHE_NAME = "app-v1";
const STATIC_ASSETS = ["/", "/index.html", "/app.js", "/styles.css"];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch: intercept all requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Network first for API, cache first for assets
      if (event.request.url.includes("/api/")) {
        return fetch(event.request).catch(() => cached);
      }
      return cached || fetch(event.request);
    })
  );
});
```

### 3. IndexedDB (via idb library)
```javascript
import { openDB } from "idb";

const db = await openDB("myapp", 1, {
  upgrade(db) {
    db.createObjectStore("todos", { keyPath: "id" });
    db.createObjectStore("sync_queue", { keyPath: "queueId", autoIncrement: true });
  }
});

// Save a todo locally
await db.put("todos", { id: "todo_1", text: "Buy milk", completed: false });

// Read all todos
const allTodos = await db.getAll("todos");

// Queue an operation
await db.add("sync_queue", {
  operation: "CREATE",
  endpoint: "/api/todos",
  payload: { text: "Buy milk" }
});
```

### 4. Online/Offline Detection
```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true);
    triggerSync(); // attempt to sync queued operations
  };
  const handleOffline = () => setIsOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
```

### 5. Background Sync API
```javascript
// Register sync in React app
const registerSync = async () => {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register("sync-todos");
};

// Handle in Service Worker
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-todos") {
    event.waitUntil(processSyncQueue());
  }
});

const processSyncQueue = async () => {
  const db = await openDB();
  const queue = await db.getAll("sync_queue");

  for (const item of queue) {
    try {
      await fetch(item.endpoint, {
        method: item.operation === "CREATE" ? "POST" : "PATCH",
        body: JSON.stringify(item.payload)
      });
      await db.delete("sync_queue", item.queueId); // remove on success
    } catch (err) {
      // Will retry next sync
    }
  }
};
```

---

## Implementation Phases

### Phase 1 — Online/Offline Detection
- navigator.onLine check
- Event listeners
- Offline indicator component

### Phase 2 — Service Worker Setup
- Register service worker
- Cache static assets on install
- Cache-first strategy for assets

### Phase 3 — IndexedDB Integration
- Read from IndexedDB first
- Write to IndexedDB + queue for API
- Show pending count

### Phase 4 — Sync on Reconnect
- Process sync queue when online
- Handle success/failure
- Update UI on sync complete

### Phase 5 — Conflict Resolution
- Detect conflicts on sync
- Implement chosen strategy
- User-facing conflict UI (optional)

---

## Storage Limits by Browser

| Storage | Limit | Use case |
|---------|-------|---------|
| localStorage | ~5MB | Small settings |
| sessionStorage | ~5MB | Temp session data |
| IndexedDB | ~50% disk | Large structured data |
| Cache API | ~50% disk | Assets and API responses |

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| Just mentions localStorage | Uses IndexedDB for structured data |
| No conflict resolution | Discusses strategies with tradeoffs |
| No background sync | Background Sync API for retry queue |
| One cache strategy | Knows all 4 strategies and when to use each |
| Doesn't mention PWA manifest | Discusses installability |
