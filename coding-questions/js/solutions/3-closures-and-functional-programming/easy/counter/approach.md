# Counter Using Closure in JavaScript

## What is a Closure?

A **closure** is a function that remembers variables from its outer scope even after the outer function has finished executing.

---

## Counter Using Closure

```javascript
function createCounter() {
  let count = 0;

  return function () {
    return count++;
  };
}

const counter = createCounter();

console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

---

## How It Works

### Step 1

```javascript
const counter = createCounter();
```

- `count` is initialized to `0`.
- The inner function is returned.
- The inner function forms a **closure**, so it remembers `count`.

---

### Step 2

```javascript
counter();
```

Returns:

```text
0
```

Then increments:

```text
count = 1
```

---

### Step 3

```javascript
counter();
```

Returns:

```text
1
```

Then increments:

```text
count = 2
```

---

## Visualization

```text
createCounter()

count = 0
      │
      ▼
Returned Function
      │
      ▼

counter() → 0
count = 1

counter() → 1
count = 2

counter() → 2
count = 3
```

---

## Why Does It Work?

The variable `count` doesn't disappear after `createCounter()` finishes.

The returned function **closes over** `count`, so it can read and update it every time it's called.

---

## Key Points

- Closure remembers variables from the outer function.
- `count` is private and cannot be accessed directly.
- Every call updates the same `count`.
- Each counter has its own independent state.

```javascript
const c1 = createCounter();
const c2 = createCounter();

console.log(c1()); // 0
console.log(c1()); // 1

console.log(c2()); // 0
console.log(c2()); // 1
```
