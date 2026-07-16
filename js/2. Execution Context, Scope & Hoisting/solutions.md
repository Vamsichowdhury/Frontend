# 2. Execution Context, Scope & Hoisting

---

# 12. What is an Execution Context, and what does it consist of?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

An **Execution Context** is the environment in which JavaScript code is executed.

Whenever JavaScript executes code, it creates an execution context containing everything needed to run that code.

Think of it as a **workspace** where JavaScript stores:

- Variables
- Functions
- The value of `this`
- Information about outer scopes

Every piece of JavaScript code runs inside an execution context.

</details>

---

<details>
<summary><strong>🏗 Types of Execution Context</strong></summary>

There are three types.

### 1. Global Execution Context (GEC)

Created once when the JavaScript program starts.

```javascript
console.log("Hello");
```

The first execution context created is the Global Execution Context.

It contains:

- Global variables
- Global functions
- `this` (Window in browser)

Only one Global Execution Context exists.

---

### 2. Function Execution Context (FEC)

Every time a function is called, JavaScript creates a new execution context.

```javascript
function greet() {
  let name = "John";
}

greet();
```

Calling `greet()` creates a Function Execution Context.

If the function is called 100 times,

100 execution contexts are created.

---

### 3. Eval Execution Context

Created when using `eval()`.

Rarely used.

```javascript
eval("let x = 10");
```

Avoid using `eval()`.

</details>

---

<details>
<summary><strong>⚙️ Phases of Execution Context</strong></summary>

Every execution context has **two phases**.

---

## Phase 1 — Memory Creation Phase

JavaScript scans the code before executing it.

It allocates memory.

Example:

```javascript
console.log(a);

var a = 10;

function greet() {}
```

Memory becomes:

```
a → undefined

greet → entire function
```

Nothing executes yet.

---

## Phase 2 — Execution Phase

Now JavaScript executes line by line.

```
console.log(a)
```

prints

```
undefined
```

Then

```
a = 10
```

updates memory.

</details>

---

<details>
<summary><strong>🧠 Visual Example</strong></summary>

Code

```javascript
var a = 5;

function add(x, y) {
  return x + y;
}

let result = add(2, 3);
```

Memory Phase

```
a        → undefined

add      → function

result   → uninitialized
```

Execution Phase

```
a = 5

add()

result = 5
```

</details>

---

<details>
<summary><strong>🎯 Interview Tip</strong></summary>

Execution Context is **not** the Call Stack.

Execution Context is the environment.

Call Stack stores execution contexts.

</details>

---

# 13. What is the Call Stack?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

The Call Stack is a stack data structure used by JavaScript to keep track of function execution.

Whenever a function is called,

its execution context is pushed onto the stack.

When the function finishes,

it is popped from the stack.

Since JavaScript is single-threaded,

only one execution context runs at a time.

</details>

---

<details>
<summary><strong>📦 Example</strong></summary>

```javascript
function one() {
  two();
}

function two() {
  three();
}

function three() {
  console.log("Done");
}

one();
```

Call Stack

```
Global
```

↓

```
Global
one()
```

↓

```
Global
one()
two()
```

↓

```
Global
one()
two()
three()
```

After completion

```
Global
one()
two()
```

↓

```
Global
one()
```

↓

```
Global
```

</details>

---

<details>
<summary><strong>⚠️ Stack Overflow</strong></summary>

Infinite recursion fills the call stack.

```javascript
function hello() {
  hello();
}

hello();
```

Eventually,

```
Maximum call stack size exceeded
```

</details>

---

<details>
<summary><strong>🎯 Interview Tip</strong></summary>

Call Stack follows

```
LIFO

Last In

First Out
```

</details>

---

# 14. What is Lexical Scoping and the Scope Chain?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

Lexical Scoping means that the scope of a variable is determined by **where it is written in the source code**, not where the function is called.

A function can access:

- Its own variables
- Variables from parent scopes
- Global variables

