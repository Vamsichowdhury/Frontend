# React Interview Prep Notes

---

## Table of Contents

1. [React Basics](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#react-basics)
2. [JSX](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#jsx)
3. [Components](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#components)
4. [Props &amp; State](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#props--state)
5. [Event Handling](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#event-handling)
6. [Virtual DOM &amp; Reconciliation](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#virtual-dom--reconciliation)
7. [Refs](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#refs)
8. [Context &amp; Prop Drilling](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#context--prop-drilling)
9. [Rendering: CSR vs SSR](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#rendering-csr-vs-ssr)
10. [Hooks Overview](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#hooks-overview)
11. [useState](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#usestate)
12. [useEffect](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#useeffect)
13. [useRef](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#useref)
14. [useMemo](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#usememo)
15. [useCallback](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#usecallback)
16. [Custom Hooks](https://claude.ai/chat/75502eae-610b-428c-8fda-f113cbe23e14#custom-hooks)

---

## React Basics

### What is React?

React is an open-source JavaScript library developed by Facebook for building fast and interactive user interfaces using a **component-based architecture** , especially for single-page applications (SPAs).

### Key Features

| Feature               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| **Component-Based**   | Build UI using reusable, independent components              |
| **Virtual DOM**       | Updates only changed parts of the UI for better performance  |
| **JSX**               | Write HTML-like syntax directly inside JavaScript            |
| **One-Way Data Flow** | Data flows parent → child, making apps predictable           |
| **Declarative UI**    | Describe what the UI should look like; React handles updates |

---

### React vs Vue

|                      | React                              | Vue                    |
| -------------------- | ---------------------------------- | ---------------------- |
| **UI Syntax**        | JSX                                | Template-based         |
| **Ecosystem**        | Large                              | Smaller                |
| **Learning Curve**   | Moderate                           | Simpler                |
| **Flexibility**      | Greater (bring your own libraries) | More built-in features |
| **Router**           | React Router / TanStack Router     | Vue Router (official)  |
| **State Management** | Redux / Zustand / Context API      | Pinia (official)       |

### When to Choose Which?

- **React** — Large ecosystem needed, team already has React experience, enterprise apps requiring flexibility and hiring breadth.
- **Vue** — Rapid development, easier onboarding, built-in official solutions, small-to-medium projects.

---

## JSX

### What is JSX?

JSX (JavaScript XML) is a **syntax extension** for JavaScript that allows writing HTML-like code inside JS. It gets transpiled into `React.createElement()` calls at build time by tools like Babel.

```jsx
// JSX
const element = <h1>Hello World</h1>;

// What Babel compiles it to
const element = React.createElement("h1", null, "Hello World");
```

### Key Points

- Browsers do **not** understand JSX directly — Babel transpiles it first.
- JSX is **stricter** than HTML — all elements must have a closing tag.
- Supports JavaScript expressions inside `{}`.
- Makes UI code more readable and maintainable.

---

## Components

### What is a Component?

A component is an **independent, reusable code block** that divides the UI into smaller pieces.

```
App
├── Header
├── Navbar
├── ProductCard (reused many times)
└── Footer
```

### Benefits

- **Reusability** — Write once, use multiple times
- **Maintainability** — Smaller, easier-to-manage code
- **Separation of Concerns** — UI and logic in independent units
- **Testability** — Each component can be tested individually

### Types

- **Functional Components** ✅ (Recommended)
- **Class Components** (Legacy)

---

### Element vs Component

|                 | Element                                | Component                                       |
| --------------- | -------------------------------------- | ----------------------------------------------- |
| **What it is**  | Plain object describing what to render | Reusable function that returns elements         |
| **Logic/State** | ❌ Cannot contain                      | ✅ Can contain                                  |
| **Example**     | `<h1>Hello World</h1>`                 | `function Welcome() { return <h1>Hello</h1>; }` |

---

### Pure Components

A **pure component** renders the same output for the same props and state. In functional components, use `React.memo()` to achieve this.

```jsx
const User = React.memo(({ name }) => {
  console.log("Rendered");
  return <h1>{name}</h1>;
});
```

- Performs **shallow comparison** of previous and new props/state.
- Skips unnecessary re-renders if props haven't changed.
- Best for: product lists, tables, dashboards, charts where the parent re-renders frequently but the child's props rarely change.

> 📁 Code: [PureComponentsMemo](https://github.com/Vamsichowdhury/UI-Interview/tree/main/src/components/PureComponentsMemo)

### Shallow vs Deep Comparison

- **Shallow** — Compares first-level object references, not values.
- **Deep** — Compares all levels and actual values.

> 📁 Code: [shallow-deep-comparison.js](https://github.com/Vamsichowdhury/UI-Interview/blob/main/js/shallow-deep-comparison.js)

---

### Higher-Order Component (HOC)

A **HOC** is a function that takes a component as input and returns a new, enhanced component. Used to reuse logic across multiple components.

```jsx
function withLogger(WrappedComponent) {
  return function LoggedComponent(props) {
    console.log("Rendering:", WrappedComponent.name);
    return <WrappedComponent {...props} />;
  };
}
```

---

### Fragments

Fragments wrap multiple children without adding an extra DOM node.

```jsx
// Full syntax
<Fragment>
  <Child1 />
  <Child2 />
</Fragment>

// Short syntax
<>
  <Child1 />
  <Child2 />
</>
```

**Benefits:** Faster, less memory usage, cleaner DOM inspector output.

---

## Props & State

### Props

- Pass data **from parent → child** .
- **Read-only (immutable)** — never modify directly.
- Make components dynamic and reusable.

### State

- A component's **internal, mutable data** .
- Managed inside the component.
- Updating state via setter functions triggers a **re-render** .

### Props vs State

|                          | State            | Props             |
| ------------------------ | ---------------- | ----------------- |
| **Managed by**           | Inside component | Parent component  |
| **Mutable?**             | ✅ Yes           | ❌ No (read-only) |
| **Updated via**          | Setter functions | Parent re-render  |
| **Re-render on change?** | ✅ Yes           | ✅ Yes            |

---

### State Batching

React batches multiple state updates into a **single re-render** for better performance.

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1); // → setCount(1)
  setCount(count + 1); // → setCount(1) — same snapshot!
};
// ✅ Output: 1, NOT 2
```

**Why?** `count` is a snapshot — both calls see `count = 0`. React schedules updates asynchronously.

**Fix — use the functional updater form:**

```jsx
setCount((prev) => prev + 1); // uses latest queued state
setCount((prev) => prev + 1);
// ✅ Output: 2
```

---

### Updating Objects in State

Never mutate state directly — always create a new copy:

```jsx
const [user, setUser] = useState({ name: "Vamsi", age: 25 });

// ✅ Correct
setUser({ ...user, age: 26 });
```

### Updating Arrays in State

```jsx
// ❌ Wrong — mutates state
users.push(newUser);

// ✅ Add item
setUsers([...users, newUser]);

// ✅ Remove item
setUsers(users.filter((user) => user.id !== id));
```

---

### Keys in Lists

A `key` is a special prop that helps React identify which items in a list changed, were added, or removed.

```jsx
items.map((item) => <Item key={item.id} {...item} />);
```

**Why not use index as key?**

When items are reordered, sorted, or inserted, indices shift. React sees the same key at a different position, assumes it's the same element, and keeps stale state (e.g., an input field retains its old value).

**Index as key is only safe when:**

- The list is static
- Items are never reordered
- Items are never inserted or removed

---

## Event Handling

### React vs HTML Event Handling

|                     | React                    | HTML                  |
| ------------------- | ------------------------ | --------------------- |
| **Event name**      | camelCase (`onClick`)    | lowercase (`onclick`) |
| **Handler type**    | Function reference       | String                |
| **Prevent default** | `event.preventDefault()` | `return false`        |

```jsx
// HTML
<button onclick="handleClick()">Click</button>

// React
<button onClick={handleClick}>Click</button>

// Prevent default — HTML
<a href="https://google.com" onclick="return false;">Link</a>

// Prevent default — React
<a href="https://google.com" onClick={(e) => e.preventDefault()}>Link</a>
```

---

## Virtual DOM & Reconciliation

### Virtual DOM

A **lightweight copy of the Real DOM** maintained by React in memory. When state or props change:

```
State Change → New Virtual DOM → Diffing → Reconciliation → Real DOM Update
```

### Diffing

The process of **comparing** the previous Virtual DOM tree with the new one to identify what changed.

### Reconciliation

The process of **applying** the identified changes to the Real DOM.

### Is Virtual DOM faster than Real DOM?

Repeatedly manipulating the Virtual DOM is faster than repeatedly manipulating the Real DOM. React improves performance by **minimizing the number of Real DOM updates** , not by making DOM manipulation itself faster.

---

## Refs

### What is a Ref?

A `ref` is a React object (created via `useRef`) that provides **direct access to a DOM element** or stores **mutable values** across renders.

- Updating `ref.current` does **not** trigger a re-render.
- React does **not** track changes to refs.

### Common Use Cases

1. Focusing inputs, scrolling, measuring DOM nodes
2. Storing values that persist between renders without triggering re-renders (timers, flags, previous values)

```jsx
import { useRef, useEffect } from "react";

export default function SignUpForm() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input type="email" ref={inputRef} />;
}
```

> 📁 Code: [refs](https://github.com/Vamsichowdhury/UI-Interview/tree/main/src/components/refs)

### State vs Ref

|                   | State           | Ref                         |
| ----------------- | --------------- | --------------------------- |
| **Re-renders**    | ✅ Yes          | ❌ No                       |
| **Used for**      | UI data         | DOM access / mutable values |
| **Update method** | Setter function | `.current`property          |
| **React tracks**  | ✅ Yes          | ❌ No                       |

---

### forwardRef

`forwardRef` allows a **parent to pass a ref into a child** component to directly access the child's DOM element. Normally, refs cannot be attached to custom components.

```jsx
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// Parent
const inputRef = useRef(null);
<Input ref={inputRef} />;
inputRef.current.focus(); // ✅ works
```

### useRef vs createRef

|             | `useRef`                 | `createRef`             |
| ----------- | ------------------------ | ----------------------- |
| **Returns** | Same object every render | New object every render |
| **Use in**  | Function components ✅   | Class components        |

```jsx
const ref = createRef(); // ❌ New object every render in function components
const ref = useRef(null); // ✅ Stable across renders
```

---

## Context & Prop Drilling

### Prop Drilling

Passing props through intermediate components that don't need the data — just to get it to a deeply nested child.

### Context

Solves prop drilling by storing data in a **central location** and making it available to any component in the tree.

**Three steps:**

1. **Create** the context: `const ThemeContext = createContext()`
2. **Provide** it: `<ThemeContext.Provider value={...}>`
3. **Consume** it: `const theme = useContext(ThemeContext)`

**Common use cases:** theme, auth user, user settings, language/locale, app config.

> 📁 Code: [UseContextPracticeV2](https://github.com/Vamsichowdhury/UI-Interview/tree/main/src/components/UseContextPracticeV2)

---

## Rendering: CSR vs SSR

### Client-Side Rendering (CSR)

Browser downloads a minimal HTML shell, then JavaScript fetches data and builds the UI.

**Use CSR when:**

- Highly interactive apps — dashboards, editors, SaaS tools (Figma, Notion)
- Authenticated-only pages (no SEO needed)
- Real-time UIs — stock tickers, chat apps, live feeds
- Fast subsequent navigation matters more than first load

**Trade-offs:** Slower Time to First Meaningful Paint, poor SEO out of the box, heavier client burden.

---

### Server-Side Rendering (SSR)

The server fetches data and renders full HTML per request, sending a complete page to the browser.

**Use SSR when:**

- SEO is critical — blogs, e-commerce, news sites, landing pages
- Fast initial load matters for content-heavy pages
- Personalized but public content (e.g., product page with user-specific pricing)
- Social sharing / Open Graph meta tags needed

**Trade-offs:** Server bears rendering load on every request, slightly slower page navigation, more infrastructure complexity.

---

### Quick Mental Model

```
"Will a search engine or user on a slow connection see this first?" → SSR / SSG
"Is this behind a login or highly interactive?"                    → CSR
```

---

## Hooks Overview

### What are Hooks?

Hooks are **special React functions** that let functional components use React features like state, lifecycle methods, context, and refs — without class components.

### Rules of Hooks

1. **Only call Hooks at the top level** — never inside loops, conditions, or nested functions.
2. **Only call Hooks from React function components** or other custom Hooks.

> React tracks hooks by their **call order** . Changing order between renders breaks things.

### Can Hooks be used in class components?

❌ No. Hooks are for function components only.

### Most Commonly Used Hooks

| Hook          | Purpose                                   |
| ------------- | ----------------------------------------- |
| `useState`    | Manage state                              |
| `useEffect`   | Handle side effects                       |
| `useRef`      | Access DOM elements, store mutable values |
| `useContext`  | Consume context values                    |
| `useMemo`     | Memoize expensive computations            |
| `useCallback` | Memoize function references               |
| `useReducer`  | Manage complex state                      |

---

## useState

### What is useState?

A Hook that allows functional components to manage local state. Returns a tuple of `[value, setter]`.

```jsx
const [count, setCount] = useState(0);
```

### Key Rules

- State updates are **asynchronous** — React batches them.
- **Never mutate state directly** — React detects changes by reference. Same reference = no re-render.
- Use functional updater `prev => prev + 1` when next state depends on previous state.

### Lazy Initialization

When the initial state is expensive to compute, pass a **function** — React only runs it on the first render:

```jsx
// ❌ Runs on every render
const [data, setData] = useState(JSON.parse(localStorage.getItem("data")));

// ✅ Runs only once
const [data, setData] = useState(() =>
  JSON.parse(localStorage.getItem("data")),
);
```

### State vs Ref vs Variable

|                             | State | Ref | Variable |
| --------------------------- | ----- | --- | -------- |
| **Triggers re-render**      | ✅    | ❌  | ❌       |
| **Persists across renders** | ✅    | ✅  | ❌       |
| **React tracks**            | ✅    | ❌  | ❌       |

### useState vs useReducer

Use `useReducer` when:

- Complex state logic
- Multiple related state updates
- State transitions depend on named actions

---

## useEffect

### What is useEffect?

A Hook for performing **side effects** in functional components — things that happen outside the rendering process.

**Examples:** API calls, event listeners, timers, updating document title, localStorage access, WebSocket connections.

### Syntax

```jsx
useEffect(() => {
  // side effect

  return () => {
    // cleanup (runs on unmount or before next effect)
  };
}, [dependencies]);
```

### When Does It Run?

| Form                   | When it runs                     |
| ---------------------- | -------------------------------- |
| `useEffect(fn)`        | After**every**render             |
| `useEffect(fn, [])`    | Once on**mount**only             |
| `useEffect(fn, [dep])` | On mount + whenever `dep`changes |

---

### Cleanup Function

Returned from `useEffect` to clean up subscriptions, timers, or listeners.

- Called **before the component unmounts**
- Called **before the effect re-runs** (if deps changed)

```jsx
useEffect(() => {
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler); // ✅ cleanup
}, []);
```

---

### Data Fetching & Race Conditions

```jsx
// ❌ Basic fetch — no cleanup, possible race condition
useEffect(() => {
  fetch(`/api/user/${id}`)
    .then((r) => r.json())
    .then((data) => setUser(data));
}, [id]);
```

**Fix with AbortController:**

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/user/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then((data) => setUser(data))
    .catch((err) => {
      if (err.name === "AbortError") return; // ignore intentional cancel
      setError(err);
    });

  return () => controller.abort(); // ✅ cancels on unmount or id change
}, [id]);
```

> 📁 Code: [AbortControllerExample](https://github.com/Vamsichowdhury/UI-Interview/blob/main/src/components/Abort-controller-example/AbortControllerExample.jsx)

---

### Why Can't useEffect Be Async?

`async` functions return a **Promise** , but React expects `useEffect` to return either `undefined` or a cleanup function.

```jsx
// ❌ WRONG — returns a Promise, not a cleanup
useEffect(async () => {
  const data = await fetchData();
  setData(data);
}, []);

// ✅ CORRECT — define async function inside
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data);
  }
  load();
}, []);
```

---

### Stale Closures

A stale closure happens when `useEffect` captures a variable's value at creation time, but the value has since changed and the effect doesn't know.

```jsx
// ❌ Stale closure — count is always 0
useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // stale!
  }, 1000);
  return () => clearInterval(id);
}, []); // count not in deps

// ✅ Fix — use functional updater
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1); // no stale read
  }, 1000);
  return () => clearInterval(id);
}, []);
```

---

### Infinite Loop Scenarios

**Functions in deps cause infinite re-renders:**

```jsx
// ❌ fetchData is a new reference every render → infinite loop
function fetchData() { ... }
useEffect(() => { fetchData(); }, [fetchData]);

// ✅ Fix with useCallback
const fetchData = useCallback(() => { ... }, []);
useEffect(() => { fetchData(); }, [fetchData]);
```

**Objects/arrays in deps:**

```jsx
// ❌ New object reference every render
const filters = { status: "active" };
useEffect(() => {
  fetchData();
}, [filters]);

// ✅ Fix 1: useMemo for stable reference
const filters = useMemo(() => ({ status: "active" }), []);

// ✅ Fix 2: depend on primitive values
useEffect(() => {
  fetchData();
}, [filters.status]);
```

---

### useEffect vs useLayoutEffect

| Hook              | When it fires                     | Use for                                     |
| ----------------- | --------------------------------- | ------------------------------------------- |
| `useEffect`       | After browser**paints**           | Data fetching, subscriptions, logging       |
| `useLayoutEffect` | After DOM update,**before paint** | DOM measurements, preventing visual flicker |

```jsx
// Prevents "flash" of wrong position
useLayoutEffect(() => {
  const height = ref.current.getBoundingClientRect().height;
  setTooltipPos(height);
}, []);
```

---

### Debouncing in useEffect

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    searchAPI(query); // fires 400ms after user stops typing
  }, 400);

  return () => clearTimeout(timer); // ✅ cancels previous timer on each keystroke
}, [query]);
```

---

### WebSocket in useEffect

```jsx
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/live");

  ws.onmessage = (event) => {
    setMessages((prev) => [...prev, JSON.parse(event.data)]);
  };

  return () => ws.close(); // ✅ close connection on unmount
}, []);
```

---

### Multiple useEffects

✅ Yes, you can and should use multiple `useEffect` hooks — one per concern.

**Benefits:** Readability, maintainability, separation of concerns.

---

## useRef

### What is useRef?

Returns a **stable, mutable object** `{ current: initialValue }` that persists across renders. Updating `.current` does NOT trigger a re-render.

### Two Main Use Cases

1. **Accessing DOM elements directly** (focus, scroll, measure)
2. **Storing mutable values** that persist across renders without triggering re-renders (timers, previous values, flags)

### Safe Reading/Writing

```jsx
// ❌ Writing during render — unsafe in concurrent mode
function Component() {
  ref.current = value; // dangerous
}

// ✅ Write in effect or event handler
useEffect(() => {
  ref.current = value; // safe — after commit
});
```

---

## useMemo

### What is useMemo?

Memoizes the **result of an expensive computation** . Only recomputes when dependencies change.

```jsx
const result = useMemo(() => {
  return expensiveComputation(a, b); // only re-runs when a or b changes
}, [a, b]);
```

> ⚠️ Common mistake: `useMemo(fn(), deps)` calls `fn` immediately. Always wrap in an arrow function: `useMemo(() => fn(), deps)`.

> 📁 Code: [UseMemoExample](https://github.com/Vamsichowdhury/UI-Interview/blob/main/src/components/use-memo/UseMemoExample.jsx)

---

### When to Use useMemo

✅ **Good use cases:**

- Large data transformations (sorting, filtering big arrays)
- Object/array used in another hook's dependency array (for referential stability)

```jsx
// ✅ Large data sort
const sorted = useMemo(
  () => [...items].sort((a, b) => b.score - a.score),
  [items],
);

// ✅ Stable dep for useEffect
const options = useMemo(() => ({ page, size }), [page, size]);
useEffect(() => {
  fetchData(options);
}, [options]);
```

❌ **Don't use for:**

```jsx
// ❌ Trivial computation — overhead > benefit
const double = useMemo(() => count * 2, [count]);
```

---

### useMemo + React.memo

`React.memo` does shallow prop comparison. Passing a new object/array breaks it — `useMemo` stabilizes the reference.

```jsx
const Child = React.memo(({ filters }) => {
  /* renders */
});

// ❌ New object every render — React.memo does nothing
function Parent() {
  return <Child filters={{ active: true }} />;
}

// ✅ Stable reference — React.memo works correctly
function Parent() {
  const filters = useMemo(() => ({ active: true }), []);
  return <Child filters={filters} />;
}
```

---

### Stale Deps in useMemo

Forgetting a dep means the function captures a **stale value** — a silent bug.

```jsx
// ❌ tax missing — total never updates when tax changes
const total = useMemo(() => price * (1 + tax), [price]);

// ✅ Both deps listed
const total = useMemo(() => price * (1 + tax), [price, tax]);
```

---

### Does useMemo Guarantee the Value is Kept?

**No.** React may discard the cache under memory pressure. It's a performance **hint** , not a semantic guarantee.

```jsx
// ❌ Don't rely on it being called exactly once
const cachedToken = useMemo(() => generateToken(), [userId]);

// ✅ Use useRef for values that must be truly stable
const tokenRef = useRef(null);
if (!tokenRef.current) tokenRef.current = generateToken();
```

---

## useCallback

### What is useCallback?

Memoizes a **function reference** . Returns the same function instance between renders as long as deps haven't changed.

```jsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]); // stable reference as long as id doesn't change
```

> 📁 Code: [use-callback](https://github.com/Vamsichowdhury/UI-Interview/tree/main/src/components/use-callback)

---

### When to Use useCallback

✅ **Three legitimate cases:**

```jsx
// Case 1: Stable prop for React.memo child
const handleDelete = useCallback((id) => deleteItem(id), []);
<MemoizedList onDelete={handleDelete} />;

// Case 2: Function in useEffect dep array
const fetchData = useCallback(() => {
  fetch(`/api/${userId}`);
}, [userId]);
useEffect(() => {
  fetchData();
}, [fetchData]);

// Case 3: Stable ref for native listeners / third-party libs
```

❌ **Don't use when:**

```jsx
// Child is not memoized — useCallback is wasted
const fn = useCallback(() => {}, []);
<RegularChild onClick={fn} /> // re-renders anyway

// DOM elements don't care about referential stability
<div onClick={fn}>click</div>
```

---

### Pitfalls of useCallback

```jsx
// ❌ Over-wrapping trivial handlers
const handleChange = useCallback((e) => setVal(e.target.value), []);

// ❌ Stale closure — data missing from deps
const handleSave = useCallback(() => save(data), []); // should be [data]

// ❌ Child not memoized — useCallback wasted
const fn = useCallback(() => {}, []);
<UnmemoizedChild onClick={fn} />;
```

---

### useMemo vs useCallback

|                 | `useMemo`              | `useCallback`             |
| --------------- | ---------------------- | ------------------------- |
| **Returns**     | Memoized**value**      | Memoized**function**      |
| **When to use** | Cache computed results | Cache function references |
| **Equivalent**  | —                      | `useMemo(() => fn, deps)` |

```jsx
// These are identical:
const fn1 = useCallback(() => doWork(a), [a]);
const fn2 = useMemo(() => () => doWork(a), [a]);
```

---

### Decision Flowchart

```
Is the computation expensive or is the object/array used in a dep array?
  → YES → useMemo

Is the function passed to a React.memo child or used in a hook dep array?
  → YES → useCallback

Neither?
  → Skip it — keep the code simple
```

---

### The Full Trinity: React.memo + useMemo + useCallback

```jsx
const Chart = React.memo(({ data, onHover }) => <div />);

function Dashboard({ rawData, userId }) {
  // Stable object prop
  const chartData = useMemo(() => transformData(rawData), [rawData]);

  // Stable function prop
  const handleHover = useCallback((point) => logHover(userId, point), [userId]);

  // Chart only re-renders when rawData or userId changes
  return <Chart data={chartData} onHover={handleHover} />;
}
```

---

## Custom Hooks

### What is a Custom Hook?

A JavaScript function whose name starts with `use` that internally calls other React hooks. Extracts stateful logic so it can be **reused across components** without changing the component hierarchy.

**Create one when:**

- The same hook logic appears in 2+ components
- A component's hook logic is complex enough to warrant its own file

### Rules

Same as built-in hooks (the `use` prefix makes ESLint enforce them automatically):

1. Only call at the top level
2. Only call from React functions or other custom hooks

### Do Two Components Share State via a Custom Hook?

**No.** Each component gets its **own isolated state and effects** . The hook shares _logic_ , not _state_ .

### What Can a Custom Hook Return?

- **Array** — when there are exactly 2 values and the caller may want to rename them:
  ```jsx
  const [value, setValue] = useToggle(false);
  ```
- **Object** — when there are 3+ values or named clarity matters (preferred for scalability):
  ```jsx
  const { data, loading, error } = useFetch(url);
  ```

### Custom Hook vs Utility Function

|                         | Custom Hook       | Utility Function |
| ----------------------- | ----------------- | ---------------- |
| **Can use React hooks** | ✅ Yes            | ❌ No            |
| **Tied to lifecycle**   | ✅ Yes            | ❌ No            |
| **Name convention**     | Starts with `use` | Any name         |

### Cleanup in Custom Hooks

Return a cleanup function from `useEffect` inside the hook — exactly the same pattern as in components:

```jsx
function useWindowResize(callback) {
  useEffect(() => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback); // ✅ cleanup
  }, [callback]);
}
```

---

_Last updated: June 2026_
