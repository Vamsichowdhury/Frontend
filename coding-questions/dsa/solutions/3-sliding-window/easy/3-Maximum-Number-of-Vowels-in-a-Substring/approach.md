# LeetCode 1456 - Maximum Number of Vowels in a Substring of Given Length

## Problem Statement

Given a string `s` and an integer `k`, return the maximum number of vowel letters in any substring of `s` with length `k`.

Vowels are:

```text
a, e, i, o, u
```

---

## Example

```js
Input: s = "abciiidef";
k = 3;

Output: 3;
```

Explanation:

```text
Substring = "iii"

Number of vowels = 3
```

---

# Brute Force Approach

## Intuition

Generate every substring of size `k`.

For each substring:

1. Count vowels.
2. Keep track of maximum vowel count.

---

## Visual Representation

```text
s = "abciiidef"
k = 3

Window 1
[abc]
 vowels = 1

Window 2
[bci]
 vowels = 1

Window 3
[cii]
 vowels = 2

Window 4
[iii]
 vowels = 3

Window 5
[iid]
 vowels = 2

Window 6
[ide]
 vowels = 2

Window 7
[def]
 vowels = 1
```

Maximum:

```text
3
```

---

## Brute Force Code

```js
var maxVowels = function (s, k) {
  const vowels = new Set(["a", "e", "i", "o", "u"]);

  let maxCount = 0;

  for (let i = 0; i <= s.length - k; i++) {
    let count = 0;

    for (let j = i; j < i + k; j++) {
      if (vowels.has(s[j])) {
        count++;
      }
    }

    maxCount = Math.max(maxCount, count);
  }

  return maxCount;
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

When moving from one window to the next:

```text
abc
bci
```

Most characters stay the same.

Only:

```text
a leaves
i enters
```

Instead of recounting all vowels:

1. Remove effect of outgoing character.
2. Add effect of incoming character.

---

## Visual Representation

### Initial Window

```text
s = "abciiidef"
k = 3

[a b c]
 L   R

Vowel Count = 1
Max = 1
```

---

### Slide Window

```text
[b c i]

Remove 'a' (vowel)
Count = 1 - 1 = 0

Add 'i' (vowel)
Count = 0 + 1 = 1

Max = 1
```

---

### Slide Window

```text
[c i i]

Remove 'b'
Count = 1

Add 'i'
Count = 2

Max = 2
```

---

### Slide Window

```text
[i i i]

Remove 'c'
Count = 2

Add 'i'
Count = 3

Max = 3
```

---

# Dry Run

```text
String = abciiidef
k = 3
```

| Window | Vowel Count |
| ------ | ----------- |
| abc    | 1           |
| bci    | 1           |
| cii    | 2           |
| iii    | 3           |
| iid    | 2           |
| ide    | 2           |
| def    | 1           |

Maximum:

```text
3
```

---

# Approach

### Step 1

Count vowels in first window.

```js
for (let i = 0; i < k; i++) {
  if (isVowel(s[i])) count++;
}
```

---

### Step 2

Store as maximum.

```js
maxCount = count;
```

---

### Step 3

Slide the window.

Before moving:

```text
Remove left character
Add right character
```

---

### Step 4

Update maximum.

```js
maxCount = Math.max(maxCount, count);
```

---

# Optimized Code

```js
var maxVowels = function (s, k) {
  const vowels = new Set(["a", "e", "i", "o", "u"]);

  let count = 0;

  // First Window
  for (let i = 0; i < k; i++) {
    if (vowels.has(s[i])) {
      count++;
    }
  }

  let maxCount = count;

  // Slide Window
  for (let i = k; i < s.length; i++) {
    if (vowels.has(s[i - k])) {
      count--;
    }

    if (vowels.has(s[i])) {
      count++;
    }

    maxCount = Math.max(maxCount, count);
  }

  return maxCount;
};
```

---

# Time Complexity

### First Window

```text
O(k)
```

### Sliding Window

```text
O(n - k)
```

### Total

```text
O(n)
```

---

# Space Complexity

```text
O(1)
```

(Only a few variables are used.)

---

# Sliding Window Formula

Whenever a window moves:

```text
New Count

=
Old Count
- Outgoing Character Contribution
+ Incoming Character Contribution
```

For this problem:

```text
If outgoing char is vowel → count--

If incoming char is vowel → count++
```

---

# Pattern Recognition

If the question contains:

```text
✓ Contiguous Substring
✓ Fixed Size k
✓ Maximum Count
✓ Character Frequency
✓ Vowels / Digits / Letters
```

Think:

```text
FIXED SIZE SLIDING WINDOW
```

This problem is one of the most common beginner-level Sliding Window interview questions.
