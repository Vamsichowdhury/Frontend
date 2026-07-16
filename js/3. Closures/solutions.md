# 3. Closures

---

### 19. What is a closure in JavaScript?

<details>
<summary><b>Click to expand answer</b></summary>

A **closure** is formed when a function "remembers" the variables from the scope in which it was defined, even after that outer scope has finished executing.

In simpler words: a function + the lexical environment (variables) it was born into = closure.

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
JavaScript uses **lexical scoping** — a function's access to variables is determined by _where it is written in the code_, not where/when it is called. When `inner` is created inside `outer`, it gets a permanent link to `outer`'s variable environment. That link doesn't disappear just because `outer` returned.

**Mental model:** Think of the outer function's variables as living in a backpack. Every function created inside carries that backpack with it wherever it goes, even after the "parent" is gone.

**Interview one-liner:**

> "A closure is a function bundled together with references to its surrounding state (lexical environment). It lets an inner function access variables from an outer function's scope even after the outer function has returned."

</details>

---

### 20. Why do closures still hold references after the outer function has returned?

<details>
<summary><b>Click to expand answer</b></summary>

Normally you'd expect `message` in the example above to be destroyed once `outer()` finishes — that's how it works in many other languages (stack-based memory gets popped).

But JavaScript's engine (V8, etc.) doesn't destroy a variable if there's still a **reference** to it. Here's the chain of reasoning:

1. When `outer()` runs, it creates a new **execution context**, which has its own variable environment (where `message` lives).
2. `inner` is defined inside that environment, so `inner` gets an internal, hidden link to it — this is called `[[Environment]]` in the spec.
3. Normally, when `outer()` finishes, its execution context would be popped off the call stack and garbage collected.
4. **But** `inner` (the returned function) still holds that `[[Environment]]` reference. As long as `inner` is reachable (assigned to `greet`, in our example), the garbage collector cannot free the memory it depends on.
5. So the variable environment survives — not because JS treats it specially, but because **something still points to it**.

**Key insight:** It's not really "the function returned but memory stuck around anyway" — it's that the closure keeps that memory _alive on purpose_, via reference counting / reachability, exactly like any other object reference in JS.

