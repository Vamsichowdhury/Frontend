# 1. What are the primitive data types in JavaScript?

**Answer:**

JavaScript has **7 primitive data types**.

They are:

1. String
2. Number
3. BigInt
4. Boolean
5. Undefined
6. Null
7. Symbol

Primitive data types represent **single, immutable values**. Unlike objects, they are copied **by value** rather than by reference.

<details>
<summary><strong>📖 Detailed Explanation (Click to Expand)</strong></summary>

## What are Primitive Data Types?

Primitive data types are the **basic building blocks** of JavaScript.

They represent **single, immutable values**, meaning the value itself **cannot be changed** after it is created.

JavaScript has **7 primitive data types**.

---

## 1. String

Represents textual data.

```javascript
let name = "Vamsi";
let city = "Hyderabad";
```

```javascript
typeof name; // "string"
```

---

## 2. Number

Represents both integers and floating-point numbers.

```javascript
let age = 25;
let price = 199.99;
```

Special Number values:

```javascript
NaN;
Infinity - Infinity;
```

```javascript
typeof age; // "number"
```

---

## 3. BigInt

Used to store integers larger than `Number.MAX_SAFE_INTEGER`.

```javascript
let population = 987654321987654321987654321n;
```

Notice the `n` at the end.

```javascript
typeof population; // "bigint"
```

---

## 4. Boolean

Represents logical values.

```javascript
let isLoggedIn = true;
let hasPermission = false;
```

```javascript
typeof isLoggedIn; // "boolean"
```

---

## 5. Undefined

A variable that has been declared but has **not been assigned a value**.

```javascript
let score;

console.log(score); // undefined
```

```javascript
typeof score; // "undefined"
```

---

## 6. Null

Represents an **intentional absence of value**.

```javascript
let user = null;
```

```javascript
user === null; // true
```

### Interview Question

```javascript
typeof null;
```

Output

```javascript
"object";
```

This is a historical bug in JavaScript.

Always check for null like this:

```javascript
value === null;
```

---

## 7. Symbol

Represents a unique value.

Mostly used as unique object property keys.

```javascript
const id = Symbol("id");
const anotherId = Symbol("id");

console.log(id === anotherId);
```

Output

```javascript
false;
```

Every Symbol is unique.

```javascript
typeof id; // "symbol"
```

---

## Summary Table

| Primitive | Example      | typeof                        |
| --------- | ------------ | ----------------------------- |
| String    | `"Hello"`    | `"string"`                    |
| Number    | `10`, `3.14` | `"number"`                    |
| BigInt    | `123n`       | `"bigint"`                    |
| Boolean   | `true`       | `"boolean"`                   |
| Undefined | `undefined`  | `"undefined"`                 |
| Null      | `null`       | `"object"` _(historical bug)_ |
| Symbol    | `Symbol()`   | `"symbol"`                    |

---

## Primitive vs Non-Primitive

### Primitive Types

- String
- Number
- BigInt
- Boolean
- Undefined
- Null
- Symbol

These store the **actual value**.

```javascript
let a = 10;
let b = a;

b = 20;

console.log(a); // 10
console.log(b); // 20
```

Changing `b` does not affect `a`.

---

### Non-Primitive Types

Everything else in JavaScript is an object.

Examples:

```javascript
{}
[]
function () {}
new Date()
new Map()
new Set()
```

Objects are copied by reference.

```javascript
let obj1 = { name: "Vamsi" };
let obj2 = obj1;

obj2.name = "Krishna";

console.log(obj1.name); // Krishna
```

Both variables point to the same object in memory.

---

## Key Takeaways

- JavaScript has **7 primitive data types**.
- Primitive values are **immutable**.
- Primitive values are copied **by value**.
- Objects are copied **by reference**.
- `typeof null` returns `"object"` because of a historical bug.
- `Symbol` creates unique values.
- `BigInt` is used for very large integers.

</details>

---

# 2. Why does `typeof null` return `"object"`?

**🎯 Short Answer**

`typeof null` returns `"object"` due to a **historical bug** in the first JavaScript implementation. Internally, `null` was represented with a type tag that matched the one used for objects. The bug has been preserved for **backward compatibility**, so changing it would break existing JavaScript code.

```javascript
typeof null; // "object"
```

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## Why does this happen?

When JavaScript was first implemented, values were stored using **type tags**. The internal representation of `null` accidentally matched the tag for objects, so the `typeof` operator returned `"object"`.

This behavior is now part of the language and cannot be changed without breaking millions of existing websites.

## Is `null` actually an object?

No. `null` is one of JavaScript's **7 primitive data types**. The result of `typeof null` is simply a legacy behavior.

