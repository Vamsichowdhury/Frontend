# 4. Functions & Higher-Order Functions

---

### 24. What is a first-class function, and what is a higher-order function?

<details>
<summary><b>Click to expand answer</b></summary>

**First-class function** means functions in JavaScript are treated like **any other value** — a string, a number, an object. Specifically, you can:

- Assign a function to a variable
- Store functions in arrays/objects
- Pass a function as an argument to another function
- Return a function from another function

```js
const greet = function () {
  return "hi";
}; // assigned to a variable
const fns = [greet, () => "bye"]; // stored in an array
```

This is a _property of the language_ — JS functions are "first-class citizens," same as `let x = 5`.

**Higher-order function (HOF)** is a function that **uses** this property — specifically, a function that either:

- takes another function as an argument, **or**
- returns a function

```js
// takes a function as an argument
[1, 2, 3].map((n) => n * 2);

// returns a function
function multiplyBy(x) {
  return function (y) {
    return x * y;
  };
}
```

**Simple way to remember it:**

> "First-class" describes _functions as values_. "Higher-order" describes _functions that operate on other functions_.

Every higher-order function relies on functions being first-class — you couldn't have `.map()`, `.filter()`, `.reduce()`, or `debounce()` if functions weren't treated as plain values you can pass around.

</details>

---

### 25. What is the difference between a function declaration and a function expression?

<details>
<summary><b>Click to expand answer</b></summary>

**Function declaration** — has the `function` keyword at the start of a statement, with a name:

```js
function greet() {
  return "hi";
}
```

**Function expression** — a function created as part of an expression (usually assigned to a variable):

```js
const greet = function () {
  return "hi";
};

// or with a name (named function expression)
const greet2 = function greetInner() {
  return "hi";
};
```

**Key differences:**

|                             | Function Declaration                                                                       | Function Expression                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hoisting                    | Fully hoisted — the entire function (name + body) is available before it's defined in code | Only the variable is hoisted (as `undefined` for `var`, or in TDZ for `let`/`const`) — the function itself is _not_ usable until the line executes |
| Can call before definition? | Yes                                                                                        | No (throws `TypeError: greet is not a function`, or `ReferenceError` if using `let`/`const`)                                                       |
| Needs a name?               | Required                                                                                   | Optional (can be anonymous)                                                                                                                        |

**Example of the hoisting difference:**

```js
sayHi(); // works — "Hi!"
function sayHi() {
  console.log("Hi!");
}
```

```js
sayBye(); // TypeError: sayBye is not a function
var sayBye = function () {
  console.log("Bye!");
};
```

**Why this happens:** During the "creation phase" of execution, JS scans the code and fully hoists function declarations (moves the whole function to the top of scope). For function expressions, only the _variable declaration_ gets hoisted (not its assigned value), so the function body isn't attached yet when you try to call it early.

**Interview soundbite:**

> "A function declaration is hoisted completely and can be called before it appears in the code. A function expression is just a value assigned to a variable, so it follows normal variable hoisting rules — you can only call it after the assignment line has run."

</details>

---

### 26. What are default parameters, and how do they interact with the `arguments` object?

<details>
<summary><b>Click to expand answer</b></summary>

**Default parameters** let you specify a fallback value for a function parameter if no argument (or `undefined`) is passed in.

```js
function greet(name = "Guest") {
  return `Hello, ${name}`;
}

greet(); // "Hello, Guest"
greet(undefined); // "Hello, Guest"  — undefined triggers the default
greet(null); // "Hello, null"   — null does NOT trigger the default
greet("Vamsi"); // "Hello, Vamsi"
```

**Important nuance:** Only `undefined` triggers the default. Passing `null`, `0`, `""`, or `false` will **not** use the default value — those are all valid, intentional values.

**How they interact with the `arguments` object:**

The `arguments` object is an array-like object available inside regular (non-arrow) functions, holding all arguments actually passed in.

Before ES6 default parameters existed, `arguments` used to stay **"linked"** to the named parameters (in non-strict mode without defaults) — changing one would change the other. But **once you use default parameters, this link is broken**, and `arguments` always reflects only what was _actually passed in_, not the resolved/defaulted values.

