# PWA with Offline Support — Interview Transcript

**Level:** Hard | **Duration:** 70-85 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Service Worker & Cache Strategy | ⏹️ |
| 3 | Offline Storage with IndexedDB | ⏹️ |
| 4 | Sync Queue & Conflict Resolution | ⏹️ |
| 5 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a Todo app that works offline. What do you need to know?"

**What candidate should ask:**
- [ ] What works offline — read only or read+write?
- [ ] How is sync triggered — automatic or manual?
- [ ] How do you handle conflicts (offline edit + online edit of same item)?
- [ ] Is authentication required?
- [ ] Target devices? (mobile-first = PWA is great)
- [ ] How long can user be offline? (minutes or days?)

**Interviewer answers:**
> "Full read + write offline. Automatic sync when online. Last write wins for conflicts. No auth for now. Mobile-first. Could be offline for hours."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Service Worker & Cache Strategy

**Interviewer:**
> "What's a Service Worker and how does it enable offline support?"

**Expected explanation:**
```
Service Worker:
  - JavaScript file running in background thread (not main thread)
  - Intercepts ALL network requests from the app
  - Can serve from cache when offline
  - Can queue requests to retry later
  - Has its own lifecycle: install → activate → fetch
```

**Expected cache strategies by resource type:**
```
Static assets (JS, CSS, icons):
  → Cache First: serve from cache, background refresh
  → Set once during SW install

API responses (GET /todos):
  → Stale While Revalidate: serve cache immediately, update in background
  → Users see instant load, data refreshes silently

API writes (POST, PATCH, DELETE):
  → Network Only with offline queue
  → If offline: save to IndexedDB sync queue
  → Retry when online via Background Sync
```

**Expected SW fetch handler:**
```javascript
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Static assets: cache first
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
    return;
  }

  // API reads: network first, fallback to cache
  if (request.url.includes("/api/") && request.method === "GET") {
    event.respondWith(
      fetch(request)
        .then(res => { cache.put(request, res.clone()); return res; })
        .catch(() => caches.match(request))
    );
  }
});
```

**Interviewer pushback:**
> "What happens if the user has never visited before and goes offline?"

**Expected:** Nothing is cached yet. Service Worker install pre-caches the app shell (HTML, JS, CSS) on first load. Data won't be available, but the app UI will load.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Offline Storage with IndexedDB

**Interviewer:**
> "User creates a todo while offline. Where is it stored?"

**Expected — NOT localStorage:**
```
localStorage:
  ❌ Synchronous (blocks main thread)
  ❌ 5MB limit
  ❌ Strings only (must JSON.stringify everything)
  ❌ Not accessible from Service Workers

IndexedDB:
  ✅ Asynchronous (non-blocking)
  ✅ ~50% of disk space
  ✅ Stores objects natively
  ✅ Accessible from Service Workers
  ✅ Indexed queries
```

**Expected IndexedDB usage (via idb library):**
```javascript
import { openDB } from "idb";

const db = await openDB("todos-db", 1, {
  upgrade(db) {
    db.createObjectStore("todos", { keyPath: "id" });
    db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
  }
});

// Save todo locally
await db.put("todos", { id: "todo_abc", text: "Buy milk", synced: false });

// Queue for later sync
await db.add("syncQueue", {
  operation: "CREATE",
  payload: { id: "todo_abc", text: "Buy milk" },
  endpoint: "/api/todos",
  createdAt: Date.now()
});
```

**Interviewer pushback:**
> "Why add `synced: false` flag to the todo?"

**Expected:** UI can show a "pending sync" indicator on unsynced items. User knows which todos haven't made it to the server yet.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Sync Queue & Conflict Resolution

**Interviewer:**
> "User comes back online. How do you sync the queued operations?"

**Expected:**
```javascript
// In React app — listen for online event
window.addEventListener("online", async () => {
  setIsOnline(true);
  const queue = await db.getAll("syncQueue");

  for (const item of queue) {
    try {
      await fetch(item.endpoint, {
        method: item.operation === "CREATE" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload)
      });
      await db.delete("syncQueue", item.id); // remove from queue
      // Mark todo as synced
      await db.put("todos", { ...item.payload, synced: true });
    } catch {
      // Leave in queue, try again next online event
    }
  }
});
```

**Interviewer:**
> "User edits todo offline: 'Buy milk' → 'Buy oat milk'. Someone else changes it online to 'Buy almond milk'. Who wins?"

**Expected conflict resolution strategies:**
```
1. Last Write Wins (simplest):
   → Compare timestamps
   → Whichever was written last wins
   → Simple, may lose data

2. Server Wins:
   → Server version always takes priority
   → Offline changes discarded if server changed
   → Safe but frustrating for user

3. Client Wins:
   → Offline changes always applied
   → Risk: reverting others' changes

4. Manual Resolution:
   → Show conflict to user: "Server has X, you have Y"
   → User picks winner
   → Best UX but complex to build
```

**For this interview, recommend Last Write Wins with explanation of the tradeoff.**

**Candidate response:** *(write your response here)*

---

# Phase 5 — Edge Cases & Follow-ups

**Interviewer:**
> "What's the offline indicator — how do you show the user they're offline?"

**Expected:**
```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);
window.addEventListener("online", () => setIsOnline(true));
window.addEventListener("offline", () => setIsOnline(false));

// Show banner
{!isOnline && <Banner>You're offline. Changes will sync when reconnected.</Banner>}
```

**Interviewer:**
> "What if the sync queue has 100 operations and fails halfway? Is the data consistent?"

**Expected:** Each operation is independent. Partial sync is possible. Solutions:
- Process sequentially, stop on first failure
- Retry logic with exponential backoff
- Mark each operation status individually

**Interviewer final question:**
> "IndexedDB has a storage limit. What happens if the user runs out of space?"

**Expected:** Browser will prompt user or silently fail. Should:
- Catch `QuotaExceededError`
- Show user an error message
- Ask user to sync/clear old data
- Prioritize recent operations in queue

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
