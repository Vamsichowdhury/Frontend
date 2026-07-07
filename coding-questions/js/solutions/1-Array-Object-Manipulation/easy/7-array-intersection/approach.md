# Array Intersection

## Problem Statement

Implement a function that returns the common elements present in both arrays.

---

## Example 1

### Input

```js
intersection([1, 2, 3], [2, 3, 4]);
```

### Output

```js
[2, 3];
```

---

## Example 2

### Input

```js
intersection([1, 2, 2, 3], [2, 2, 4]);
```

### Output

```js
[2];
```

> Return unique common elements.

---

## What is the Interviewer Asking?

Find values that exist in **both arrays**.

### Array 1

```txt
[1, 2, 3]
```

### Array 2

```txt
[2, 3, 4]
```

### Visualization

```txt
Array 1: 1  2  3
              ↑  ↑
Array 2:    2  3  4
```

Common values:

```txt
2, 3
```

---

## Intuition

1. Put all elements of the first array into a Set.
2. Traverse the second array.
3. If an element exists in the Set, it belongs to the intersection.
4. Use another Set to avoid duplicates.

---

## Solution (Most Common)

```js
function intersection(arr1, arr2) {
  const set1 = new Set(arr1);
  const result = new Set();

  for (const num of arr2) {
    if (set1.has(num)) {
      result.add(num);
    }
  }

  return [...result];
}
```

---

## Walkthrough

### Input

```js
arr1 = [1, 2, 3];
arr2 = [2, 3, 4];
```

---

### Step 1

```js
set1 = {1, 2, 3}
```

---

### Step 2

Process `2`

```js
set1.has(2);
```

```txt
true
```

Result:

```js
{
  2;
}
```

---

### Step 3

Process `3`

```js
set1.has(3);
```

```txt
true
```

Result:

```js
{
  (2, 3);
}
```

---

### Step 4

Process `4`

```js
set1.has(4);
```

```txt
false
```

Skip.

---

## Final Output

```js
[2, 3];
```

---

# One-Line Solution

```js
function intersection(arr1, arr2) {
  return [...new Set(arr1)].filter((num) => arr2.includes(num));
}
```

---

# Common Interview Variations

## Variation 1

Find common numbers.

### Input

```js
[1, 2, 3][(2, 3, 4)];
```

### Output

```js
[2, 3];
```

---

## Variation 2

Find common strings.

### Input

```js
["apple", "banana"][("banana", "orange")];
```

### Output

```js
["banana"];
```

---

## Variation 3

LeetCode 349 - Intersection of Two Arrays

### Input

```js
nums1 = [4, 9, 5];
nums2 = [9, 4, 9, 8, 4];
```

### Output

```js
[4, 9];
```

Order doesn't matter.

---

## Variation 4

LeetCode 350 - Intersection of Two Arrays II

### Input

```js
[1, 2, 2, 1][(2, 2)];
```

### Output

```js
[2, 2];
```

Here duplicates must also be included.

### Solution

```js
function intersect(nums1, nums2) {
  const freq = {};
  const result = [];

  for (const num of nums1) {
    freq[num] = (freq[num] || 0) + 1;
  }

  for (const num of nums2) {
    if (freq[num] > 0) {
      result.push(num);
      freq[num]--;
    }
  }

  return result;
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
O(n)
```

For the Set.

---

# Interview Answer (Short)

Array Intersection means finding elements that are present in both arrays. The optimal solution uses a Set for O(1) lookups and collects common elements.

```js
const set1 = new Set(arr1);

for (const num of arr2) {
  if (set1.has(num)) {
    result.add(num);
  }
}
```

Time Complexity: **O(n + m)**  
Space Complexity: **O(n)**