This lookup process is called the **Scope Chain**.

</details>

---

<details>
<summary><strong>🏗 Example</strong></summary>

```javascript
let country = "India";

function outer() {
  let city = "Hyderabad";

  function inner() {
    let area = "Hitech";

    console.log(country);
    console.log(city);
    console.log(area);
  }

  inner();
}

outer();
```

The inner function can access

```
area

↓

city

↓

country
```

This is the Scope Chain.

</details>

---

<details>
<summary><strong>❌ Reverse is Not Possible</strong></summary>

```javascript
function outer() {
  function inner() {
    let x = 10;
  }

  console.log(x);
}
```

Output

```
ReferenceError
```

Parent cannot access child variables.

</details>

---

<details>
<summary><strong>🧠 Visual</strong></summary>

```
Global Scope

↓

Outer Scope

↓

Inner Scope
```

Variable lookup happens upward.

Never downward.

</details>

---

# 15. What is Hoisting?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during the memory creation phase.

Only declarations are hoisted—not initializations.

</details>

---

<details>
<summary><strong>var Hoisting</strong></summary>

```javascript
console.log(a);

var a = 10;
```

Internally

```javascript
var a;

console.log(a);

a = 10;
```

Output

```
undefined
```

</details>

---

<details>
<summary><strong>let and const Hoisting</strong></summary>

They are hoisted.

But they remain in the

**Temporal Dead Zone (TDZ)**

until execution reaches their declaration.

```javascript
console.log(a);

let a = 10;
```

Output

```
ReferenceError
```

Not

```
undefined
```

</details>

---

<details>
<summary><strong>Function Declaration Hoisting</strong></summary>

```javascript
hello();

function hello() {
  console.log("Hello");
}
```

Works perfectly.

Because the entire function is hoisted.

</details>

---

<details>
<summary><strong>Function Expression Hoisting</strong></summary>

```javascript
hello();

var hello = function () {
  console.log("Hello");
};
```

Memory

```
hello → undefined
```

Execution

```
undefined()
```

Output

```
TypeError
```

</details>

---

<details>
<summary><strong>Hoisting Comparison Table</strong></summary>

| Declaration          | Hoisted          | Initial Value   | Before Declaration |
| -------------------- | ---------------- | --------------- | ------------------ |
| var                  | ✅               | undefined       | undefined          |
| let                  | ✅               | TDZ             | ReferenceError     |
| const                | ✅               | TDZ             | ReferenceError     |
| function declaration | ✅               | Entire Function | Works              |
| function expression  | Variable hoisted | undefined       | TypeError          |

</details>

---

# 16. Why can Function Declarations be called before they're defined, but not Function Expressions?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

Function declarations are fully hoisted during the memory creation phase, meaning the entire function definition is available before execution begins.

Function expressions behave like variables. Only the variable declaration is hoisted, not the assigned function.

</details>

---

<details>
<summary><strong>Example</strong></summary>

### Function Declaration

```javascript
greet();

function greet() {
  console.log("Hello");
}
```

Works because `greet` already points to the function.

---

### Function Expression

```javascript
greet();

var greet = function () {
  console.log("Hello");
};
```

During memory creation:

```javascript
var greet = undefined;
```

So JavaScript tries to execute:

```javascript
undefined();
```

Result:

```
TypeError: greet is not a function
```

---

### With `let`

```javascript
greet();

let greet = function () {};
```

Result:

```
ReferenceError
```

because `greet` is in the TDZ.

</details>

---

# 17. What is the Difference Between Global, Function, and Block Scope?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

Scope defines where a variable is accessible.

JavaScript has three main scopes:

- Global Scope
- Function Scope
- Block Scope

</details>

---

<details>
<summary><strong>🌍 Global Scope</strong></summary>

Variables declared outside any function or block.

```javascript
let name = "Vamsi";

function greet() {
  console.log(name);
}
```

Accessible everywhere.

</details>

---