## How should you check for `null`?

Use strict equality instead of `typeof`.

```javascript
value === null;
```

## Example

```javascript
let value = null;

console.log(typeof value); // "object"
console.log(value === null); // true
```

## Interview Points

- `null` is a primitive, **not** an object.
- `typeof null` returning `"object"` is a historical bug.
- The behavior is preserved for backward compatibility.
- Use `value === null` to check for `null`.

</details>

---

# 3. What is the difference between `var`, `let`, and `const`?

**🎯 Short Answer**

`var`, `let`, and `const` are all used to declare variables, but they differ in **scope**, **hoisting**, **re-declaration**, **re-assignment**, and **Temporal Dead Zone (TDZ)** behavior.

| Feature                       | `var`                | `let`       | `const`     |
| ----------------------------- | -------------------- | ----------- | ----------- |
| Scope                         | Function             | Block       | Block       |
| Hoisted                       | ✅ Yes               | ✅ Yes      | ✅ Yes      |
| Accessible before declaration | ✅ Yes (`undefined`) | ❌ No (TDZ) | ❌ No (TDZ) |
| Re-declaration                | ✅ Yes               | ❌ No       | ❌ No       |
| Re-assignment                 | ✅ Yes               | ✅ Yes      | ❌ No       |
| Global object property        | ✅ Yes               | ❌ No       | ❌ No       |

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## 1. Scope

### `var` → Function Scoped

A `var` variable is accessible throughout the entire function, even if it's declared inside a block.

```javascript
function demo() {
  if (true) {
    var x = 10;
  }

  console.log(x); // 10
}
```

---

### `let` and `const` → Block Scoped

They are only accessible inside the block (`{}`) where they are declared.

```javascript
if (true) {
  let x = 10;
  const y = 20;
}

console.log(x); // ReferenceError
console.log(y); // ReferenceError
```

---

## 2. Hoisting

All three are **hoisted**, but they behave differently.

### `var`

Initialized with `undefined`.

```javascript
console.log(a); // undefined

var a = 10;
```

---

### `let` and `const`

They are hoisted but remain in the **Temporal Dead Zone (TDZ)** until their declaration.

```javascript
console.log(a); // ReferenceError

let a = 10;
```

---

## 3. Re-declaration

### `var`

Allowed.

```javascript
var name = "John";
var name = "Alice";

console.log(name); // Alice
```

---

### `let`

Not allowed.

```javascript
let age = 20;
let age = 30; // SyntaxError
```

---

### `const`

Also not allowed.

```javascript
const PI = 3.14;
const PI = 3.1415; // SyntaxError
```

---

## 4. Re-assignment

### `var`

```javascript
var a = 10;

a = 20; // ✅
```

---

### `let`

```javascript
let a = 10;

a = 20; // ✅
```

---

### `const`

```javascript
const a = 10;

a = 20; // TypeError
```

---

## 5. `const` Objects

`const` prevents **reassignment**, **not mutation**.

```javascript
const user = {
  name: "Vamsi",
};

user.name = "Krishna";

console.log(user.name); // Krishna
```

This is allowed because the object itself isn't replaced.

But this isn't allowed:

```javascript
user = {};
```

---

## 6. Global Object

`var` becomes a property of the global object (in browsers).

```javascript
var a = 10;

console.log(window.a); // 10
```

`let` and `const` do not.

```javascript
let b = 20;
const c = 30;

console.log(window.b); // undefined
console.log(window.c); // undefined
```

---

## When Should You Use Each?

### Use `const` (Recommended)

Use it by default for values that shouldn't be reassigned.

```javascript
const API_URL = "/api/users";
```

---

### Use `let`

When the variable needs to change.

```javascript
let count = 0;

count++;
```

---

### Avoid `var`

Modern JavaScript rarely uses `var` because of its function scope and hoisting behavior, which can lead to bugs.

---

## Interview Points

- `var` is **function scoped**.
- `let` and `const` are **block scoped**.
- All three are **hoisted**.
- `let` and `const` stay in the **Temporal Dead Zone** until declared.
- `var` can be **re-declared**.
- `const` prevents **reassignment**, not object mutation.
- Prefer **`const` by default**, use **`let` when reassignment is required**, and avoid **`var`** in modern JavaScript.

</details>

---

# 4. What is the Temporal Dead Zone (TDZ)?

**🎯 Short Answer**

The **Temporal Dead Zone (TDZ)** is the period between entering a scope and the point where a `let` or `const` variable is declared. During this period, the variable **exists** but **cannot be accessed**. Attempting to do so results in a `ReferenceError`.

