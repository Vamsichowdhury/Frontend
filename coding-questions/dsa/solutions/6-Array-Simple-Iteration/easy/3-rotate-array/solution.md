# Rotate Array

## Problem Statement

Given an integer array `nums` and an integer `k`, rotate the array to the **right** by `k` steps.

The rotation should be done **in-place**, meaning you should not create another array for the final result.

---

## Example 1

```javascript
Input: nums = [1, 2, 3, 4, 5, 6, 7];
k = 3;

Output: [5, 6, 7, 1, 2, 3, 4];
```

### Explanation

```
Original

[1,2,3,4,5,6,7]

Rotate 1

[7,1,2,3,4,5,6]

Rotate 2

[6,7,1,2,3,4,5]

Rotate 3

[5,6,7,1,2,3,4]
```

---

## Example 2

```javascript
Input: nums = [-1, -100, 3, 99];
k = 2;

Output: [3, 99, -1, -100];
```

---

## Constraints

- `1 <= nums.length <= 10^5`
- `0 <= k <= 10^5`

---

# Intuition

Rotating the array means taking the last `k` elements and moving them to the beginning.

Example:

```
[1,2,3,4,5,6,7]

Last 3 elements

[5,6,7]

Remaining elements

[1,2,3,4]

Result

[5,6,7,1,2,3,4]
```

A brute-force approach would shift elements one by one, but that's inefficient for large `k`.

A better approach uses **array reversal**.

---

# Optimal Approach (Reverse Algorithm)

Instead of shifting elements repeatedly:

1. Reverse the entire array.
2. Reverse the first `k` elements.
3. Reverse the remaining elements.

---

## Example

```
nums = [1,2,3,4,5,6,7]
k = 3
```

### Step 1

Reverse entire array

```
[7,6,5,4,3,2,1]
```

---

### Step 2

Reverse first `k` elements

```
[5,6,7,4,3,2,1]
```

---

### Step 3

Reverse remaining elements

```
[5,6,7,1,2,3,4]
```

Done!

---

# Algorithm

1. Compute

```javascript
k = k % nums.length;
```

This handles cases where `k` is greater than the array length.

Example:

```
n = 7

k = 10

Actual rotations = 10 % 7 = 3
```

2. Reverse the entire array.
3. Reverse the first `k` elements.
4. Reverse the remaining elements.

---

# Code

```javascript
function rotate(nums, k) {
  const n = nums.length;

  k = k % n;

  reverse(nums, 0, n - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, n - 1);
}

function reverse(arr, left, right) {
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
}
```

---

# Example

```javascript
const nums = [1, 2, 3, 4, 5, 6, 7];

rotate(nums, 3);

console.log(nums);

// [5,6,7,1,2,3,4]
```

---

# Dry Run

```
nums = [1,2,3,4,5,6,7]

k = 3

↓

Reverse All

[7,6,5,4,3,2,1]

↓

Reverse First 3

[5,6,7,4,3,2,1]

↓

Reverse Remaining

[5,6,7,1,2,3,4]
```

---

# Edge Cases

### k = 0

```javascript
nums = [1, 2, 3];
k = 0;

Output: [1, 2, 3];
```

---

### k > nums.length

```javascript
nums = [1,2,3,4]

k = 6

6 % 4 = 2

Output:
[3,4,1,2]
```

---

### Single Element

```javascript
nums = [10];

k = 100;

Output: [10];
```

---

# Complexity

### Time Complexity

Each reverse traverses the array once.

```
O(n)
```

---

### Space Complexity

No extra array is used.

```
O(1)
```

---

# Concepts Tested

- Two Pointers
- Array Manipulation
- In-place Algorithms
- Modulo Operator
- Reversal Technique

---

# Common Interview Follow-up Questions

1. Can you solve it without using extra space?
2. Why do we use `k % nums.length`?
3. Can you rotate the array to the **left** instead?
4. What is the brute-force solution and its complexity?
5. Why does the reverse algorithm work?
