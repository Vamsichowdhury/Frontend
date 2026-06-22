# 242. Valid Anagram

## Problem

Given two strings `s` and `t`, determine whether `t` is an anagram of `s`.

An anagram means:

- Both strings contain the same characters.
- Character frequencies must match.
- Order does not matter.

### Example

```text
Input:
s = "anagram"
t = "nagaram"

Output:
true
```

```text
Input:
s = "rat"
t = "car"

Output:
false
```

---

# Intuition & Approach

The first question to ask is:

> What makes two strings anagrams?

It is **not** the order of characters.

The only thing that matters is:

```text
Character frequencies
```

Example:

```text
listen

l -> 1
i -> 1
s -> 1
t -> 1
e -> 1
n -> 1
```

```text
silent

s -> 1
i -> 1
l -> 1
e -> 1
n -> 1
t -> 1
```

Both strings have identical character frequencies.

Therefore they are anagrams.

The problem becomes:

> How can we efficiently compare character frequencies?

---

# Brute Force Solution

## Thought Process

For every character in `s`:

1. Search for that character in `t`
2. Remove it once found
3. Continue until all characters are processed

Example:

```text
s = "abc"
t = "bca"

Find a in t
Find b in t
Find c in t
```

If every character can be matched:

```text
return true
```

Otherwise:

```text
return false
```

---

## Brute Force Code

```js
function isAnagram(s, t) {
  if (s.length !== t.length) {
    return false;
  }

  t = t.split("");

  for (const char of s) {
    const index = t.indexOf(char);

    if (index === -1) {
      return false;
    }

    t.splice(index, 1);
  }

  return true;
}
```

---

## Why It Works

For each character in `s`:

- We search for the same character in `t`
- Once found, we remove it
- This prevents reusing the same character multiple times

If every character is matched exactly once:

```text
The strings are anagrams.
```

---

## Time Complexity

### O(n²)

### Why?

For every character in `s`:

```js
indexOf();
```

may scan the entire string.

```text
n characters
×
n search

= O(n²)
```

---

## Space Complexity

### O(n)

### Why?

```js
t.split("");
```

creates a new array containing all characters.

---

# Why Brute Force Is Not Good

The bottleneck is:

```text
Repeated searching
```

For every character:

```text
Search entire string again
```

As the string grows, the number of searches grows significantly.

We need a way to know:

```text
How many times each character appears
```

without repeatedly scanning.

---

# Optimization

## Key Observation

Anagrams are completely determined by:

```text
Character Frequency
```

Example:

```text
anagram

a -> 3
n -> 1
g -> 1
r -> 1
m -> 1
```

If another string has the exact same frequencies:

```text
It is an anagram.
```

---

## Thought Process

Instead of repeatedly searching:

```text
Count characters once.
```

Create a frequency map for `s`.

Example:

```text
a -> 3
n -> 1
g -> 1
r -> 1
m -> 1
```

Now process `t`.

For every character in `t`:

- Reduce its count
- If the character does not exist, return false
- If the count becomes negative, return false

If all counts cancel out correctly:

```text
The strings are anagrams.
```

---

## Optimized Code

```js
function isAnagram(s, t) {
  // Different lengths can never be anagrams
  if (s.length !== t.length) {
    return false;
  }

  const frequencyMap = new Map();

  // Count characters in first string
  for (const char of s) {
    frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
  }

  // Remove counts using second string
  for (const char of t) {
    // Character does not exist
    if (!frequencyMap.has(char)) {
      return false;
    }

    frequencyMap.set(char, frequencyMap.get(char) - 1);

    // More occurrences than expected
    if (frequencyMap.get(char) < 0) {
      return false;
    }
  }

  return true;
}
```

---

## Why It Works

After the first loop:

```text
Map contains exact frequencies of s
```

Example:

```text
a -> 3
n -> 1
g -> 1
r -> 1
m -> 1
```

During the second loop:

```text
Each matching character decreases its count
```

If all counts match:

```text
Every count becomes zero
```

Therefore:

```text
The strings are anagrams
```

---

## Time Complexity

### O(n)

### Why?

First loop:

```text
n operations
```

Second loop:

```text
n operations
```

HashMap operations:

```text
get()
set()
has()
```

Average case:

```text
O(1)
```

Total:

```text
O(n)
```

---

## Space Complexity

### O(k)

Where:

```text
k = number of unique characters
```

Worst case:

```text
Every character is unique
```

Therefore:

```text
O(n)
```

---

# Recognition Signals

Think Frequency Map / HashMap when you see:

- Anagram
- Same characters
- Character frequency
- Permutation of another string
- Compare character counts

---

# Common Mistakes

### 1. Forgetting Length Check

```js
if (s.length !== t.length)
```

Without this:

```text
ab
abc
```

may produce incorrect results.

---

### 2. Checking Only Character Existence

Wrong approach:

```text
Character exists
```

Need:

```text
Character frequency exists
```

Example:

```text
aab
abb
```

Not anagrams.

---

# Similar Problems

1. Valid Anagram
2. Group Anagrams
3. Find All Anagrams in a String
4. Ransom Note
5. First Unique Character in a String
6. Isomorphic Strings
7. Valid Sudoku
8. Longest Palindrome

Common Pattern:

```text
Frequency Counting using HashMap
```

---

# Memory Hook

> Anagrams do not care about order. They only care about character frequencies.

Pattern:

```text
Compare characters
        ↓
Need frequencies
        ↓
HashMap / Frequency Counter
```
