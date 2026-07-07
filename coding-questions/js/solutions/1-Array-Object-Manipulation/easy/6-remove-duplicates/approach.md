# Remove Duplicates from Array

## Problem Statement

Implement a function that removes duplicate values from an array and returns only unique values.

---

## Example 1

### Input

```js
[1, 2, 2, 3, 4, 4, 5];
```

### Output

```js
[1, 2, 3, 4, 5];
```

---

## Example 2

### Input

```js
["a", "b", "a", "c", "b"];
```

### Output

```js
["a", "b", "c"];
```

---

## Example 3

### Input

```js
[1, 1, 1, 1];
```

### Output

```js
[1];
```

---

# What is the Interviewer Asking?

Given an array, remove repeated values.

### Input

```txt
[1, 2, 2, 3, 3, 3]
```

### Visualization

```txt
1 ✅
2 ✅
2 ❌ Already seen
3 ✅
3 ❌ Already seen
3 ❌ Already seen
```

### Output

```js
[1, 2, 3];
```

---

# Most Common Solution (Set)

## Intuition

A Set automatically stores only unique values.

```js
new Set([1, 2, 2, 3]);
```

Result:

```js
Set(3) {1, 2, 3}
```

Convert it back to an array.

---

## Solution

```js
function removeDuplicates(arr) {
  return [...new Set(arr)];
}
```

---

## Walkthrough

### Input

```js
[1, 2, 2, 3, 4, 4];
```

### Step 1

```js
new Set(arr);
```

```txt
Set {1, 2, 3, 4}
```

### Step 2

```js
[...set];
```

```js
[1, 2, 3, 4];
```

---

# Manual Solution (Without Set)

## Intuition

Keep track of values we've already seen.

---

## Solution

```js
function removeDuplicates(arr) {
  const seen = {};
  const result = [];

  for (const num of arr) {
    if (!seen[num]) {
      seen[num] = true;
      result.push(num);
    }
  }

  return result;
}
```

---

## Walkthrough

### Input

```js
[1, 2, 2, 3];
```

### Step 1

```txt
seen = {}
result = []
```

---

### Step 2

```txt
1 not seen
```

```js
result = [1];
```

---

### Step 3

```txt
2 not seen
```

```js
result = [1, 2];
```

---

### Step 4

```txt
2 already seen
```

Skip.

---

### Step 5

```txt
3 not seen
```

```js
result = [1, 2, 3];
```

---

# Using filter()

```js
function removeDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
```

### How it Works

For each element:

```js
arr.indexOf(item);
```

returns the first occurrence.

Keep only elements whose first occurrence index matches the current index.

---

# Interview Variations

## Variation 1

Remove duplicate numbers.

```js
[1, 2, 2, 3, 3];
```

Output:

```js
[1, 2, 3];
```

---

## Variation 2

Remove duplicate strings.

```js
["a", "b", "a", "c"];
```

Output:

```js
["a", "b", "c"];
```

---

## Variation 3

Remove duplicate objects by id.

### Input

```js
[
  { id: 1, name: "John" },
  { id: 2, name: "Alice" },
  { id: 1, name: "John" },
];
```

### Output

```js
[
  { id: 1, name: "John" },
  { id: 2, name: "Alice" },
];
```

### Solution

```js
function removeDuplicates(arr) {
  const seen = new Set();

  return arr.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}
```

---

# Time Complexity

### Set Solution

```txt
O(n)
```

---

# Space Complexity

```txt
O(n)
```

For storing unique values.

---

# Interview Answer (Short)

To remove duplicates, use a Set because it stores only unique values. Convert the array into a Set and then back into an array.

```js
const unique = [...new Set(arr)];
```

Time Complexity: **O(n)**  
Space Complexity: **O(n)**
