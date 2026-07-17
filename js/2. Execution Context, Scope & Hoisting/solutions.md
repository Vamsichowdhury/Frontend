# 2. Execution Context, Scope & Hoisting

---

### 12. What is an execution context, and what does it consist of?

<details>
<summary><b>Click to expand answer</b></summary>

An **execution context** is the environment in which JavaScript code is evaluated and run. Think of it as a container that holds everything the engine needs to know to run a piece of code: what variables exist, what `this` refers to, and where to look for outer variables.

**Types of execution context:**

1. **Global Execution Context (GEC)** — created once, when the script first starts running. There's only ever one of these.
2. **Function Execution Context (FEC)** — created every time a function is called. Every single function call gets its own brand-new execution context.
3. **Eval Execution Context** — created for code run inside `eval()` (rare, mostly avoided in real code).

**What an execution context consists of (its three main parts):**

1. **Variable Environment** — where `var` declarations and function declarations live. Also holds the `arguments` object for function contexts.
2. **Lexical Environment** — where `let`/`const` declarations live, plus a reference to the **outer** lexical environment (this outer link is what makes the _scope chain_ possible — see Q14).
3. **`this` binding** — determines what `this` refers to inside that context, decided by _how_ the function was called (see Q30 in Section 4 for `call`/`apply`/`bind`).

**Two phases every execution context goes through:**

1. **Creation phase** (before any code actually runs):
   - The `this` binding is determined.
   - Memory is set up for variables and functions — `var` variables are initialized to `undefined`, function declarations are stored in full, and `let`/`const` are put in a "temporal dead zone" (see Q15).
2. **Execution phase**:
   - Code runs line by line, top to bottom, assigning actual values to variables and executing statements.

**Simple analogy:** Think of an execution context as a fresh notebook page created every time a function is called. Before you write anything (creation phase), you first rule out sections for your variables and note down the names you'll use — some pre-filled as blank (`undefined`), functions written out in full. Then (execution phase) you actually fill in the values as you go.

**Interview soundbite:**

> "An execution context is the environment JS creates to run a piece of code — it tracks variables, function declarations, and what `this` refers to. There's one global context, and a new one is created every time any function is called."

</details>

---

### 13. What is the call stack?

<details>
<summary><b>Click to expand answer</b></summary>

The **call stack** is how JavaScript keeps track of _where it is_ in the program — specifically, which function is currently running, and which functions called it (so it knows where to return to once the current one finishes).

It works exactly like a physical stack of plates: **Last In, First Out (LIFO)**. Whatever function was called most recently is the one on top, and it's the one that finishes (and gets removed) first.

```js
function first() {
  second();
  console.log("first done");
}
function second() {
  third();
  console.log("second done");
}
function third() {
  console.log("third done");
}

first();
```

**Step-by-step stack trace:**

1. `first()` is called → pushed onto the stack. Stack: `[first]`
2. Inside `first`, `second()` is called → pushed. Stack: `[first, second]`
3. Inside `second`, `third()` is called → pushed. Stack: `[first, second, third]`
4. `third` finishes (logs "third done") → popped off. Stack: `[first, second]`
5. Back in `second`, it logs "second done" → finishes → popped off. Stack: `[first]`
6. Back in `first`, it logs "first done" → finishes → popped off. Stack: `[]`

**Why this matters for interviews:**

- **Stack Overflow errors** happen when the call stack grows too large — most commonly from infinite/uncontrolled recursion (a function that keeps calling itself without a proper base case to stop):

```js
function recurse() {
  return recurse(); // no base case — keeps pushing forever
}
recurse(); // RangeError: Maximum call stack size exceeded
```

- JavaScript is **single-threaded** — meaning there's only **one call stack**, so only one thing can run at a time. This is exactly why understanding the call stack matters when you get into the event loop, callbacks, and async code (`setTimeout`, Promises) — those don't run on the call stack directly; they wait in queues until the stack is empty.
- Browser DevTools show you the call stack directly when you pause on a breakpoint or hit an error — reading it top-to-bottom tells you exactly which function called which, which is invaluable for debugging.

