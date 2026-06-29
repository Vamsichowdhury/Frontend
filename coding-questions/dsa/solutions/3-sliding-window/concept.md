# Sliding Window Pattern

## What Problem Does It Solve?

Imagine you have an array:

```txt
[2, 1, 5, 1, 3, 2]
```

Question:

> Find the maximum sum of any 3 consecutive numbers.

---

## Brute Force Approach

Check every group of 3:

```txt
[2,1,5] = 8
[1,5,1] = 7
[5,1,3] = 9
[1,3,2] = 6
```

Maximum = **9**

### Time Complexity

```txt
O(n * k)
```

For every position, we recalculate the entire window.

---

# Sliding Window Idea

Instead of recalculating everything, reuse the previous window's result.

### First Window

```txt
[2,1,5] 1,3,2

Sum = 8
```

### Slide Right

```txt
2 [1,5,1] 3,2
```

Instead of:

```txt
1 + 5 + 1
```

Use:

```txt
Previous Sum
- Outgoing Element
+ Incoming Element
```

```txt
8 - 2 + 1 = 7
```

### Slide Again

```txt
2,1 [5,1,3] 2
```

```txt
7 - 1 + 3 = 9
```

### Slide Again

```txt
2,1,5 [1,3,2]
```

```txt
9 - 5 + 2 = 6
```

Maximum = **9**

---

# Why Is It Called Sliding Window?

Because a fixed-size window keeps moving across the array.

```txt
[2,1,5] 1,3,2
   ↓

2 [1,5,1] 3,2
     ↓

2,1 [5,1,3] 2
       ↓

2,1,5 [1,3,2]
```

Think of looking through a small window and sliding it one step at a time.

---

# Two Types of Sliding Window

## 1. Fixed Size Window

The window size never changes.

Example:

```txt
Find the maximum sum of 3 consecutive elements.
```

Window size = 3

### Common Problems

- Maximum Sum Subarray of Size K
- Average of Subarray of Size K
- Maximum Vowels in a Substring of Length K

---

## 2. Variable Size Window

The window expands and shrinks as needed.

Example:

```txt
Find the longest substring without repeating characters.
```

String:

```txt
abcabcbb
```

Expand:

```txt
[a]
[ab]
[abc]
```

Next character:

```txt
[abca]
```

Duplicate found (`a`).

Shrink from the left:

```txt
[bca]
```

Continue expanding.

---

# Visualizing Fixed Window

Array:

```txt
nums = [2,1,5,1,3,2]
Window Size = 3
```

### Step 1

```txt
[2,1,5] 1,3,2
 L   R

sum = 8
```

### Step 2

```txt
2 [1,5,1] 3,2
   L   R

sum = 8 - 2 + 1 = 7
```

### Step 3

```txt
2,1 [5,1,3] 2
     L   R

sum = 7 - 1 + 3 = 9
```

### Step 4

```txt
2,1,5 [1,3,2]
       L   R

sum = 9 - 5 + 2 = 6
```

Maximum = **9**

---

# Visualizing Variable Window

Question:

> Longest substring without repeating characters

String:

```txt
abcabcbb
```

### Step 1

```txt
[a]
 L
 R
```

### Step 2

```txt
[ab]
 L
   R
```

### Step 3

```txt
[abc]
 L
     R
```

### Step 4

```txt
[abca]
 L
       R
```

Duplicate found.

Move Left Pointer:

```txt
[bca]
  L
       R
```

Continue.

---

# How to Identify Sliding Window Problems

Look for words like:

## Arrays

```txt
consecutive
contiguous
subarray
```

## Strings

```txt
substring
longest
shortest
maximum
minimum
```

Examples:

```txt
Maximum Sum Subarray
```

```txt
Longest Substring Without Repeating Characters
```

```txt
Minimum Window Substring
```

```txt
Longest Repeating Character Replacement
```

```txt
Permutation in String
```

All of these are Sliding Window problems.

---

# Mental Model

Ask yourself:

```txt
Can I maintain information
while moving L and R
instead of recalculating everything?
```

If yes, Sliding Window is probably the right pattern.

---

# Generic Sliding Window Template

```js
let left = 0;

for (let right = 0; right < arr.length; right++) {
  // Expand window

  while (windowIsInvalid) {
    // Shrink window
    left++;
  }

  // Update answer
}
```

---

# Key Insight

Sliding Window is simply:

```txt
Expand Window → Process → Shrink Window (if needed)
```

Instead of repeatedly recalculating the same data, reuse work from the previous window.

This often reduces:

```txt
O(n²)
```

to

```txt
O(n)
```
