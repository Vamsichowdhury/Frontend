# Event Emitter & Pub/Sub System - Complete Frontend Interview Notes

---

# Table of Contents

1. What is an Event Emitter?
2. How Event Emitter Works
3. Event Emitter Implementation
4. Real-world Examples
5. What is Pub/Sub?
6. Pub/Sub Implementation
7. Event Emitter vs Pub/Sub
8. Does Vue use Event Emitters?
9. Does React use Event Emitters?
10. Where do we use Event Emitters in React & Vue?
11. Interview Questions
12. Summary

---

# What is an Event Emitter?

An **Event Emitter** is an object that allows different parts of an application to communicate using **events**.

Instead of calling functions directly, one object **emits an event**, and other objects that are interested in that event execute their callbacks.

Think of it as a notification system.

```
User Clicks Button
        │
        ▼
 Event Emitter
        │
 ┌──────┼───────────┐
 │      │           │
 ▼      ▼           ▼
Listener A  Listener B  Listener C
```

---

## Real-life Example

Imagine a shopping website.

When an order is placed:

```
Order Placed
```

Many things should happen.

- Send confirmation email
- Reduce inventory
- Show success message
- Log analytics
- Notify warehouse

Without Event Emitter

```javascript
placeOrder();

sendEmail();
updateInventory();
showToast();
trackAnalytics();
notifyWarehouse();
```

This creates tight coupling.

Instead

```javascript
emitter.emit("orderPlaced", order);
```

Now every interested module receives the notification automatically.

---

# Core Methods

## on()

Register an event listener.

```javascript
emitter.on("login", callback);
```

---

## emit()

Trigger an event.

```javascript
emitter.emit("login", user);
```

---

## off()

Remove listener.

```javascript
emitter.off("login", callback);
```

---

## once()

Runs only once.

```javascript
emitter.once("connected", callback);
```

---

# Event Emitter Implementation

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => {
      callback(...args);
    });
  }

  off(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };

    this.on(event, wrapper);
  }
}
```

Usage

```javascript
const emitter = new EventEmitter();

emitter.on("login", (user) => {
  console.log("Welcome", user);
});

emitter.emit("login", "Vamsi");
```

Output

```
Welcome Vamsi
```

---

# Multiple Listeners

```javascript
emitter.on("login", () => console.log("Navbar"));
emitter.on("login", () => console.log("Analytics"));
emitter.on("login", () => console.log("Notifications"));

emitter.emit("login");
```

Output

```
Navbar
Analytics
Notifications
```

---

# What is Pub/Sub?

Pub/Sub stands for

**Publisher - Subscriber**

It is a messaging pattern where

- Publishers publish messages
- Subscribers receive messages
- Neither knows about the other

Both communicate through a **Message Broker (Message Bus).**

```
Publisher A
Publisher B
Publisher C
      │
      ▼
+----------------+
|  Message Bus   |
+----------------+
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
Sub A Sub B       Sub C
```

Notice

Publisher never calls subscribers directly.

Subscribers never know who published.

---

## Example

YouTube

When a creator uploads a video

```
Publish

"New Video Uploaded"
```

YouTube automatically notifies

- Alice
- Bob
- Charlie

The creator doesn't know any subscriber.

---

# Simple Pub/Sub Implementation

```javascript
class PubSub {
  constructor() {
    this.events = {};
  }

  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  }

  publish(event, data) {
    if (!this.events[event]) return;

    this.events[event].forEach((cb) => cb(data));
  }

  unsubscribe(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }
}
```

Usage

```javascript
const bus = new PubSub();

bus.subscribe("cart", (item) => {
  console.log(item);
});

bus.publish("cart", "Laptop");
```

Output

```
Laptop
```

---

# Event Emitter vs Pub/Sub

| Feature                    | Event Emitter         | Pub/Sub                           |
| -------------------------- | --------------------- | --------------------------------- |
| Communication              | Direct                | Through Broker                    |
| Publisher knows emitter    | Yes                   | No                                |
| Subscribers know publisher | Usually               | No                                |
| Coupling                   | Tight                 | Loose                             |
| Scalability                | Medium                | High                              |
| Used in                    | Components, Libraries | Large Applications, Microservices |

---

# Does Vue Already Have an Event Emitter?

## YES.

Vue internally uses event-based communication.

### Child → Parent Communication

Child Component

```vue
<script setup>
const emit = defineEmits(["save"]);

function saveUser() {
  emit("save", user);
}
</script>
```

Parent Component

```vue
<ChildComponent @save="handleSave" />
```

What happens internally?

```
Child

emit("save")

      │

Vue Event System

      │

Parent receives

@save
```

This is essentially an Event Emitter.

---

## Vue 2 Event Bus

Vue 2 developers often created a global Event Bus.

```javascript
const bus = new Vue();
```

Emit

```javascript
bus.$emit("logout");
```

Listen

```javascript
bus.$on("logout", () => {
  console.log("Logged out");
});
```

This was simply an Event Emitter.

**Vue 3 removed this pattern** because it became difficult to manage in large applications.

Instead, Vue recommends

- Props
- Emits
- Pinia
- provide/inject

or small event libraries like

```javascript
mitt;
```

---

## Vue's Custom Events

When you write

```vue
emit("submit")
```

Vue internally does something similar to

```javascript
eventEmitter.emit("submit");
```

When parent writes

```vue
@submit="handler"
```

Vue internally registers

```javascript
eventEmitter.on("submit", handler);
```

So Vue already contains an Event Emitter mechanism.

---

# Does React Have an Event Emitter?

React itself **does NOT expose a generic Event Emitter API** like Node.js.

However, React internally uses event systems.

---

## React Synthetic Events

When you write

```jsx
<button onClick={handleClick}>
```

React internally

```
Browser Click