**Analogy:** Imagine a house (the outer function's scope) that's scheduled for demolition once everyone moves out. But if one person (the inner function) still has the house keys and can walk back in anytime, demolition is put on hold. The keys are the closure reference.

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
// Logs: 3, 3, 3   (not 0, 1, 2 as most people expect)
```

**Why it happens:**

- `var` is **function-scoped**, not block-scoped. There is only **one single `i`** for the entire loop — it lives in the enclosing function (or global) scope.
- All three arrow functions passed to `setTimeout` close over the _same_ `i` variable, not a snapshot of its value at that iteration.
- By the time the callbacks actually run (after 100ms, once the loop has already fully finished), `i` has already been incremented to `3` (the value that failed the loop condition).
- So all three closures read the same, final value: `3`.

**The fix with `let`:**

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 0, 1, 2
```

- `let` is **block-scoped**. Crucially, the spec says the `for` loop creates a **fresh binding of `i` for every single iteration** — not one shared variable, but a brand-new `i` each time round, copying forward the previous value.
- So each arrow function closes over _its own separate_ `i`, frozen at the value it had during that particular iteration.

**Pre-`let` fix (still worth knowing for interviews):**
Wrap the loop body in an IIFE to manually create a new scope per iteration:

```js
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
```

Here `j` is a fresh parameter/local variable in every IIFE call, so each closure captures its own copy.

**Interview soundbite:**

> "`var` closures in a loop capture the _variable_, not the value. Since `var` has function scope, there's only one variable shared across all iterations. `let` creates a new binding per iteration, so each closure captures a distinct value."

</details>

---

### 22. What are practical use cases of closures (e.g., data privacy, memoization)?

<details>
<summary><b>Click to expand answer</b></summary>

Closures aren't just a theory question — they power a lot of everyday patterns.

**1. Data privacy / encapsulation (the "module pattern")**

```js
function createCounter() {
  let count = 0; // private — no way to access this directly from outside

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
console.log(counter.count); // undefined — truly private
```

`count` can only be touched through the returned methods. This is how JS simulated private variables before the `#privateField` syntax existed, and it's still widely used (e.g., inside custom hooks, factory functions).

**2. Memoization / caching**

```js
function memoize(fn) {
  const cache = new Map(); // captured by the closure below

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const slowSquare = (n) => {
  for (let i = 0; i < 1e8; i++) {}
  return n * n;
};
const fastSquare = memoize(slowSquare);
fastSquare(5); // slow the first time
fastSquare(5); // instant — pulled from cache
```

The `cache` variable stays alive across every call because the returned function closes over it.

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

Each returned function remembers its own `x`.

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

**5. React hooks (very relevant to your stack)**
Custom hooks like `useState`, `useRef`, `useCallback` all rely on closures — the function returned by a hook "remembers" the state/refs from the render it was created in. This is also _why_ stale closures happen in `useEffect` when dependencies are missed.

**6. `once`-style functions (run only one time)**

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

</details>

---

### 23. How can closures cause memory leaks?

<details>
<summary><b>Click to expand answer</b></summary>

Closures keep variables alive as long as the closure itself is reachable. That's usually desirable — but it becomes a **memory leak** when:

**1. Closures unintentionally retain large objects**

```js
function setup() {
  const hugeArray = new Array(1000000).fill("data"); // large data
  const smallValue = 1;

  return function () {
    console.log(smallValue); // only needs smallValue...
    // ...but if hugeArray is referenced ANYWHERE in this function
    // (even in unreachable/dead code in some engines), it can be kept alive too
  };
}
```

Even if you only need one small variable, if the closure's code references (or in some engine implementations, shares a scope with) a large variable, that large variable may not get garbage collected.

**2. Event listeners not cleaned up**

```js
function attachHandler() {
  const largeData = fetchLotsOfData();

  window.addEventListener("resize", function handler() {
    console.log(largeData.length); // closure keeps largeData alive
  });
  // if you never call removeEventListener, `largeData`
  // stays in memory for the lifetime of the page
}
```

Since `window` holds a reference to `handler`, and `handler` closes over `largeData`, that data can never be garbage collected — even if `attachHandler` is long done and you no longer need the data. This is a very common real-world leak in single-page apps.

**3. Timers that are never cleared**

```js
function startPolling() {
  const state = { data: [] };
  const intervalId = setInterval(() => {
    state.data.push(fetchSomething()); // grows forever, never released
  }, 1000);
}
```

If `clearInterval(intervalId)` is never called, the closure (and everything it references) lives forever, and `state.data` keeps growing.

**4. Closures inside loops holding onto DOM nodes / large collections**
Similar to the event listener case — if closures capture references to DOM elements that are otherwise removed from the page, those DOM nodes can't be garbage collected because JS still holds a reference to them via the closure.

**How to avoid these leaks:**

- Always pair `addEventListener` with `removeEventListener` when the listener is no longer needed (e.g., in React's `useEffect` cleanup function).
- Always pair `setInterval`/`setTimeout` with `clearInterval`/`clearTimeout`.
- Avoid capturing more than you need — extract only the specific value you actually use instead of an entire large object, when possible.
- Be mindful in React: closures over stale state/props in `useEffect`/`useCallback` are less about literal memory leaks and more about _stale data bugs_, but unremoved subscriptions/listeners are the real memory-leak risk.

**Interview soundbite:**

> "Closures don't leak memory by themselves — they leak when a closure is kept alive longer than necessary (e.g., via an uncleaned event listener or timer) and that closure references large data. The fix is always the same: clean up what you no longer need — remove listeners, clear timers, and avoid over-capturing variables."

</details>

---