```javascript
console.log(a); // ReferenceError

let a = 10;
```

> **Note:** `var` is **not** affected by the TDZ because it is initialized with `undefined` during hoisting.

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## What is the TDZ?

When JavaScript enters a new scope, it **hoists** all variable declarations.

- `var` is hoisted **and initialized with `undefined`**.
- `let` and `const` are hoisted **but remain uninitialized** until their declaration is reached.

The time between entering the scope and the declaration is called the **Temporal Dead Zone (TDZ)**.

---

## Example

```javascript
console.log(a); // ❌ ReferenceError

let a = 10;
```

Although `a` is hoisted, it cannot be accessed before its declaration.

---

## `var` vs `let`

### Using `var`

```javascript
console.log(a); // undefined

var a = 10;
```

`var` is initialized with `undefined`, so no error occurs.

---

### Using `let`

```javascript
console.log(a); // ReferenceError

let a = 10;
```

`let` is hoisted but remains in the TDZ until the declaration.

---

## `const` also has TDZ

```javascript
console.log(PI); // ReferenceError

const PI = 3.14;
```

`const` behaves the same as `let` regarding the TDZ.

---

## TDZ Exists Only Before Declaration

Once the declaration is executed, the variable becomes accessible.

```javascript
let a = 10;

console.log(a); // 10
```

---

## TDZ Inside Blocks

Each block has its own TDZ.

```javascript
let x = 5;

{
  console.log(x); // ReferenceError

  let x = 10;
}
```

The inner `x` shadows the outer `x`, and it is in the TDZ until its declaration.

---

## Why Does TDZ Exist?

The TDZ helps catch bugs by preventing the use of variables before they are properly initialized.

Without the TDZ, accessing variables before declaration could silently return `undefined`, making bugs harder to detect.

---

## Interview Points

- The TDZ applies only to **`let`** and **`const`**.
- `var` does **not** have a TDZ.
- Variables in the TDZ are **hoisted but uninitialized**.
- Accessing a variable in the TDZ throws a **`ReferenceError`**.
- The TDZ ends when the variable's declaration is executed.

</details>

---

# 5. What is the difference between `undefined` and `null`?

**🎯 Short Answer**

Both `undefined` and `null` represent the **absence of a value**, but they have different meanings:

- **`undefined`** means a value has **not been assigned yet** (default value assigned by JavaScript).
- **`null`** means the developer has **intentionally assigned no value**.

| Feature     | `undefined`        | `null`                        |
| ----------- | ------------------ | ----------------------------- |
| Meaning     | Value not assigned | Intentional absence of value  |
| Assigned by | JavaScript         | Developer                     |
| Type        | Primitive          | Primitive                     |
| `typeof`    | `"undefined"`      | `"object"` _(historical bug)_ |

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## `undefined`

A variable is `undefined` when it has been declared but **not initialized**.

```javascript
let name;

console.log(name); // undefined
```

JavaScript automatically assigns `undefined` in several situations:

### 1. Declared but not initialized

```javascript
let age;

console.log(age); // undefined
```

### 2. Function with no return value

```javascript
function greet() {}

console.log(greet()); // undefined
```

### 3. Missing object property

```javascript
const user = {
  name: "Vamsi",
};

console.log(user.age); // undefined
```

### 4. Missing function argument

```javascript
function greet(name) {
  console.log(name);
}

greet(); // undefined
```

---

## `null`

`null` is a value that **you explicitly assign** to indicate that a variable should have **no value**.

```javascript
let user = null;

console.log(user); // null
```

Example:

```javascript
let selectedUser = null;

// Later...
selectedUser = {
  name: "Vamsi",
};
```

Here, `null` indicates that no user is selected yet.

---

## `typeof`

```javascript
typeof undefined; // "undefined"
typeof null; // "object"
```

> `typeof null` returning `"object"` is a **historical JavaScript bug** preserved for backward compatibility.

---

## Equality Comparison

### Loose Equality (`==`)

```javascript
null == undefined; // true
```

JavaScript considers them loosely equal.

---

### Strict Equality (`===`)

```javascript
null === undefined; // false
```

They are different values and different types.

---

## When Should You Use Them?

### Use `undefined`

Let JavaScript use it naturally for:

- Uninitialized variables
- Missing object properties
- Missing function arguments
- Functions with no return value

### Use `null`

Use it when you want to explicitly indicate:

- No object
- No data
- Empty value
- Resetting a variable

Example:

```javascript
let currentUser = null;
```

---

## Interview Points

