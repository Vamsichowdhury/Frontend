# Curry Function — Deep Dive

---

### What is currying, quickly recapped

<details>
<summary><b>Click to expand answer</b></summary>

Currying transforms a function that takes multiple arguments into a chain of functions that each take arguments one step at a time, only actually running the original function once enough arguments have been collected.

```js
function add(a, b, c) {
  return a + b + c;
}

// curried version behaves like:
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6
curriedAdd(1, 2, 3); // 6
```

The goal of a generic `curry` helper is to take _any_ function and automatically give it this flexible, "collect arguments until ready" behavior — without you manually nesting functions yourself.

</details>

---

### Simple curry function (fixed number of arguments — no generics)

<details>
<summary><b>Click to expand answer</b></summary>

If you don't need it to work for _any_ function, and just want to curry a specific function with a known, fixed number of arguments, you don't need `fn.length` checks or recursion at all — just nest plain functions, one per argument.

```js
function add(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

add(1)(2)(3); // 6
```

**What's happening:**

- `add(1)` runs and returns a new function, remembering `a = 1` (closure).
- Calling that with `(2)` runs and returns another function, remembering `a = 1` and `b = 2`.
- Calling that with `(3)` finally has all three values, so it computes and returns `1 + 2 + 3 = 6`.

**Same thing, written with arrow functions (much shorter):**

```js
const add = (a) => (b) => (c) => a + b + c;

add(1)(2)(3); // 6
```

**Why this is enough for most interviews:**
This version directly shows you understand the **core mechanism** — closures returning closures, one argument at a time — without extra machinery. A generic `curry(fn)` helper (further down this doc) is really just automating this exact pattern for _any_ function.

**Interview soundbite:**

> "The simplest way to curry a function is to nest functions, one per argument, where each one returns the next function until the last one computes the actual result. Each nested function closes over the arguments received so far — that's what lets the final call access all of them."

</details>

---

### Implementing a generic `curry` function

<details>
<summary><b>Click to expand answer</b></summary>

```js
function curry(fn) {
  return function curried(...args) {
    // fn.length = number of parameters fn was declared with
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}
```

**How it works, step by step:**

1. `curry(fn)` returns a new function, `curried`.
2. Every time `curried` is called, it checks: have I collected **enough arguments** to match `fn`'s expected parameter count (`fn.length`)?
3. **If yes** → call the original `fn` with everything collected so far, and return the result.
4. **If no** → return _another_ function that, when called, merges its new arguments with the ones already collected, then recurses back into `curried` to check again.

This is a direct real-world use of **closures** — each returned function closes over `args`, remembering exactly what's already been passed in.

**Trace through `curriedAdd(1)(2)(3)`, where `add(a, b, c)`:**

| Call         | `args` so far | `fn.length` | Enough? | Result                              |
| ------------ | ------------- | ----------- | ------- | ----------------------------------- |
| `curried(1)` | `[1]`         | 3           | No      | returns a function waiting for more |
| `(...)(2)`   | `[1, 2]`      | 3           | No      | returns another waiting function    |
| `(...)(3)`   | `[1, 2, 3]`   | 3           | Yes     | calls `add(1, 2, 3)` → `6`          |

**Known limitation (good to mention in an interview):**
`fn.length` doesn't count default parameters or rest parameters. So a function like `function add(a, b = 5, c) {}` won't curry correctly with this generic approach, since `fn.length` would only report `1` (it stops counting at the first parameter with a default value). For most interviews, it's enough to implement the standard version above and simply mention this edge case if asked.

**A simpler, fixed-arity version** (if an interviewer just wants to see the core closure pattern for exactly 3 arguments, without the generic/recursive version):

```js
const curry = (fn) => (a) => (b) => (c) => fn(a, b, c);
```

</details>

---

### Real-world usage scenarios

<details>
<summary><b>Click to expand answer</b></summary>

Currying isn't just an interview trick — it shows up in real codebases, especially in functional-style JS and React apps.

**1. Building reusable, pre-configured functions (partial-style usage)**

```js
const curriedMultiply = curry(
  (tax, discount, price) => price * (1 + tax) * (1 - discount),
);

// Lock in tax and discount once, reuse for many prices
const applyIndiaGST = curriedMultiply(0.18);
const applyFestiveOffer = applyIndiaGST(0.1);

applyFestiveOffer(1000); // price after 18% tax and 10% discount
applyFestiveOffer(2500); // reuse the same configured pipeline
```

Instead of repeatedly passing the same `tax`/`discount` values everywhere, you configure them once and get back a specialized function — this is genuinely useful in pricing/calculation utilities.

**2. Event handlers that need extra context (very common in React)**

```js
function handleFieldChange(fieldName) {
  return function (event) {
    console.log(`${fieldName} changed to`, event.target.value);
  };
}

// In JSX:
// <input onChange={handleFieldChange("email")} />
// <input onChange={handleFieldChange("username")} />
```

This is a curried-style pattern (even without a generic `curry` helper) that you've likely already written — each input gets a handler "pre-loaded" with which field it belongs to, without creating a brand-new inline arrow function that captures state incorrectly on every render.

**3. Composing validation rules**

```js
const curriedValidator = curry((minLength, errorMsg, value) =>
  value.length >= minLength ? null : errorMsg,
);

const validatePassword = curriedValidator(
  8,
  "Password must be at least 8 characters",
);
const validateUsername = curriedValidator(
  3,
  "Username must be at least 3 characters",
);

validatePassword("abc"); // "Password must be at least 8 characters"
validateUsername("Vamsi"); // null — valid
```

Useful in form libraries — you define a general-purpose validator once, then curry in the specific rules per field, keeping validation logic declarative and reusable.

**4. Redux `connect()` (classic real-world example)**

```js
// Old-school Redux pattern — connect is curried
connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```

`connect(mapStateToProps, mapDispatchToProps)` returns a function that's _then_ called with the component. This lets Redux configure the "data-fetching" part first, and apply it to different components later — a textbook real-world curry pattern still found in many legacy/production Redux codebases.

**5. Logging / debugging utilities with fixed context**

```js
const curriedLog = curry((module, level, message) =>
  console.log(`[${module}] [${level}] ${message}`),
);

const logAuth = curriedLog("AuthService");
logAuth("INFO")("User logged in successfully");
logAuth("ERROR")("Login failed: invalid credentials");
```

You get a pre-tagged logger for a specific module without repeating the module name on every single log call — handy in larger apps with many services/modules logging independently.

**6. Building middleware-like pipelines**

```js
const curriedFetch = curry((baseUrl, endpoint, options) =>
  fetch(`${baseUrl}${endpoint}`, options),
);

const fetchFromMyAPI = curriedFetch("https://api.myapp.com");
fetchFromMyAPI("/users", { method: "GET" });
fetchFromMyAPI("/orders", { method: "POST" });
```

Common in API client utilities — fix the `baseUrl` once, and every subsequent call only needs to specify what's actually changing (`endpoint`, `options`).

**Why interviewers like this question:**
Currying combines several core JS concepts in one problem — closures, recursion, `fn.length`, rest parameters, and `apply`/`this` handling — so it's an efficient way to test how well you understand functions as first-class values, not just whether you can memorize the pattern.

</details>

---

---