<details>
<summary><strong>🏠 Function Scope</strong></summary>

Variables declared inside a function.

```javascript
function test() {
  let age = 25;
}

console.log(age);
```

Output

```
ReferenceError
```

</details>

---

<details>
<summary><strong>🧱 Block Scope</strong></summary>

Blocks include:

- if
- for
- while
- switch
- {}

`let` and `const` are block scoped.

```javascript
if (true) {
  let x = 10;
}

console.log(x);
```

Output

```
ReferenceError
```

`var` ignores block scope.

```javascript
if (true) {
  var x = 10;
}

console.log(x);
```

Output

```
10
```

</details>

---

<details>
<summary><strong>Comparison Table</strong></summary>

| Feature            | Global                       | Function | Block |
| ------------------ | ---------------------------- | -------- | ----- |
| Visible Everywhere | ✅                           | ❌       | ❌    |
| Created By         | Outside all blocks/functions | Function | {}    |
| let                | ✅                           | ✅       | ✅    |
| const              | ✅                           | ✅       | ✅    |
| var                | ✅                           | ✅       | ❌    |

</details>

---

# 18. What is an IIFE, and why was it historically used?

<details>
<summary><strong>📖 Interview Answer</strong></summary>

An **IIFE (Immediately Invoked Function Expression)** is a function that is defined and executed immediately after it is created.

Syntax:

```javascript
(function () {
  console.log("Runs immediately");
})();
```

or

```javascript
(() => {
  console.log("Runs immediately");
})();
```

</details>

---

<details>
<summary><strong>🤔 Why was it used historically?</strong></summary>

Before ES6 introduced `let`, `const`, and modules, developers mainly had `var`, which is function-scoped.

Variables declared with `var` leaked out of blocks.

IIFEs created a new function scope, preventing variables from polluting the global namespace.

```javascript
(function () {
  var secret = "Hidden";
})();

console.log(secret); // ReferenceError
```

Without the IIFE:

```javascript
var secret = "Hidden";
```

`secret` would become a global variable.

</details>

---

<details>
<summary><strong>📦 Real-world Example</strong></summary>

```javascript
for (var i = 1; i <= 3; i++) {
  (function (num) {
    setTimeout(() => {
      console.log(num);
    }, 1000);
  })(i);
}
```

Output:

```
1
2
3
```

Without the IIFE (using `var` directly), all callbacks would print:

```
4
4
4
```

Today, this is more simply written with `let`:

```javascript
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
```

</details>

---

<details>
<summary><strong>🎯 Interview Tip</strong></summary>

Today, IIFEs are used less frequently because:

- `let` and `const` provide block scope.
- ES Modules provide file-level scope.
- Modern bundlers isolate module code.

However, you'll still encounter IIFEs in older codebases and interview questions, so it's important to recognize the pattern and understand why it was useful.

</details>

---

# ⭐ Quick Interview Revision

| Topic                      | One-line Summary                                         |
| -------------------------- | -------------------------------------------------------- |
| Execution Context          | Environment where JavaScript executes code.              |
| Global Execution Context   | Created once when the program starts.                    |
| Function Execution Context | Created every time a function is called.                 |
| Call Stack                 | LIFO stack that manages execution contexts.              |
| Lexical Scope              | Scope determined by where code is written.               |
| Scope Chain                | Variable lookup from current scope to parent scopes.     |
| Hoisting                   | Declarations are processed before execution.             |
| `var`                      | Hoisted and initialized to `undefined`.                  |
| `let` / `const`            | Hoisted but remain in the TDZ until declared.            |
| Function Declaration       | Fully hoisted; callable before definition.               |
| Function Expression        | Variable hoisted; function assigned during execution.    |
| Global Scope               | Accessible everywhere.                                   |
| Function Scope             | Accessible only inside the function.                     |
| Block Scope                | Accessible only inside `{}` with `let`/`const`.          |
| IIFE                       | Function executed immediately to create a private scope. |
