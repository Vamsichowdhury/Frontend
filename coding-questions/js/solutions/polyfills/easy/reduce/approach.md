# Understanding `Array.prototype.reduce()`

## What is `reduce()`?

`reduce()` transforms an array into a **single value** by repeatedly combining elements.

The result can be a:

- Number
- String
- Object
- Array
- Any other data type

Unlike `map()`, which returns a new array, `reduce()` returns **one final value**.

---

# Syntax

```javascript
array.reduce(callback, initialValue);
```

The callback receives:

```javascript
callback(accumulator, currentElement, currentIndex, array);
```

- **accumulator** → Running result
- **currentElement** → Current item
- **currentIndex** → Current index
- **array** → Original array

---

# Example

```javascript
const nums = [10, 20, 30, 40];

const sum = nums.reduce((acc, curr) => acc + curr, 0);

console.log(sum); // 100
```

---

# How It Works

```text
Initial acc = 0

0 + 10 = 10
10 + 20 = 30
30 + 30 = 60
60 + 40 = 100

Return 100
```

The value returned from each callback becomes the accumulator for the next iteration.

---

# Without Initial Value

```javascript
const nums = [10, 20, 30];

nums.reduce((acc, curr) => acc + curr);
```

JavaScript automatically:

- Uses the **first element** as `acc`
- Starts iterating from **index 1**

```text
acc = 10

10 + 20 = 30
30 + 30 = 60
```

---

# Mental Model

```text
acc = initialValue

for each element:
    acc = callback(acc, currentElement, currentIndex, array)

return acc
```

If no initial value is provided:

```text
acc = first element
Loop starts from index 1
```

---

# Key Takeaways

- `reduce()` converts an array into a **single value**.
- The **accumulator** stores the running result.
- Whatever the callback returns becomes the next accumulator.
- With an initial value, iteration starts at **index 0**.
- Without an initial value, the first element becomes the accumulator, and iteration starts at **index 1**.
- Internally, `reduce()` is simply a loop that updates the accumulator and returns it at the end.