- Both represent the absence of a value.
- `undefined` is assigned by **JavaScript**.
- `null` is assigned by the **developer**.
- `typeof undefined` → `"undefined"`.
- `typeof null` → `"object"` (historical bug).
- `null == undefined` → `true`.
- `null === undefined` → `false`.
- Prefer `null` when you intentionally want to represent "no value."

</details>

---

# 6. What are the falsy values in JavaScript?

**🎯 Short Answer**

A **falsy** value is a value that JavaScript automatically converts to `false` when used in a boolean context (e.g., `if`, `while`, logical operators).

JavaScript has **8 falsy values**:

1. `false`
2. `0`
3. `-0`
4. `0n` (BigInt zero)
5. `""` (Empty string)
6. `null`
7. `undefined`
8. `NaN`

Everything else is **truthy**.

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## What are Falsy Values?

Whenever JavaScript expects a boolean value, it automatically performs **type coercion**.

For example:

```javascript
if (value) {
  console.log("Truthy");
} else {
  console.log("Falsy");
}
```

If `value` is one of the 8 falsy values, the `else` block executes.

---

## The 8 Falsy Values

| Value       | Description                  |
| ----------- | ---------------------------- |
| `false`     | Boolean false                |
| `0`         | Number zero                  |
| `-0`        | Negative zero                |
| `0n`        | BigInt zero                  |
| `""`        | Empty string                 |
| `null`      | Intentional absence of value |
| `undefined` | Value not assigned           |
| `NaN`       | Not a Number                 |

---

## Examples

### `false`

```javascript
if (false) {
  console.log("Won't execute");
}
```

---

### `0`

```javascript
if (0) {
  console.log("Won't execute");
}
```

---

### Empty String

```javascript
if ("") {
  console.log("Won't execute");
}
```

---

### `null`

```javascript
if (null) {
  console.log("Won't execute");
}
```

---

### `undefined`

```javascript
if (undefined) {
  console.log("Won't execute");
}
```

---

### `NaN`

```javascript
if (NaN) {
  console.log("Won't execute");
}
```

---

## Truthy Values

Everything that is **not falsy** is truthy.

Examples:

```javascript
true
1
-1
"Hello"
[]
{}
function() {}
42n
```

Example:

```javascript
if ([]) {
  console.log("Truthy");
}
```

Output:

```
Truthy
```

Even an **empty array** is truthy.

Similarly,

```javascript
if ({}) {
  console.log("Truthy");
}
```

Output:

```
Truthy
```

Even an **empty object** is truthy.

---

## Boolean Conversion

You can explicitly convert a value to a boolean using the `Boolean()` function or the double NOT (`!!`) operator.

```javascript
Boolean(0); // false
Boolean("Hi"); // true

!!0; // false
!!"Hi"; // true
```

---

## Common Interview Traps

### Empty Array

```javascript
Boolean([]); // true
```

---

### Empty Object

```javascript
Boolean({}); // true
```

---

### String `"0"`

```javascript
Boolean("0"); // true
```

---

### String `"false"`

```javascript
Boolean("false"); // true
```

Strings are truthy unless they are empty (`""`).

---

## Interview Points

- JavaScript has **8 falsy values**.
- Everything else is **truthy**.
- Empty arrays (`[]`) and empty objects (`{}`) are **truthy**.
- `"0"` and `"false"` are strings, so they are **truthy**.
- `Boolean()` and `!!` can be used to convert values to boolean.

</details>

---

# 7. How do you reliably check if a value is `NaN`?

**🎯 Short Answer**

The **recommended** way to check if a value is `NaN` is to use **`Number.isNaN()`**.

```javascript
Number.isNaN(value);
```

Avoid using the global `isNaN()` because it **performs type coercion**, which can lead to unexpected results.

---

| Method           | Recommended? | Performs Type Coercion? |
| ---------------- | ------------ | ----------------------- |
| `Number.isNaN()` | ✅ Yes       | ❌ No                   |
| `isNaN()`        | ❌ No        | ✅ Yes                  |

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## What is `NaN`?

`NaN` stands for **Not a Number**.

It represents an **invalid numeric result**.

Example:

```javascript
0 / 0; // NaN
Number("abc"); // NaN
Math.sqrt(-1); // NaN
```

---

## Why Not Use `isNaN()`?

The global `isNaN()` first converts the value to a number before checking it.

```javascript
isNaN("Hello"); // true
```

Why?

```javascript
Number("Hello"); // NaN
```

Since `"Hello"` becomes `NaN`, `isNaN()` returns `true`.

More examples:

```javascript
isNaN("123"); // false
isNaN(true); // false
isNaN(""); // false
```

These results can be confusing because of type coercion.

---

## Use `Number.isNaN()`

