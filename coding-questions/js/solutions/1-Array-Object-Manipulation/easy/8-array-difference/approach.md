# Array Difference

## Problem Statement

Implement a function that returns elements that are present in the first array but not in the second array.

---

## Example 1

### Input

```js
difference([1, 2, 3, 4], [3, 4, 5]);
```

### Output

```js
[1, 2];
```

---

## Example 2

### Input

```js
difference(["apple", "banana", "orange"], ["banana"]);
```

### Output

```js
["apple", "orange"];
```

---

# What is the Interviewer Asking?

Remove all elements from the first array that also exist in the second array.

### Array 1

```txt
[1, 2, 3, 4]
```

### Array 2

```txt
[3, 4, 5]
```

### Visualization

```txt
Array 1: 1  2  3  4
                 ❌  ❌

Array 2:    3  4  5
```

Keep only:

```txt
1, 2
```

---

# Difference vs Intersection

### Intersection

```js
[1, 2, 3, 4][(3, 4, 5)];
```

Output:

```js
[3, 4];
```

(Common elements)

---

### Difference

```js
[1, 2, 3, 4][(3, 4, 5)];
```

Output:

```js
[1, 2];
```

(Elements only in first array)

---

# Intuition

1. Store second array in a Set.
2. Traverse first array.
3. Keep elements that are NOT present in the Set.

---

# Solution (Most Common)

```js
function difference(arr1, arr2) {
  const set2 = new Set(arr2);

  return arr1.filter((item) => !set2.has(item));
}
```

---

# Walkthrough

### Input

```js
arr1 = [1, 2, 3, 4];
arr2 = [3, 4, 5];
```

---

### Step 1

```js
set2 = {3, 4, 5}
```

---

### Step 2

Check `1`

```js
set2.has(1);
```

```txt
false
```

Keep it.

```js
[1];
```

---

### Step 3

Check `2`

```js
set2.has(2);
```

```txt
false
```

Keep it.

```js
[1, 2];
```

---

### Step 4

Check `3`

```js
set2.has(3);
```

```txt
true
```

Remove it.

---

### Step 5

Check `4`

```js
set2.has(4);
```

```txt
true
```

Remove it.

---

## Final Output

```js
[1, 2];
```

---

# Alternative Solution

```js
function difference(arr1, arr2) {
  return arr1.filter((item) => !arr2.includes(item));
}
```

### Note

This is simpler but slower because:

```js
includes();
```

is O(n) for every element.

---

# Common Interview Variations

## Variation 1

Find numbers present only in the first array.

### Input

```js
[1, 2, 3, 4][(3, 4)];
```

### Output

```js
[1, 2];
```

---

## Variation 2

Find strings present only in the first array.

### Input

```js
["apple", "banana", "orange"]["banana"];
```

### Output

```js
["apple", "orange"];
```

---

## Variation 3

Symmetric Difference

Find elements that appear in either array but not both.

### Input

```js
[1, 2, 3][(3, 4, 5)];
```

### Output

```js
[1, 2, 4, 5];
```

### Solution

```js
function symmetricDifference(arr1, arr2) {
  const diff1 = difference(arr1, arr2);
  const diff2 = difference(arr2, arr1);

  return [...diff1, ...diff2];
}
```

---

# Time Complexity

### Set Solution

```txt
O(n + m)
```

Where:

```txt
n = arr1.length
m = arr2.length
```

---

# Space Complexity

```txt
O(m)
```

For the Set.

---

# Interview Answer (Short)

Array Difference means finding elements that exist in the first array but not in the second array. The optimal solution stores the second array in a Set and filters elements from the first array that are not present in the Set.

```js
const set2 = new Set(arr2);

return arr1.filter((item) => !set2.has(item));
```

Time Complexity: **O(n + m)**  
Space Complexity: **O(m)**