**Interview soundbite:**

> "The call stack is a LIFO structure that tracks function calls — every time a function is invoked, a new frame is pushed on top; when it returns, that frame is popped off. Since JS has just one call stack, it can only execute one thing at a time, which is the foundation for understanding synchronous vs. asynchronous behavior."

</details>

---

### 14. What is lexical scoping and the scope chain?

<details>
<summary><b>Click to expand answer</b></summary>

**Lexical scoping** means a variable's scope (where it can be accessed from) is determined by **where it is physically written in the code** — not by how or where the function is later called from. "Lexical" basically means "based on position in the source code."

```js
function outer() {
  const name = "Vamsi";

  function inner() {
    console.log(name); // inner can access `name` because of WHERE it's written
  }

  inner();
}
outer(); // "Vamsi"
```

`inner` can see `name` simply because it's _nested inside_ `outer` in the code — this relationship is fixed at the time you write the code, not decided at runtime.

**The scope chain** is the mechanism that makes lexical scoping actually work. When you reference a variable, JS looks for it:

1. First, in the **current** scope.
2. If not found, it looks in the **next outer** scope.
3. It keeps going outward, one level at a time, until it either finds the variable or reaches the **global scope**.
4. If it's still not found at the global scope, you get a `ReferenceError`.

```js
const globalVar = "I'm global";

function outer() {
  const outerVar = "I'm in outer";

  function inner() {
    const innerVar = "I'm in inner";
    console.log(innerVar); // found in inner's own scope
    console.log(outerVar); // not in inner, found in outer's scope
    console.log(globalVar); // not in inner or outer, found in global scope
  }

  inner();
}
outer();
```

Each scope keeps a hidden reference to its **parent** scope — this chain of references (inner → outer → global) is literally the "scope chain." This is also exactly the mechanism closures rely on (see Section 3).