`Number.isNaN()` **does not perform type coercion**.

It returns `true` **only if the value is actually `NaN`**.

```javascript
Number.isNaN(NaN); // true
Number.isNaN("Hello"); // false
Number.isNaN("123"); // false
Number.isNaN(123); // false
```

This makes it the preferred and more reliable choice.

---

## Interesting Interview Question

### Why does this return `false`?

```javascript
NaN === NaN;
```

Output:

```javascript
false;
```

According to the IEEE 754 floating-point standard, **`NaN` is not equal to any value, including itself**.

---

## Another Way to Check for `NaN`

Since `NaN` is the **only JavaScript value that is not equal to itself**, you can do:

```javascript
value !== value;
```

Example:

```javascript
const value = NaN;

console.log(value !== value); // true
```

> ⚠️ This works but is **not recommended** because it is less readable than `Number.isNaN()`.

---

## Interview Points

- Use **`Number.isNaN()`** to check for `NaN`.
- Avoid the global **`isNaN()`** because it performs type coercion.
- `NaN === NaN` is `false`.
- `NaN` is the **only value in JavaScript that is not equal to itself**.

</details>

---

# 8. What is the difference between primitive values and reference values?

**🎯 Short Answer**

The main difference is **how they are stored and copied**.

- **Primitive values** are stored directly and copied **by value**.
- **Reference values (Objects)** are stored in memory, and variables hold a **reference (address)** to them. They are copied **by reference (more accurately, by copying the reference)**.

| Primitive Values  | Reference Values      |
| ----------------- | --------------------- |
| Stored directly   | Stored by reference   |
| Copied by value   | Reference is copied   |
| Immutable         | Usually mutable       |
| Compared by value | Compared by reference |

---

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## Primitive Values

JavaScript has **7 primitive data types**:

- String
- Number
- Boolean
- Undefined
- Null
- Symbol
- BigInt

When you assign a primitive value to another variable, **a copy of the value is created**.

```javascript
let a = 10;
let b = a;

b = 20;

console.log(a); // 10
console.log(b); // 20
```

Changing `b` does **not** affect `a` because each variable has its own copy.

---

## Reference Values

Objects, Arrays, Functions, Maps, Sets, Dates, etc., are **reference values**.

When you assign one object to another variable, JavaScript copies the **reference**, not the actual object.

```javascript
const user1 = {
  name: "Vamsi",
};

const user2 = user1;

user2.name = "Krishna";

console.log(user1.name); // Krishna
console.log(user2.name); // Krishna
```

Both variables point to the **same object**.

---

## Primitive Comparison

Primitives are compared by **value**.

```javascript
10 === 10; // true
"Hello" === "Hello"; // true
```

---

## Reference Comparison

Objects are compared by **reference**, not by their contents.

```javascript
const obj1 = { name: "John" };
const obj2 = { name: "John" };

console.log(obj1 === obj2); // false
```

Although the objects contain the same data, they are different objects in memory.

If both variables reference the same object:

```javascript
const obj1 = { name: "John" };
const obj2 = obj1;

console.log(obj1 === obj2); // true
```

---

## Are Primitive Values Mutable?

No.

Primitive values are **immutable**.

Example:

```javascript
let str = "Hello";

str[0] = "Y";

console.log(str); // "Hello"
```

A new string must be created to change its value.

---

## Are Objects Mutable?

Yes.

Their properties can be modified.

```javascript
const person = {
  age: 25,
};

person.age = 26;

console.log(person.age); // 26
```

---

## Common Interview Trap

### Does JavaScript Pass Objects by Reference?

Not exactly.

JavaScript **always passes arguments by value**.

For objects, the **value being copied is the reference (memory address)**.

```javascript
const obj1 = { name: "John" };
const obj2 = obj1;
```

Here, the reference is copied, so both variables point to the same object.

---

## Interview Points

- Primitive values are copied **by value**.
- Objects are copied by **copying the reference**.
- Primitive values are **immutable**.
- Objects are generally **mutable**.
- Objects are compared by **reference**, not by their contents.
- JavaScript is **pass-by-value**. For objects, the value being copied is the reference.

</details>

---

# 9. What is the difference between `==` and `===`?

**🎯 Short Answer**

The difference is **type coercion**.

- **`==` (Loose Equality)** compares values **after performing type coercion** if the types are different.
- **`===` (Strict Equality)** compares both **value and type** without performing type coercion.

> **Best Practice:** Always prefer `===` unless you specifically need type coercion.

