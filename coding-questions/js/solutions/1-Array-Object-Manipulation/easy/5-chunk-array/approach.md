# Chunk Array

## Problem Statement

Implement a function `chunk(array, size)` that splits an array into smaller arrays (chunks) of a specified size.

---

## Example 1

### Input

```js
chunk([1, 2, 3, 4, 5], 2);
```

### Output

```js
[[1, 2], [3, 4], [5]];
```

---

## Example 2

### Input

```js
chunk([1, 2, 3, 4, 5, 6], 3);
```

### Output

```js
[
  [1, 2, 3],
  [4, 5, 6],
];
```

---

## Example 3

### Input

```js
chunk(["a", "b", "c", "d"], 2);
```

### Output

```js
[
  ["a", "b"],
  ["c", "d"],
];
```

---

# What Does "Chunk" Mean?

Break a large array into smaller pieces.

### Input

```txt
[1, 2, 3, 4, 5, 6, 7]
```

Chunk size = 3

### Visualization

```txt
[1, 2, 3]
[4, 5, 6]
[7]
```

### Output

```js
[[1, 2, 3], [4, 5, 6], [7]];
```

---

# Intuition

Move through the array in steps of `size`.

For each position:

1. Take `size` elements.
2. Put them into a new array.
3. Add that chunk to the result.

---

# Solution

```js
function chunk(arr, size) {
  const result = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
}
```

---

# Walkthrough

### Input

```js
chunk([1, 2, 3, 4, 5], 2);
```

---

### Step 1

```js
i = 0;

arr.slice(0, 2);
```

Output:

```js
[1, 2];
```

Result:

```js
[[1, 2]];
```

---

### Step 2

```js
i = 2;

arr.slice(2, 4);
```

Output:

```js
[3, 4];
```

Result:

```js
[
  [1, 2],
  [3, 4],
];
```

---

### Step 3

```js
i = 4;

arr.slice(4, 6);
```

Output:

```js
[5];
```

Result:

```js
[[1, 2], [3, 4], [5]];
```

---

# Time Complexity

```txt
O(n)
```

Each element is visited once.

---

# Space Complexity

```txt
O(n)
```

A new chunked array is created.

---

# Interview Variations

## Variation 1

Implement:

```js
chunk([1, 2, 3, 4, 5], 2);
```

Output:

```js
[[1, 2], [3, 4], [5]];
```

---

## Variation 2

Implement Lodash's:

```js
_.chunk(array, size);
```

Example:

```js
_.chunk(["a", "b", "c", "d"], 2);
```

Output:

```js
[
  ["a", "b"],
  ["c", "d"],
];
```

---

## Variation 3

Split API results into batches.

### Input

```js
const ids = [1, 2, 3, 4, 5, 6, 7];
```

Batch size:

```js
3;
```

### Output

```js
[[1, 2, 3], [4, 5, 6], [7]];
```

Useful when making API calls in groups.

---

# Interview Answer (Short)

Chunk Array means splitting an array into smaller arrays of a fixed size. We iterate through the array in steps of `size`, take a slice of `size` elements each time, and add it to the result.
