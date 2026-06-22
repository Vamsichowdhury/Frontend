# 383. Ransom Note

## Problem

Given two strings:

- `ransomNote`
- `magazine`

Return `true` if you can construct `ransomNote` using letters from `magazine`.

Each letter in `magazine` can only be used once.

### Example

```text
Input:
ransomNote = "aa"
magazine = "aab"

Output:
true
```

```text
Input:
ransomNote = "aa"
magazine = "ab"

Output:
false
```

---

# Intuition & Approach

The first question to ask is:

> What does it mean to construct the ransom note?

It means every character required by `ransomNote` must be available in `magazine`.

Not only must the character exist, but it must exist enough times.

Example:

```text
ransomNote = "aa"
magazine = "ab"
```

Although `a` exists in magazine:

```text
a -> 1
```

The ransom note needs:

```text
a -> 2
```

So the answer is:

```text
false
```

The problem becomes:

> How can we efficiently track how many times each character is available?

This is a frequency-counting problem.

Whenever you hear:

```text
Need character counts
Need occurrences
Need availability
```

Think:

```text
HashMap / Frequency Counter
```

---

# Brute Force Solution

## Thought Process

For every character in `ransomNote`:

1. Search for it in `magazine`
2. If found, remove it
3. Continue
4. If not found, return false

Example:

```text
ransomNote = "ab"
magazine = "cab"
```

Find:

```text
a in magazine
b in magazine
```

All found:

```text
true
```

---

## Brute Force Code

```js
function canConstruct(ransomNote, magazine) {
  magazine = magazine.split("");

  for (const char of ransomNote) {
    const index = magazine.indexOf(char);

    if (index === -1) {
      return false;
    }

    // Remove used character
    magazine.splice(index, 1);
  }

  return true;
}
```

---

## Why It Works

For every character in `ransomNote`:

- We find one occurrence in `magazine`
- Once used, we remove it
- This prevents reusing the same character

If every required character is found:

```text
return true
```

Otherwise:

```text
return false
```

---

## Time Complexity

### O(n × m)

Where:

```text
n = ransomNote.length
m = magazine.length
```

### Why?

For every character in `ransomNote`:

```js
indexOf();
```

may scan most of `magazine`.

Therefore:

```text
n × m
```

Worst case:

```text
O(n²)
```

when both strings are similar in size.

---

## Space Complexity

### O(m)

### Why?

```js
magazine.split("");
```

creates a new array.

---

# Why Brute Force Is Not Good

The bottleneck is:

```text
Repeated searching
```

For every character:

```text
Search magazine again
```

Example:

```text
ransomNote = "aaaaaa"
magazine = "aaaaaab"
```

We repeatedly scan the magazine.

This creates unnecessary work.

Instead of repeatedly searching:

```text
Count once
Use many times
```

---

# Optimization

## Key Observation

The only thing that matters is:

```text
How many times each character appears.
```

Example:

```text
magazine = "aab"
```

Frequency:

```text
a -> 2
b -> 1
```

Now every character required by `ransomNote` can simply consume one count.

---

## Thought Process

Step 1:

Build a frequency map for `magazine`.

Example:

```text
magazine = "aab"

a -> 2
b -> 1
```

Step 2:

Process every character in `ransomNote`.

When a character is needed:

```text
Decrease its count
```

If:

```text
Character doesn't exist
```

or

```text
Count becomes negative
```

Then:

```text
return false
```

Because we need more characters than magazine contains.

---

## Optimized Code

```js
function canConstruct(ransomNote, magazine) {
  // Store available characters from magazine
  const frequencyMap = new Map();

  // Count all characters in magazine
  for (const char of magazine) {
    frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
  }

  // Try constructing ransomNote
  for (const char of ransomNote) {
    // Character not available
    if (!frequencyMap.has(char)) {
      return false;
    }

    // Consume one occurrence
    frequencyMap.set(char, frequencyMap.get(char) - 1);

    // Used more than available
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
frequencyMap contains
all available characters
and their counts.
```

Example:

```text
aab

a -> 2
b -> 1
```

When processing `ransomNote`:

```text
Every required character
consumes one count.
```

If a count becomes negative:

```text
Need > Available
```

Therefore construction is impossible.

If all characters are successfully consumed:

```text
Construction is possible.
```

---

## Time Complexity

### O(n + m)

Where:

```text
n = ransomNote.length
m = magazine.length
```

### Why?

First loop:

```text
Process magazine once
```

→ O(m)

Second loop:

```text
Process ransomNote once
```

→ O(n)

Total:

```text
O(n + m)
```

---

## Space Complexity

### O(k)

Where:

```text
k = unique characters in magazine
```

Worst case:

```text
Every character is unique
```

Therefore:

```text
O(k)
```

For English lowercase letters only:

```text
O(26)
```

which is effectively:

```text
O(1)
```

---

# Recognition Signals

Think Frequency Map / HashMap when you see:

- Character availability
- Character counts
- Can construct
- Inventory of characters
- Frequency comparison
- Need occurrences

Keywords:

```text
Use once
Count characters
Available letters
Occurrences
```

---

# Common Mistakes

## 1. Checking Only Character Existence

Wrong:

```text
Does 'a' exist?
```

Need:

```text
How many 'a's exist?
```

Example:

```text
ransomNote = "aa"
magazine = "ab"
```

Character exists.

Count does not.

Answer is:

```text
false
```

---

## 2. Forgetting to Decrease Frequency

Wrong:

```js
if (map.has(char))
```

This allows unlimited reuse.

Every used character must decrease its count.

---

## 3. Negative Counts

Example:

```text
ransomNote = "aaa"
magazine = "aa"
```

After consuming:

```text
a -> -1
```

This should immediately return false.

---

# Similar Problems

1. 242. Valid Anagram
2. 49. Group Anagrams
3. 438. Find All Anagrams in a String
4. 387. First Unique Character in a String
5. 451. Sort Characters By Frequency
6. 560. Subarray Sum Equals K
7. 128. Longest Consecutive Sequence

Common Pattern:

```text
Frequency Counting
HashMap
Character Availability Tracking
```

---

# Memory Hook

> Don't ask "Does the character exist?" Ask "Does the character exist enough times?"

Pattern:

```text
Need occurrences
        ↓
Count frequencies
        ↓
HashMap / Frequency Counter
```