| Operator | Compares Value | Compares Type | Type Coercion |
| -------- | -------------- | ------------- | ------------- |
| `==`     | ✅ Yes         | ❌ No         | ✅ Yes        |
| `===`    | ✅ Yes         | ✅ Yes        | ❌ No         |

---

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## Loose Equality (`==`)

When the operands are of different types, JavaScript tries to convert them to a common type before comparing.

```javascript
5 == "5"; // true
```

JavaScript converts `"5"` to `5`.

Another example:

```javascript
true == 1; // true
```

`true` is converted to `1`.

---

## Strict Equality (`===`)

`===` compares both the **type** and the **value**.

If the types are different, it immediately returns `false`.

```javascript
5 === "5"; // false
```

Number and String are different types.

---

## Examples

```javascript
10 == 10; // true
10 === 10; // true
```

---

```javascript
10 == "10"; // true
10 === "10"; // false
```

---

```javascript
false == 0; // true
false === 0; // false
```

---

```javascript
null == undefined; // true
null === undefined; // false
```

---

## Objects

Objects are compared by **reference**, regardless of whether you use `==` or `===`.

```javascript
const obj1 = { name: "John" };
const obj2 = { name: "John" };

console.log(obj1 == obj2); // false
console.log(obj1 === obj2); // false
```

Both operators compare object references, not their contents.

---

## Common Interview Traps

### Empty String

```javascript
"" == false; // true
```

Because both are coerced to `0`.

---

### Empty Array

```javascript
[] == false; // true
```

The empty array is converted to an empty string (`""`), which is then converted to `0`.

---

### String and Boolean

```javascript
"1" == true; // true
```

Both become the number `1`.

---

### `null` and `undefined`

```javascript
null == undefined; // true
```

This is a special rule in JavaScript's loose equality algorithm.

---

## When Should You Use `===`?

Use `===` in almost all cases.

```javascript
if (userId === 10) {
  // Preferred
}
```

It avoids unexpected results caused by automatic type conversion.

---

## Interview Points

- `==` performs **type coercion** before comparison.
- `===` compares both **type and value** without coercion.
- Prefer `===` for predictable and safer comparisons.
- Objects are compared by **reference**, not by their contents.
- `null == undefined` is `true`, but `null === undefined` is `false`.

</details>

---

# 10. What is the difference between `Object.is()` and `===`?

**🎯 Short Answer**

Both `Object.is()` and `===` compare two values **without type coercion**, but they differ in **two special cases**:

1. **`NaN`**
2. **`+0` and `-0`**

| Comparison      | `===`         | `Object.is()` |
| --------------- | ------------- | ------------- |
| `NaN` vs `NaN`  | ❌ `false`    | ✅ `true`     |
| `+0` vs `-0`    | ✅ `true`     | ❌ `false`    |
| Everything else | Same behavior | Same behavior |

---

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## `===` (Strict Equality)

`===` compares both the **value** and the **type** without performing type coercion.

```javascript
10 === 10; // true
10 === "10"; // false
```

However, it has two special behaviors:

```javascript
NaN === NaN; // false
```

```javascript
+0 === -0; // true
```

---

## `Object.is()`

`Object.is()` also compares values without type coercion, but it follows the **SameValue** comparison algorithm.

```javascript
Object.is(10, 10); // true
Object.is(10, "10"); // false
```

Unlike `===`, it correctly handles `NaN` and distinguishes between `+0` and `-0`.

---

## Difference 1: `NaN`

With `===`:

```javascript
NaN === NaN; // false
```

With `Object.is()`:

```javascript
Object.is(NaN, NaN); // true
```

This is because `Object.is()` considers two `NaN` values to be the same.

---

## Difference 2: `+0` and `-0`

With `===`:

```javascript
+0 === -0; // true
```

With `Object.is()`:

```javascript
Object.is(+0, -0); // false
```

`Object.is()` treats positive zero and negative zero as different values.

---

## Comparison Examples

```javascript
Object.is(5, 5); // true
5 === 5; // true
```

---

```javascript
Object.is("Hi", "Hi"); // true
"Hi" === "Hi"; // true
```

---

```javascript
Object.is({}, {}); // false
{} === {};         // false
```

Objects are compared by reference in both cases.

---

## When Should You Use `Object.is()`?

Use `Object.is()` when you need to:

- Correctly compare `NaN`
- Distinguish between `+0` and `-0`

Otherwise, `===` is sufficient for most comparisons.

---

## Interview Points

- Both `Object.is()` and `===` **do not perform type coercion**.
- `Object.is(NaN, NaN)` returns `true`.
- `NaN === NaN` returns `false`.
- `Object.is(+0, -0)` returns `false`.
- `+0 === -0` returns `true`.
- For most comparisons, `===` is the preferred choice.

