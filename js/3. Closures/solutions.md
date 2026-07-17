# 3. Closures

---

### 19. What is a closure in JavaScript?

<details>
<summary><b>Click to expand answer</b></summary>

A **closure** is formed when a function "remembers" the variables from the scope in which it was defined, even after that outer scope has finished executing.

In simple words: a function + the variables it was born next to = closure. It's like the function carries a backpack of variables with it wherever it goes.

```js
function outer() {
  const message = "Hello";

  function inner() {
    console.log(message); // inner "closes over" message
  }

  return inner;
}

const greet = outer(); // outer() has already finished running
greet(); // "Hello" — inner still remembers `message`
```

**Why does this happen?**
JavaScript uses **lexical scoping** — a function's access to variables is decided by _where it is written in the code_, not where/when it is called. When `inner` is created inside `outer`, it gets a permanent link to `outer`'s variables. That link doesn't disappear just because `outer` has returned.

**Interview soundbite:**

> "A closure is a function bundled together with references to its surrounding state (lexical environment). It lets an inner function access variables from an outer function's scope even after the outer function has returned."

</details>

---

### 20. Why do closures still hold references after the outer function has returned?

<details>
<summary><b>Click to expand answer</b></summary>

Normally you'd expect `message` in the example above to be destroyed once `outer()` finishes — that's how memory works in many languages (a function's local variables live on a stack, and get popped/cleared when it returns).

But JavaScript doesn't destroy a variable if there's still a **reference** to it. Here's the reasoning, step by step:

1. When `outer()` runs, it creates its own private space to hold its variables — this is called a **variable environment**.
2. `inner` is defined inside that space, so `inner` gets an internal, hidden link to it (called `[[Environment]]` in the spec).
3. Normally, once `outer()` finishes, its variable environment would be cleaned up by the garbage collector.
4. **But** `inner` (the function we returned and stored in `greet`) still holds that link. As long as `inner` is reachable, the garbage collector can't free the memory it depends on.
5. So the variable environment survives — not because JS treats it specially, but because **something is still holding onto it**, exactly like any other object reference.

**Analogy:** Imagine a house (the outer function's scope) that's scheduled for demolition once everyone moves out. But if one person (the inner function) still has the house keys and can walk back in anytime, demolition is put on hold. The keys are the closure's hidden reference.

**Interview soundbite:**

> "Closures don't get special treatment — JavaScript's garbage collector simply can't clean up memory that's still reachable. Since the returned inner function holds a reference to the outer function's scope, that scope stays alive as long as the inner function does."

</details>

---

### 21. Why does the classic `var` in a loop closure bug happen, and how does `let` fix it?

<details>
<summary><b>Click to expand answer</b></summary>

**The classic bug:**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 3, 3, 3   (most people expect 0, 1, 2)
```

**Why it happens:**

- `var` is **function-scoped**, not block-scoped. That means there is only **one single `i`** for the entire loop — it lives in the enclosing function (or global) scope, not freshly created per iteration.
- All three arrow functions passed to `setTimeout` close over that _same_ `i` variable, not a snapshot of its value at that point in time.
- By the time the callbacks actually run (100ms later, after the loop has already fully finished), `i` has already been incremented all the way to `3` (the value that failed the loop condition and stopped the loop).
- So all three closures look up the same variable and all see the same final value: `3`.

**The fix with `let`:**

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 0, 1, 2
```

- `let` is **block-scoped**. Crucially, the spec makes the `for` loop create a **brand-new `i` for every single iteration** — not one shared variable reused each time, but a fresh copy carried forward from the previous value.
- So each arrow function closes over _its own separate_ `i`, frozen at the value it had during that specific iteration.

**Pre-`let` fix (still worth knowing, comes up in interviews):**
Wrap the loop body in an IIFE (Immediately Invoked Function Expression) to manually create a new scope per iteration:

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Logs: 0, 1, 2
```

Here, `j` is a fresh parameter in every IIFE call, so each closure captures its own private copy instead of sharing one `i`.

**Interview soundbite:**

> "`var` closures in a loop capture the _variable itself_, not the value at that moment. Since `var` is function-scoped, there's only one shared `i` across all iterations, so every callback reads whatever `i` ended up being. `let` creates a new binding per iteration, so each closure captures its own distinct value."

</details>

---

### 22. What are practical use cases of closures (e.g., data privacy, memoization)?

<details>
<summary><b>Click to expand answer</b></summary>

Closures aren't just a theory question — they quietly power a lot of everyday patterns you already use.

**1. Data privacy / encapsulation ("module pattern")**

```js
function createCounter() {
  let count = 0; // private — no way to reach this from outside directly

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getValue() {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.count); // undefined — truly private, only accessible via the methods
```

`count` can only be touched through the returned methods. This is how JS simulated private variables before the `#privateField` syntax existed, and it's still a common factory-function pattern today.

**2. Memoization / caching**

```js
function memoize(fn) {
  const cache = new Map(); // stays alive across calls because of the closure below

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

The `cache` variable persists across every call because the returned function keeps a closure over it — nothing else can reach or reset it from outside.

**3. Function factories / currying**

```js
function multiplyBy(x) {
  return function (y) {
    return x * y;
  };
}
const double = multiplyBy(2);
const triple = multiplyBy(3);
double(5); // 10
triple(5); // 15
```

Each returned function remembers its own `x`, captured at the time it was created.

**4. Event handlers & callbacks that need context**

```js
function setupButton(label) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", () => {
    console.log(`${label} was clicked`); // closes over `label`
  });
  return button;
}
```

**5. React hooks (directly relevant to your stack)**
Custom hooks like `useState`, `useRef`, and `useCallback` all rely on closures — the function returned from a hook "remembers" the state/refs that existed in the render it was created in. This is also exactly _why_ stale closures happen in `useEffect` when a dependency is missed from the dependency array — the effect closes over an old value and never sees the updated one.

**6. `once`-style functions (run only one time, ever)**

```js
function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
}
```

`called` and `result` are private state, kept alive only for this particular returned function.

**Interview soundbite:**

> "Closures let a function carry private, persistent state with it. That's the basis for data-hiding patterns, memoized caches, currying/function factories, and event handlers that need to remember context — and it's exactly the mechanism React hooks rely on to preserve state and values across renders."

</details>

---

### 23. How can closures cause memory leaks?

<details>
<summary><b>Click to expand answer</b></summary>

Closures keep variables alive for as long as the closure itself is reachable. That's usually exactly what you want — but it turns into a **memory leak** when a closure is kept around longer than necessary while holding onto something large or expensive.

**1. Event listeners that are never cleaned up**

```js
function attachHandler() {
  const largeData = fetchLotsOfData(); // big chunk of data

  window.addEventListener("resize", function handler() {
    console.log(largeData.length); // closure keeps largeData alive
  });
  // if removeEventListener is never called, `largeData` stays in memory
  // for the entire lifetime of the page
}
```

Since `window` holds a reference to `handler`, and `handler` closes over `largeData`, that data can never be garbage collected — even long after `attachHandler` has finished running and the data is no longer needed. This is one of the most common real-world leaks in single-page apps.

**2. Timers that are never cleared**

```js
function startPolling() {
  const state = { data: [] };
  const intervalId = setInterval(() => {
    state.data.push(fetchSomething()); // grows forever, never released
  }, 1000);
}
```

If `clearInterval(intervalId)` is never called, the closure — and everything it references, including the ever-growing `state.data` array — lives forever.

**3. Closures unintentionally retaining large objects**

```js
function setup() {
  const hugeArray = new Array(1000000).fill("data"); // large, unused later
  const smallValue = 1;

  return function () {
    console.log(smallValue); // only needs smallValue...
    // ...but depending on how the code/engine handles it, keeping hugeArray
    // referenced anywhere nearby can prevent it from being freed
  };
}
```

Even if the returned function only actually needs one small variable, sharing scope with a much larger variable can keep that larger variable alive longer than necessary.

**4. Closures capturing DOM nodes that have been removed from the page**
If a closure holds a reference to a DOM element (e.g., through an event listener), and that element is later removed from the page but the listener is never cleaned up, the DOM node can't be garbage collected — JS still holds a live reference to it via the closure, even though it's no longer visible or usable on screen.

**How to avoid these leaks:**

- Always pair `addEventListener` with `removeEventListener` when a listener is no longer needed — in React, this means returning a cleanup function from `useEffect`.
- Always pair `setInterval`/`setTimeout` with `clearInterval`/`clearTimeout`.
- Avoid capturing more than you actually need — extract just the specific value you use, instead of an entire large object, when possible.

**Interview soundbite:**

> "Closures don't leak memory on their own — they leak when a closure is kept alive longer than necessary, usually via an event listener or timer that's never cleaned up, and that closure happens to reference large or expensive data. The fix is always the same: clean up what you no longer need."

</details>

---