```js
function test(a = 10) {
  console.log(arguments.length); // reflects what was passed, NOT defaults applied
  a = 99;
  console.log(arguments[0]); // unaffected by reassigning `a`
}

test(); // arguments.length is 0, even though a defaults to 10
test(5); // arguments.length is 1, arguments[0] is 5
```

**Key takeaways for interviews:**

- `arguments.length` only counts what was **actually passed**, never counts defaulted-in values.
- `arguments` and named parameters are no longer "linked" in any function that uses default parameters (this is called being in **non-simple parameter list** mode).
- Arrow functions don't have `arguments` at all (see next question).

</details>

---

### 27. Why doesn't an arrow function have its own `arguments` object?

<details>
<summary><b>Click to expand answer</b></summary>

Arrow functions were designed to be **lightweight and lexically scoped** — meaning they intentionally don't have several of their own bindings that regular functions have: no own `this`, no own `arguments`, no own `super`, no own `new.target`.

Instead, when you reference `arguments` inside an arrow function, JavaScript looks **up the scope chain** to the nearest enclosing regular function and uses _its_ `arguments` object.

```js
function outer() {
  const arrow = () => {
    console.log(arguments); // this refers to outer's arguments, not its own
  };
  arrow();
}
outer(1, 2, 3); // logs [1, 2, 3]
```

If there's no enclosing regular function (e.g., arrow function at the top level), referencing `arguments` throws a `ReferenceError`:

```js
const arrow = () => console.log(arguments);
arrow(); // ReferenceError: arguments is not defined
```

**Why was it designed this way?**
Arrow functions were introduced specifically to solve the pain of `this` (and related bindings) changing unexpectedly depending on _how_ a function is called. By not having their own `this`/`arguments`, arrow functions instead **inherit these from their surrounding (lexical) scope** — making them predictable and great for callbacks where you want to preserve the outer context.

```js
// Classic use case: preserving `this` in a callback
class Timer {
  constructor() {
    this.seconds = 0;
    setInterval(() => {
      this.seconds++; // `this` correctly refers to the Timer instance
    }, 1000);
  }
}
```

If a regular `function` were used instead of an arrow function above, `this` inside `setInterval`'s callback would refer to the global object (or `undefined` in strict mode) — not the `Timer` instance.

**How to get "arguments-like" behavior in an arrow function:**
Use rest parameters instead:

```js
const sum = (...args) => args.reduce((a, b) => a + b, 0);
sum(1, 2, 3); // 6
```

`...args` is a real array (unlike `arguments`, which is only array-_like_), so you get array methods like `.map()`/`.reduce()` directly.

</details>

---

### 28. What is currying, and how does it differ from partial application?

<details>
<summary><b>Click to expand answer</b></summary>

**Currying** transforms a function that takes multiple arguments into a sequence of functions that each take **exactly one argument**.

```js
// Normal function
function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

// Curried version
function curriedAdd(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}
curriedAdd(1)(2)(3); // 6
```

With arrow functions, this is much more compact:

```js
const curriedAdd = (a) => (b) => (c) => a + b + c;
curriedAdd(1)(2)(3); // 6
```

Each function in the chain returns a new function, closing over the argument received so far — this is a direct real-world application of closures (see Section 3).

**Partial application** is different: it means fixing (pre-filling) a **few** arguments of a function upfront, producing a new function that still takes the **remaining** arguments — but not necessarily one at a time.

```js
function add3(a, b, c) {
  return a + b + c;
}

function partial(fn, ...fixedArgs) {
  return (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);
}

const addWith1And2 = partial(add3, 1, 2);
addWith1And2(3); // 6 — only one call left, but could take multiple remaining args at once
```

**Key difference:**

|                    | Currying                                               | Partial Application                                   |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| Arguments per call | Always exactly **one** at a time                       | Can be **one or many** at a time                      |
| Structure          | Chain of nested single-argument functions              | A single function with some arguments pre-filled      |
| Goal               | Break a function down into a fully unary (1-arg) chain | Reduce arity by fixing _some_ known arguments upfront |

**Why they're useful (practical relevance):**

- Currying is common in functional programming and libraries like Redux (`connect()(Component)`), or building configurable, reusable utility functions.
- Partial application is handy for creating specialized versions of general functions — e.g., a generic `fetchData(baseUrl, endpoint)` partially applied with a fixed `baseUrl` to get a reusable `fetchFromMyAPI(endpoint)`.

**Interview soundbite:**

