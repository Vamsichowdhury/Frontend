# Understanding `Array.prototype.find()`

## What is `find()`?

`find()` returns the **first element** that matches a condition.

If no element matches, it returns **`undefined`**.

Unlike `filter()`, which returns all matching elements, `find()` stops as soon as it finds the first match.

---

# Syntax

```javascript
array.find(callback);
```

The callback receives:

```javascript
callback(currentElement, currentIndex, array);
```

- **currentElement** → Current item
- **currentIndex** → Current index
- **array** → Original array

---

# Example

```javascript
const nums = [10, 20, 30, 40];

const result = nums.find((num) => num > 25);

console.log(result); // 30
```

---

# How It Works

```text
10 > 25 ❌
20 > 25 ❌
30 > 25 ✅

Return 30
```

`find()` stops immediately after finding the first matching element.

---

# If No Match Exists

```javascript
const nums = [10, 20, 30];

const result = nums.find((num) => num > 50);

console.log(result); // undefined
```

---

# Mental Model

```text
for each element:
    if callback(currentElement, currentIndex, array) is true:
        return currentElement

return undefined
```

---

# Key Takeaways

- `find()` returns the **first matching element**.
- Stops iterating once a match is found.
- Returns **`undefined`** if no element matches.
- Does **not** modify the original array.
- Returns the **element**, not its index.

```

```
