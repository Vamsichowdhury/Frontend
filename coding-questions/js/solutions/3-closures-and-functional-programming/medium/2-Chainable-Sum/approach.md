# Chainable Sum

## Problem Statement

Implement a function `add` that supports method chaining.

The function should allow multiple `.add()` calls and return the final sum only when `.value()` is called.

### Example

```javascript
add(1).add(2).add(3).value(); // 6
add(10).add(20).value(); // 30
add(100).value(); // 100
```

---

# Intuition

Normally, we write:

```javascript
1 + 2 + 3;
```

or

```javascript
sum(1, 2, 3);
```

But here the interviewer wants:

```javascript
add(1).add(2).add(3).value();
```

Each `.add()` should:

- Remember the previous total.
- Update the total.
- Return itself so another `.add()` can be called.

The final answer is returned only when `.value()` is called.

This is achieved using **closures** and **method chaining**.

---

# Approach

1. Store the initial number in a variable `total`.
2. Return an object containing:
   - `add()`
   - `value()`
3. Inside `add()`:
   - Update `total`.
   - Return `this` for chaining.
4. Inside `value()`:
   - Return `total`.

---

# Solution

```javascript
function add(num) {
  let total = num;

  return {
    add(next) {
      total += next;
      return this;
    },

    value() {
      return total;
    },
  };
}
```

---

# Example

```javascript
console.log(add(1).add(2).add(3).value());
// 6

console.log(add(5).add(10).add(20).value());
// 35

console.log(add(100).value());
// 100
```

---

# Dry Run

```javascript
add(5).add(10).add(20).value();
```

```
total = 5

↓

add(10)

total = 15

↓

add(20)

total = 35

↓

value()

35
```

---

# Why `return this`?

`this` refers to the same object.

Returning it allows another method call.

```javascript
const obj = {
  add() {
    return this;
  },

  value() {
    return 10;
  },
};

obj.add().value(); // 10
```

Similarly,

```javascript
add(1).add(2).add(3).value();
```

works because every `.add()` returns the same object.

---

# Complexity

**Time:** `O(1)` per `add()` call (`O(n)` for `n` chained calls)

**Space:** `O(1)`

---

# Concepts Tested

- Closures
- Method Chaining
- `this`
- Objects
- Function Scope

---

# Follow-up Questions

- Why does `return this` enable chaining?
- What is a closure?
- Can you implement this using a class?
- Can you make it immutable?
- Can you implement:

```javascript
add(1)(2)(3)(4)();
```

instead of using `.add()`?

---

# Chainable Sum

## Problem Statement

Implement a function `add` that supports method chaining.

The function should allow multiple `.add()` calls and return the final sum only when `.value()` is called.

### Example

```javascript
add(1).add(2).add(3).value(); // 6
add(10).add(20).value(); // 30
add(100).value(); // 100
```

---

# Intuition

Normally, we write:

```javascript
1 + 2 + 3;
```

or

```javascript
sum(1, 2, 3);
```

But here the interviewer wants:

```javascript
add(1).add(2).add(3).value();
```

Each `.add()` should:

- Remember the previous total.
- Update the total.
- Return itself so another `.add()` can be called.

The final answer is returned only when `.value()` is called.

This is achieved using **closures** and **method chaining**.

---

# Approach

1. Store the initial number in a variable `total`.
2. Return an object containing:
   - `add()`
   - `value()`
3. Inside `add()`:
   - Update `total`.
   - Return `this` for chaining.
4. Inside `value()`:
   - Return `total`.

---

# Code

```javascript
function add(num) {
  // Store the running total
  let total = num;

  // Return an object with chainable methods
  return {
    add(next) {
      total += next;
      return this; // Enables chaining
    },

    value() {
      return total;
    },
  };
}
```

---

# Example

```javascript
console.log(add(1).add(2).add(3).value());
// 6

console.log(add(5).add(10).add(20).value());
// 35

console.log(add(100).value());
// 100

console.log(add(-5).add(15).add(-2).value());
// 8
```

---

# Dry Run

```javascript
add(5).add(10).add(20).value();
```

```
Initial:
total = 5

↓

add(10)
total = 15

↓

add(20)
total = 35

↓

value()

35
```

---

# Why `return this`?

`this` refers to the object returned by `add()`.

Returning it allows the next method to be called on the same object.

```javascript
const calculator = {
  total: 0,

  add(num) {
    this.total += num;
    return this;
  },

  value() {
    return this.total;
  },
};

console.log(calculator.add(5).add(10).value()); // 15
```

Similarly,

```javascript
add(1).add(2).add(3).value();
```

works because every `.add()` returns the same object.

---

# Complexity

**Time Complexity:** `O(1)` per `.add()` call (`O(n)` for `n` chained calls)

**Space Complexity:** `O(1)`

---

# Concepts Tested

- Closures
- Method Chaining
- Objects
- `this`
- Function Scope

---

# Follow-up Questions

- Why does `return this` enable chaining?
- What is a closure?
- Can you implement this using a class?
- Can you make it immutable?
- Can you implement:

```javascript
add(1)(2)(3)(4)();
```

instead of using `.add()`?