> "Currying always breaks a function into a series of one-argument functions. Partial application just pre-fills some arguments and returns a function waiting for the rest — which can be more than one at a time. Currying is really a specific, strict form of the more general idea of partial application."

</details>

---

### 29. What is a pure function, and what are side effects?

<details>
<summary><b>Click to expand answer</b></summary>

A **pure function** is a function that satisfies two rules:

1. **Given the same input, it always returns the same output.** No randomness, no dependency on external/mutable state.
2. **It has no side effects** — it doesn't modify anything outside its own scope.

```js
// PURE
function add(a, b) {
  return a + b;
}
add(2, 3); // always 5, no matter how many times or when you call it

// IMPURE — depends on external state
let taxRate = 0.1;
function addTax(amount) {
  return amount + amount * taxRate; // relies on external `taxRate`
}

// IMPURE — has a side effect
function addToCart(cart, item) {
  cart.push(item); // mutates the array passed in
  return cart;
}
```

**A "side effect"** is any observable change that happens _outside_ the function's own local scope, as a result of calling it. Common examples:

- Mutating a variable/object/array outside the function
- Modifying function arguments (objects/arrays passed by reference)
- Logging to the console
- Making a network request (`fetch`, API calls)
- Writing to `localStorage`, a database, or a file
- DOM manipulation
- Using `Math.random()` or `Date.now()` (output depends on more than just the input)

**Why pure functions matter (why interviewers ask this):**

- **Predictability & testability** — pure functions are trivial to unit test; same input always gives the same output, no mocking needed for external state.
- **No hidden bugs from shared/mutable state** — since nothing outside is touched, pure functions can't accidentally break other parts of the app.
- **Enables memoization** — since output only depends on input, you can safely cache results (this is exactly why memoization from Q22 only works correctly on pure functions).
- **React relevance:** React expects components and reducer functions (e.g., in Redux/`useReducer`) to be pure — same props/state in, same UI/output out, with no direct mutation. This is why you never mutate state directly in React; you always return a new object/array.

**Interview soundbite:**

> "A pure function always produces the same output for the same input and doesn't cause any observable side effects outside its own scope, like mutating external variables or objects, making network calls, or logging. Purity is what makes functions predictable, testable, and safely cacheable."

</details>

---

### 30. What is the difference between `call`, `apply`, and `bind`?

<details>
<summary><b>Click to expand answer</b></summary>

All three are methods available on every function, and all three let you explicitly control **what `this` refers to** when the function runs. The difference is _how_ arguments are passed and _when_ the function actually executes.

```js
const person = { name: "Vamsi" };

function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}
```

**1. `call`** — invokes the function **immediately**, arguments passed **individually, comma-separated**.

```js
greet.call(person, "Hello", "!"); // "Hello, Vamsi!"
```

**2. `apply`** — invokes the function **immediately**, arguments passed as a **single array**.

```js
greet.apply(person, ["Hello", "!"]); // "Hello, Vamsi!"
```

**3. `bind`** — does **NOT** invoke the function immediately. Instead, it returns a **new function** with `this` permanently bound (and optionally, some arguments pre-filled). You call that new function whenever you want.

```js
const boundGreet = greet.bind(person, "Hello");
boundGreet("!"); // "Hello, Vamsi!" — called later
```

**Quick way to remember:**

> "Call = Comma-separated arguments. Apply = Array of arguments. Bind = returns a Bound function for later."

**Comparison table:**

|         | Executes immediately? | Argument format             | Returns               |
| ------- | --------------------- | --------------------------- | --------------------- |
| `call`  | Yes                   | Individual, comma-separated | The function's result |
| `apply` | Yes                   | Single array                | The function's result |
| `bind`  | No                    | Individual, comma-separated | A new function        |

**Practical use cases:**

- `apply` is handy when you already have arguments as an array — e.g., `Math.max.apply(null, [1, 5, 3])` (though the spread operator `Math.max(...[1, 5, 3])` has mostly replaced this today).
- `call` is useful for borrowing methods from one object/prototype for use on another.
- `bind` is very common for **fixing `this`** in callbacks/event handlers, especially in class components:

```js
class Button {
  constructor() {
    this.label = "Click me";
    this.handleClick = this.handleClick.bind(this); // lock `this` permanently
  }
  handleClick() {
    console.log(this.label);
  }
}
```