↓

React Synthetic Event

↓

handleClick()
```

React has an internal event delegation system.

So React internally behaves like an Event Emitter for DOM events.

---

# React Component Communication

Instead of Event Emitters, React prefers

```
Parent

↓

Props

↓

Child
```

and

```
Child

↓

Callback

↓

Parent
```

Example

```jsx
function Parent() {
  const handleSave = () => {
    console.log("Saved");
  };

  return <Child onSave={handleSave} />;
}
```

Child

```jsx
function Child({ onSave }) {
  return <button onClick={onSave}>Save</button>;
}
```

This is React's preferred communication mechanism.

---

# Can React Use Event Emitters?

Absolutely.

Many applications create their own.

Example

```javascript
const emitter = new EventEmitter();

emitter.on("themeChanged", () => {
  console.log("Theme Updated");
});

emitter.emit("themeChanged");
```

Libraries commonly used

- mitt
- eventemitter3
- Node EventEmitter (outside browser)
- tiny-emitter

---

# Does React Use Pub/Sub?

Not directly.

But many popular libraries use the Pub/Sub pattern internally.

---

## Redux

```
dispatch(action)

↓

Store updates state

↓

Subscribers notified

↓

React Components re-render
```

Internally

```javascript
store.subscribe(listener);
```

Whenever

```javascript
dispatch(action);
```

All subscribers are notified.

This is Pub/Sub.

---

## React Context

Context also behaves similarly.

```
Provider

↓

Value Changes

↓

All Consumers Update
```

Although not a generic Pub/Sub implementation, the communication pattern is similar.

---

## React Query (TanStack Query)

```
Server Data Changes

↓

Cache Updated

↓

Subscribers Notified

↓

Components Re-render
```

Again, Pub/Sub internally.

---

## Zustand

When state changes

```
Store

↓

Notify Subscribers

↓

Components Update
```

Uses subscription internally.

---

## Firebase Firestore

```
Database Updated

↓

Publish Change

↓

Subscribed Clients Receive Update
```

```javascript
onSnapshot(...)
```

This is Pub/Sub.

---

## WebSocket

Server

```
publish

↓

Connected Clients receive message
```

Pub/Sub pattern.

---

# Which Pattern Do We Use Daily?

| Library              | Pattern                  |
| -------------------- | ------------------------ |
| Vue emit             | Event Emitter            |
| React DOM Events     | Event Emitter (internal) |
| Redux                | Pub/Sub                  |
| Zustand              | Pub/Sub                  |
| React Query          | Pub/Sub                  |
| Firebase onSnapshot  | Pub/Sub                  |
| WebSocket            | Pub/Sub                  |
| Node.js EventEmitter | Event Emitter            |

---

# When Should You Use Event Emitter?

Use when

- One module needs to notify multiple listeners
- Decouple components
- Plugins
- Analytics
- Notifications

Example

```
User Logged In

↓

Emit Login Event

↓

Navbar

Analytics

Notifications

Chat
```

---

# When Should You Use Pub/Sub?

Use when

- Global application events
- Multiple independent modules
- Real-time applications
- State management
- Microservices
- Event-driven architecture

Example

```
Order Service

↓

Publish Order Created

↓

Inventory Service

↓

Email Service

↓

Analytics Service

↓

Shipping Service
```

---

# Interview Questions

## Q1. What is Event Emitter?

An Event Emitter is an object that allows registering listeners for named events and notifying them by emitting those events.

---

## Q2. What is Pub/Sub?

Pub/Sub is a messaging pattern where publishers publish messages to a broker or message bus, and subscribers receive those messages without knowing who published them.

---

## Q3. Difference?

Event Emitter is usually a concrete implementation used within a module or application.

Pub/Sub is a broader architectural pattern where publishers and subscribers communicate through an intermediary.

---

## Q4. Does Vue use Event Emitters?

Yes.

- `emit()`
- `defineEmits()`
- Parent listeners (`@event`)

are all built on an event-based communication model.

Vue 2 also had a global Event Bus (`$emit`, `$on`), which was removed in Vue 3 in favor of more maintainable patterns.

---

## Q5. Does React have Event Emitters?

Not as a public API.

React internally has a synthetic event system for DOM events, but for component communication it prefers props, callbacks, Context, and state management libraries. If needed, you can use external Event Emitter libraries.

---

## Q6. Does Redux use Pub/Sub?

Yes.

`dispatch()` updates the store, and all components or listeners subscribed via `store.subscribe()` are notified automatically.

---

## Q7. Name some libraries using Pub/Sub.

- Redux
- Zustand
- React Query (TanStack Query)
- Firebase Firestore
- WebSocket-based applications
- RxJS (Observables)
- MQTT clients

---

# Interview Summary

✅ Event Emitter is an **implementation** that lets an object emit named events to registered listeners.

✅ Pub/Sub is an **architectural pattern** where publishers and subscribers communicate through a message broker, remaining completely decoupled.

✅ Vue provides built-in event-based communication through `emit()`/`defineEmits()`.

✅ React does not expose a generic Event Emitter, but it internally uses an event system for DOM events and relies on props/callbacks for component communication.

✅ Popular frontend libraries like Redux, Zustand, React Query, Firebase, and WebSockets all rely heavily on the Pub/Sub pattern internally.
