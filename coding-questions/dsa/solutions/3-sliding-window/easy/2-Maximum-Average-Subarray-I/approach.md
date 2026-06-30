# LeetCode 643 - Maximum Average Subarray I

## Problem Statement

Given an integer array `nums` and an integer `k`, find the maximum average value of any contiguous subarray of length `k`.

Return the maximum average.

---

# Brute Force Approach

## Intuition

We need to consider **every possible subarray of size `k`**.

For each starting position:

1. Calculate the sum of the next `k` elements.
2. Calculate the average.
3. Keep track of the maximum average.

### Example

```js
nums = [1, 12, -5, -6, 50, 3];
k = 4;
```

Possible windows:

```text
[1,12,-5,-6]  Sum = 2   Average = 0.5

[12,-5,-6,50] Sum = 51  Average = 12.75

[-5,-6,50,3]  Sum = 42  Average = 10.5
```

Maximum Average:

```text
12.75
```

---

## Visual Representation

```text
nums = [1,12,-5,-6,50,3]
        |----------|
        Window Size = 4
```

Move one step:

```text
nums = [1,12,-5,-6,50,3]
           |----------|
```

Move one step:

```text
nums = [1,12,-5,-6,50,3]
              |----------|
```

For every window we calculate the sum from scratch.

---

## Brute Force Code

```js
var findMaxAverage = function (nums, k) {
  let maxAverage = -Infinity;

  for (let i = 0; i <= nums.length - k; i++) {
    let sum = 0;

    for (let j = i; j < i + k; j++) {
      sum += nums[j];
    }

    maxAverage = Math.max(maxAverage, sum / k);
  }

  return maxAverage;
};
```

---

## Time Complexity

```text
Outer Loop = O(n)

Inner Loop = O(k)

Total = O(n * k)
```

---

## Space Complexity

```text
O(1)
```

---

# Optimized Approach (Sliding Window)

## Observation

When moving from one window to the next, most elements remain the same.

Example:

```text
[1,12,-5,-6]
[12,-5,-6,50]
```

Common elements:

```text
12, -5, -6
```

Only:

```text
1 leaves
50 enters
```

Instead of recalculating the entire sum:

```text
New Sum

=
Old Sum
- Outgoing Element
+ Incoming Element
```

This is called a **Sliding Window**.

---

## Visual Representation

### Initial Window

```text
nums = [1,12,-5,-6,50,3]

[1,12,-5,-6]
 L         R

Sum = 2
MaxSum = 2
```

---

### Slide Window

Remove:

```text
1
```

Add:

```text
50
```

```text
[12,-5,-6,50]
 L         R

New Sum

= 2 - 1 + 50
= 51

MaxSum = 51
```

---

### Slide Again

Remove:

```text
12
```

Add:

```text
3
```

```text
[-5,-6,50,3]

New Sum

= 51 - 12 + 3
= 42

MaxSum = 51
```

---

## Dry Run Table

| Window        | Sum |
| ------------- | --- |
| [1,12,-5,-6]  | 2   |
| [12,-5,-6,50] | 51  |
| [-5,-6,50,3]  | 42  |

Maximum Sum:

```text
51
```

Maximum Average:

```text
51 / 4 = 12.75
```

---

## Optimized Code

```js
var findMaxAverage = function (nums, k) {
  let windowSum = 0;

  // First window
  for (let i = 0; i < k; i++) {
    windowSum += nums[i];
  }

  let maxSum = windowSum;

  // Slide window
  for (let i = k; i < nums.length; i++) {
    windowSum = windowSum - nums[i - k] + nums[i];

    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum / k;
};
```

---

## Time Complexity

### First Window

```text
O(k)
```

### Sliding

```text
O(n - k)
```

### Total

```text
O(n)
```

---

## Space Complexity

```text
O(1)
```

---

# Comparison

| Approach       | Time Complexity | Space Complexity |
| -------------- | --------------- | ---------------- |
| Brute Force    | O(n × k)        | O(1)             |
| Sliding Window | O(n)            | O(1)             |

---

# Pattern Recognition

If the problem contains:

```text
✓ Contiguous Subarray
✓ Fixed Size k
✓ Maximum/Minimum Sum
✓ Average of Window
✓ Longest/Shortest Window
```

Think:

```text
SLIDING WINDOW
```

This is one of the most common fixed-size sliding window problems asked in interviews.