</details>

---

### 31. What is memoization?

<details>
<summary><b>Click to expand answer</b></summary>

**Memoization** is an optimization technique where you **cache the result of a function call** based on its input arguments, so that if the function is called again with the _same_ arguments, you return the cached result instantly instead of recomputing it.

```js
function memoize(fn) {
  const cache = new Map(); // closure keeps this alive across calls

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key); // cache hit — instant
    }
    const result = fn(...args); // cache miss — compute and store
    cache.set(key, result);
    return result;
  };
}

function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

const fastFib = memoize(slowFib);
fastFib(40); // slow the first time
fastFib(40); // instant — pulled from cache
```

**Important requirement:** Memoization only works correctly on **pure functions** (see Q29) — if a function's output can change for the same input (e.g., it depends on external mutable state, or has randomness), caching its result would give you stale/wrong data.

**Trade-off:** Memoization trades **memory** for **speed**. You're storing extra data (the cache) to avoid redoing expensive computation.

**Where you'll see this in real code:**

- `React.useMemo()` and `React.useCallback()` — memoize computed values / function references between renders so children don't re-render unnecessarily or expensive calculations don't re-run.
- `React.memo()` — memoizes an entire component's rendered output based on props.
- Classic DSA/algorithm problems — e.g., Fibonacci, dynamic programming problems where overlapping subproblems are recomputed repeatedly without memoization.
- Library-level caching (e.g., caching API responses by URL/params).

**Interview soundbite:**

> "Memoization is caching a pure function's return value keyed by its arguments, so repeated calls with the same inputs return the cached result instead of recomputing. It trades memory for speed and only works safely on pure functions."

</details>

---

### 32. What is a generator function, and how does it differ from a regular function?

<details>
<summary><b>Click to expand answer</b></summary>

A **generator function** is a special kind of function that can **pause its execution partway through**, and **resume later**, instead of running start-to-finish in one go like a regular function.

**Syntax:** Defined with `function*` (note the asterisk), and uses the `yield` keyword to pause and emit a value.

```js
function* numberGenerator() {
  console.log("start");
  yield 1;
  console.log("after first yield");
  yield 2;
  console.log("after second yield");
  yield 3;
  console.log("end");
}

const gen = numberGenerator(); // nothing runs yet! just creates a generator object

gen.next(); // logs "start", returns { value: 1, done: false }
gen.next(); // logs "after first yield", returns { value: 2, done: false }
gen.next(); // logs "after second yield", returns { value: 3, done: false }
gen.next(); // logs "end", returns { value: undefined, done: true }
```

**Key differences from a regular function:**

|              | Regular function                                       | Generator function                                                                        |
| ------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Syntax       | `function foo() {}`                                    | `function* foo() {}`                                                                      |
| When called  | Runs immediately, top to bottom                        | Calling it does **not** run the body — it returns a special **generator object/iterator** |
| Execution    | Runs to completion in one go                           | Can **pause** (at each `yield`) and **resume** (via `.next()`)                            |
| Return value | A single value via `return`                            | A stream/sequence of values via multiple `yield`s, produced one at a time                 |
| Re-entrant?  | No — you can't "go back into" a function mid-execution | Yes — state (local variables, where it paused) is preserved between `.next()` calls       |

**Why this matters / practical relevance:**

- **Lazy evaluation** — generate values only when needed, instead of computing everything upfront (useful for very large or even infinite sequences):

```js
function* infiniteCounter() {
  let i = 0;
  while (true) {
    yield i++;
  }
}
const counter = infiniteCounter();
counter.next().value; // 0
counter.next().value; // 1
// you could call this forever without running out of memory upfront,
// since values are only produced on demand
```

- **Custom iterables** — generators are the easiest way to make an object work with `for...of`, since they automatically implement the iterator protocol.
- **Two-way communication** — you can even pass values _into_ a generator via `.next(value)`, which becomes the result of the `yield` expression that's paused.
- Historically used to manage async flows before `async`/`await` existed (e.g., Redux-Saga still uses generators heavily for handling side effects).

**Interview soundbite:**

> "A generator function, written with `function*`, can pause execution at `yield` points and resume later via `.next()`, unlike a regular function which always runs to completion in a single pass. This makes generators useful for lazy sequences, custom iterators, and controlling execution flow step by step."

</details>

---