</details>

---

# 11. What is a BigInt, and when would you use one?

**🎯 Short Answer**

`BigInt` is a primitive data type introduced in **ES2020** that allows JavaScript to represent **integers larger than `Number.MAX_SAFE_INTEGER`** without losing precision.

Use `BigInt` when working with **very large whole numbers**, such as financial calculations, cryptography, scientific computations, or large database IDs.

```javascript
const big = 123456789012345678901234567890n;
```

> **Note:** A `BigInt` is created by appending `n` to an integer or by using the `BigInt()` constructor.

---

| Feature              | `Number`                | `BigInt`              |
| -------------------- | ----------------------- | --------------------- |
| Supports decimals    | ✅ Yes                  | ❌ No                 |
| Maximum safe integer | `9,007,199,254,740,991` | Practically unlimited |
| Type                 | `"number"`              | `"bigint"`            |

---

<details>
<summary><strong>📖 Explanation (Click to Expand)</strong></summary>

## Why Do We Need BigInt?

JavaScript's `Number` type uses the **IEEE 754 double-precision floating-point format**, which can safely represent integers only up to:

```javascript
Number.MAX_SAFE_INTEGER;
// 9007199254740991
```

Beyond this limit, JavaScript starts losing precision.

Example:

```javascript
console.log(Number.MAX_SAFE_INTEGER + 1);
// 9007199254740992

console.log(Number.MAX_SAFE_INTEGER + 2);
// 9007199254740992 ❌
```

Both expressions produce the same result because precision is lost.

---

## Using BigInt

Append `n` to an integer.

```javascript
const big = 9007199254740993n;

console.log(big);
```

Or use the `BigInt()` constructor.

```javascript
const big = BigInt("9007199254740993123456789");
```

---

## Type of BigInt

```javascript
typeof 10n;
// "bigint"
```

---

## BigInt Operations

```javascript
const a = 100n;
const b = 50n;

console.log(a + b); // 150n
console.log(a - b); // 50n
console.log(a * b); // 5000n
console.log(a / b); // 2n
```

---

## Mixing `Number` and `BigInt`

You **cannot** mix them directly.

```javascript
10n + 5;
```

Output:

```text
TypeError
```

Convert one type before performing operations.

```javascript
10n + BigInt(5); // 15n
```

or

```javascript
Number(10n) + 5; // 15
```

---

## Limitations

### No Decimal Values

```javascript
10.5n;
```

Output:

```text
SyntaxError
```

BigInt can only represent **integers**.

---

### Math Object Doesn't Support BigInt

```javascript
Math.sqrt(16n);
```

Output:

```text
TypeError
```

Most `Math` methods work only with `Number`.

---

## When Should You Use BigInt?

Use `BigInt` when working with:

- Very large integers
- Financial systems (large amounts)
- Cryptography
- Scientific calculations
- Large database or distributed system IDs

For everyday calculations, `Number` is usually sufficient.

---

## Interview Points

- `BigInt` is a **primitive data type** introduced in **ES2020**.
- It stores integers larger than `Number.MAX_SAFE_INTEGER`.
- Create a `BigInt` using the `n` suffix or `BigInt()`.
- `BigInt` cannot store decimal values.
- You cannot mix `BigInt` and `Number` without explicit conversion.
- Use `BigInt` only when large integer precision is required.

</details>

---

# 12. Is javascript pass by value or pass by reference ?

# JavaScript: Pass by Value or Pass by Reference?

This is one of the most common JavaScript interview questions.

Many developers say:

> "Primitives are passed by value and objects are passed by reference."

This is **not technically correct**.

## Short Answer

> **JavaScript is always pass-by-value.**

There is **no pass-by-reference** in JavaScript.

The confusion comes from **what the value actually is**.

- **Primitive values** → The value is the actual data (`10`, `"Hello"`, `true`, etc.).
- **Objects, Arrays, Functions** → The value is a **reference (memory address)** to the object.

So, JavaScript **passes the reference by value**, not the object itself.

---

# Understanding Memory

## Primitive Example

```js
let x = 10;
```

Memory:

```
Stack

x
┌────┐
│10  │
└────┘
```

The variable stores the **actual value**.

---

## Object Example

```js
let person = {
  name: "John",
};
```

Memory:

```
Stack                      Heap

person
┌─────────┐
│0x100    │──────────────► {
└─────────┘                  name: "John"
                            }
```

Notice something important:

`person` **does not contain the object.**

It contains:

```
0x100
```

which is the memory address (reference) of the object.

That address is itself just another value.

---

# Primitive Example