**Important distinction — lexical vs dynamic scoping:**
JS uses lexical (a.k.a. static) scoping — decided by _where code is written_. Some other languages use dynamic scoping, where a variable's value would depend on the **call stack at runtime** (i.e., who called the function) instead of where it's written. JS does not do this for variable scope (though `this` does behave more "dynamically," since it depends on how a function is called — that's a different mechanism from scope).

**Interview soundbite:**

> "Lexical scoping means scope is determined by where code is physically written, not how it's called. The scope chain is how JS resolves a variable — it looks in the current scope first, then walks outward through each parent scope until it finds the variable or hits the global scope."

</details>

---

### 15. What is hoisting, and how does it differ for `var`, `let`/`const`, and function declarations?

<details>
<summary><b>Click to expand answer</b></summary>

**Hoisting** is JavaScript's behavior of processing variable and function **declarations** during the creation phase of an execution context (see Q12) — _before_ any code actually runs line by line. This makes it look like declarations were "moved to the top" of their scope, even though the code isn't physically rearranged — the engine just registers names in memory ahead of time.

**How it differs across declaration types:**

**1. `var`**

- Hoisted **and initialized to `undefined`** immediately.
- This means you can reference a `var` variable before its declaration line without a crash — you just get `undefined` instead of the actual value.

```js
console.log(x); // undefined (not an error!)
var x = 5;
console.log(x); // 5
```

**2. `let` and `const`**

- Also technically hoisted (the engine is aware they exist) — but they are **not initialized**. They sit in something called the **Temporal Dead Zone (TDZ)** from the start of their scope until the line where they're actually declared.
- Accessing them before that line throws a `ReferenceError`, not `undefined`.

```js
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

**3. Function declarations**

- Hoisted **completely** — both the name _and_ the entire function body are available immediately, from the very top of the scope.

```js
sayHi(); // works! "Hi!"
function sayHi() {
  console.log("Hi!");
}
```

**4. Function expressions & arrow functions**

- These follow the hoisting rule of _whatever variable type they're assigned to_ (`var`, `let`, or `const`) — the function body itself is never hoisted, only the variable declaration is.

```js
sayBye(); // TypeError: sayBye is not a function
var sayBye = function () {
  console.log("Bye!");
};
```

**Summary table:**

| Declaration type               | Hoisted?                     | Initial value before declaration line | Accessing early               |
| ------------------------------ | ---------------------------- | ------------------------------------- | ----------------------------- |
| `var`                          | Yes                          | `undefined`                           | Returns `undefined`, no error |
| `let` / `const`                | Yes (but in TDZ)             | Uninitialized                         | `ReferenceError`              |
| `function` declaration         | Yes, fully                   | Entire function                       | Works normally                |
| function expression / arrow fn | Only the variable is hoisted | Depends on `var`/`let`/`const` used   | Follows that variable's rule  |

**Interview soundbite:**

> "Hoisting happens because the engine registers all declarations during the creation phase, before running any code. `var` is hoisted and set to `undefined`. `let`/`const` are hoisted but stay uninitialized in the Temporal Dead Zone, so accessing them early throws an error. Function declarations are hoisted completely, body and all, so they can be called before they appear in the code."

</details>

---

### 16. Why can you call a function declaration before it's defined, but not a function expression?

<details>
<summary><b>Click to expand answer</b></summary>

This comes straight from the hoisting rules explained above, applied specifically to functions.

**Function declaration — fully hoisted, body included:**

```js
sayHi(); // "Hi!" — works fine
function sayHi() {
  console.log("Hi!");
}
```

During the creation phase, the JS engine scans the scope and finds `function sayHi() {...}`. Because it's a full declaration, the engine hoists **the entire thing** — name and function body together — to the top of the scope. So by the time execution starts, `sayHi` is already a fully-formed, callable function, no matter where you call it from within that scope.

**Function expression — only the variable is hoisted, not the function:**

```js
sayBye(); // TypeError: sayBye is not a function
var sayBye = function () {
  console.log("Bye!");
};
```

Here, `sayBye` is just a variable that happens to be _assigned_ a function value. During the creation phase, only the `var sayBye` part is hoisted (and initialized to `undefined`, per `var` rules) — the assignment (`= function () {...}`) only happens later, when execution actually reaches that line. So when you try to call `sayBye()` before that line, you're really trying to call `undefined()`, hence the `TypeError`.

If it were written with `let`/`const` instead:

```js
sayBye(); // ReferenceError: Cannot access 'sayBye' before initialization
const sayBye = function () {
  console.log("Bye!");
};
```

Same idea, but now you hit the TDZ instead of getting `undefined` — the error type changes, but the core reason (the function body isn't attached yet) is the same.

**The one-line reason interviewers want to hear:**

> "A function declaration is hoisted as a complete, ready-to-call unit. A function expression is just hoisted as a variable — the function itself is only attached once that specific line of code actually runs."

</details>

---

### 17. What is the difference between global, function, and block scope?

<details>
<summary><b>Click to expand answer</b></summary>

Scope determines **where in your code a variable is accessible**. JavaScript has three levels:

**1. Global scope**

- Variables declared outside of any function or block.
- Accessible from **anywhere** in your code, including inside every function and block.
- `var`, `let`, and `const` at the top level all become global variables (though `var` additionally attaches itself as a property of the global object, e.g. `window` in browsers — `let`/`const` do not).

```js
const appName = "MyApp"; // global

function showName() {
  console.log(appName); // accessible here
}
```

**2. Function scope**

- Variables declared with **`var`** are scoped to the entire nearest enclosing **function** — not to any inner blocks (`if`, `for`, etc.) within that function.

```js
function demo() {
  if (true) {
    var x = 10; // function-scoped, NOT block-scoped
  }
  console.log(x); // 10 — accessible outside the `if` block, still inside the function
}
```

**3. Block scope**

- Variables declared with **`let`** and **`const`** are scoped to the nearest enclosing pair of curly braces `{ }` — an `if` block, a `for` loop, or even a standalone `{ }` block.

```js
function demo() {
  if (true) {
    let y = 20; // block-scoped
  }
  console.log(y); // ReferenceError: y is not defined — can't escape the `if` block
}
```

**Side-by-side comparison:**

|                                                                     | `var`            | `let` / `const`     |
| ------------------------------------------------------------------- | ---------------- | ------------------- |
| Scope boundary                                                      | Nearest function | Nearest block `{ }` |
| Accessible outside an `if`/`for` block (but still in the function)? | Yes              | No                  |
| Re-declarable in the same scope?                                    | Yes (no error)   | No (`SyntaxError`)  |

**Why block scoping (`let`/`const`) is generally preferred today:**

- It matches what most developers _intuitively_ expect — a variable declared inside a loop or `if` block shouldn't "leak" outside of it.
- It directly prevents bugs like the classic `var` closure-in-a-loop problem (see Q21 in Section 3), since each block gets its own fresh variable.

**Interview soundbite:**

> "Global scope is accessible everywhere. Function scope, which is what `var` follows, means a variable is visible anywhere inside its containing function, regardless of nested blocks. Block scope, which `let`/`const` follow, restricts a variable to the specific `{ }` block it was declared in — even a single `if` or `for` block boundary."

</details>

---

### 18. What is an IIFE, and why was it historically used?

<details>
<summary><b>Click to expand answer</b></summary>

**IIFE** stands for **Immediately Invoked Function Expression** — a function that is defined and **called immediately**, right at the moment it's created, without ever being assigned to a variable name or called elsewhere later.

**Basic syntax:**

```js
(function () {
  console.log("I run immediately!");
})();
```

**Why it's written with those extra parentheses:** JavaScript's parser needs to see `function` as part of an _expression_, not a _declaration_ (declarations can't be immediately invoked this way, and would actually cause a syntax error without a name if attempted directly). Wrapping it in `( ... )` forces the engine to treat it as an expression, so the trailing `()` can then be used to call it right away.

Arrow function version:

```js
(() => {
  console.log("Also runs immediately!");
})();
```

**Historically, why was this used?**

**1. Avoiding global scope pollution.** Before `let`/`const`/modules existed, every `var` at the top level became a property on the global object, and multiple `<script>` tags on the same page all shared that same global scope — creating serious risk of naming collisions between different scripts/libraries.

```js
(function () {
  var privateVar = "hidden from global scope";
  // any code here is fully isolated
})();

console.log(typeof privateVar); // "undefined" — never leaked outside
```

**2. Creating private scope / data privacy (the "module pattern").** Since only what you explicitly `return` escapes the IIFE, everything else defined inside stays fully private — this is one of the earliest ways developers simulated "private" variables and methods in JS, well before ES6 modules or classes with `#private` fields existed.

```js
const counterModule = (function () {
  let count = 0; // private, only reachable through the returned object
  return {
    increment: () => ++count,
    getCount: () => count,
  };
})();

counterModule.increment();
console.log(counterModule.getCount()); // 1
console.log(counterModule.count); // undefined — private
```

**3. Fixing the classic `var`-in-a-loop closure bug** — covered in detail in Q21 (Section 3), by giving each loop iteration its own private, isolated scope via a fresh function call.

**Are IIFEs still needed today?**
Much less often. `let`/`const` give you block scoping natively, and ES6 modules give every file its own private scope automatically (nothing leaks to the global scope unless explicitly exported). That said, IIFEs still show up in some bundler-output code and certain library patterns, so recognizing them is still a common interview topic even if you rarely need to write one yourself in modern code.

**Interview soundbite:**

> "An IIFE is a function that runs the moment it's defined. Historically it was used to avoid polluting the global scope and to fake private variables via closures, since anything declared inside stays hidden unless explicitly returned. Modern JS has mostly replaced this need with block scoping and ES6 modules, but it's still useful to recognize the pattern."

</details>

---