```js
let a = 10;

function change(x) {
  x = 20;
}

change(a);

console.log(a);
```

Output

```text
10
```

## What happens?

Initially:

```
a = 10
```

Calling:

```js
change(a);
```

copies the value.

```
a = 10

↓

x = 10
```

Now inside the function:

```js
x = 20;
```

Only `x` changes.

```
a = 10
x = 20
```

So the original variable remains unchanged.

---

# Object Example

```js
let person = {
  name: "John",
};

function update(obj) {
  obj.name = "Alice";
}

update(person);

console.log(person.name);
```

Output

```text
Alice
```

Many people now say:

> "Objects are passed by reference."

Not exactly.

Let's see what actually happens.

Initially:

```
Stack

person
│0x100│

Heap

0x100
{
  name: "John"
}
```

Calling:

```js
update(person);
```

copies the value.

But what is the value?

```
0x100
```

Now:

```
person
│0x100│

obj
│0x100│
```

Both variables contain the **same address**.

```
person ───┐
           │
obj ───────┘

          ▼

{
  name: "John"
}
```

When we execute:

```js
obj.name = "Alice";
```

both variables still point to the same object.

The object becomes:

```
{
  name: "Alice"
}
```

So:

```js
console.log(person.name);
```

prints:

```text
Alice
```

---

# Reassigning the Object

Now consider this example:

```js
function change(obj) {
  obj = {
    name: "Bob",
  };
}

let person = {
  name: "John",
};

change(person);

console.log(person.name);
```

Many beginners expect:

```text
Bob
```

Actual output:

```text
John
```

## Why?

Initially:

```
person

│0x100│
```

Calling the function copies the value:

```
obj

│0x100│
```

Then:

```js
obj = {
  name: "Bob",
};
```

creates a **new object**.

Memory now becomes:

```
Heap

0x100
{
  name: "John"
}

0x200
{
  name: "Bob"
}
```

Now:

```
person

│0x100│
```

and

```
obj

│0x200│
```

point to different objects.

```
person ─────────► {
                    name: "John"
                 }

obj ────────────► {
                    name: "Bob"
                 }
```

Since `person` never changed its reference, it still points to the original object.

---

# Visual Summary

## Before Reassignment

```
person ──────┐
             │
obj ─────────┘

          ▼

{
  name: "John"
}
```

## After

```js
obj = { name: "Bob" };
```

```
person ─────────────► {
                        name: "John"
                     }

obj ────────────────► {
                        name: "Bob"
                     }
```

Only `obj` starts pointing to a new object.

The original object is untouched.

---

# The Rule

## Primitive

```
Variable
   │
   ▼
  10
```

The copied value is:

```
10
```

---

## Object

```
Variable
   │
   ▼
0x100
```

The copied value is:

```
0x100
```

That value happens to be a memory address.

The address is copied—not the object.

---

# Why Do People Say "Pass by Reference"?

Consider:

```js
let a = { x: 1 };
let b = a;

b.x = 100;

console.log(a.x);
```

Output:

```text
100
```

Memory:

```
a

│0x100│

b

│0x100│
```

Both variables contain the **same copied reference value**.

Changing the object's properties through either variable affects the same object.

This often leads people to incorrectly say:

> "Objects are passed by reference."

The correct statement is:

> "The reference is passed by value."

---

# Interview Answer

> JavaScript is always **pass-by-value**.
>
> - For primitive values, the actual value is copied.
> - For objects, arrays, and functions, the copied value is the reference (memory address) to the object.
> - This allows multiple variables to point to the same object, so changes to the object's properties are visible through all references.
> - However, reassigning the parameter to a new object does not affect the original variable because only the copied reference changes.
>
> This behavior is often called **pass-by-sharing** or **call-by-sharing**, not pass-by-reference.

---

# Quick Comparison

| Feature                                                | Primitive    | Object                     |
| ------------------------------------------------------ | ------------ | -------------------------- |
| Value stored in variable                               | Actual value | Reference (memory address) |
| Value passed to function                               | Actual value | Reference value            |
| Assignment inside function affects original variable?  | ❌ No        | ❌ No                      |
| Modifying object's properties affects original object? | N/A          | ✅ Yes                     |
| Reassigning parameter affects caller?                  | ❌ No        | ❌ No                      |

---

# Key Takeaway

> **JavaScript never passes variables by reference.**

- Primitive variables store actual values.
- Object variables store references (memory addresses).
- When passing arguments, JavaScript always copies the value.
- For objects, the copied value is simply the object's reference.

This is why JavaScript is accurately described as **pass-by-value**, with objects being **passed by sharing (call-by-sharing)**.
