# Maximum Number of Vowels in a Substring of Given Length

## Brute Force Approach

### Intuition

We need to find the maximum number of vowels present in any substring of length `k`.

The simplest idea is:

1. Generate every possible substring of length `k`.
2. Count how many vowels are present in that substring.
3. Keep track of the maximum count seen so far.

The problem with this approach is that we repeatedly count vowels for overlapping substrings, resulting in unnecessary work.

---

### Example

```text
s = "abciiidef"
k = 3

Possible substrings:

abc -> 1 vowel
bci -> 1 vowel
cii -> 2 vowels
iii -> 3 vowels
iid -> 2 vowels
ide -> 2 vowels
def -> 1 vowel

Answer = 3
```

---

### Algorithm

For every possible starting index:

1. Create a window of size `k`.
2. Count vowels inside that window.
3. Update the maximum count.

---

### Complexity

```text
Time Complexity: O((n - k + 1) * k)
Space Complexity: O(1)
```

---

# Optimized Approach (Sliding Window)

## Intuition

Notice that adjacent windows overlap heavily.

Example:

```text
s = "abciiidef"
k = 3

abc
 bci
  cii
   iii
```

When moving from one window to the next:

- Only one character leaves the window.
- Only one character enters the window.

Instead of recounting all `k` characters, we can update the vowel count using just these two characters.

This is the core idea behind the **Sliding Window** technique.

---

### Visual Representation

```text
s = "abciiidef"
k = 3

Window 1:

[a b c]
 count = 1

Slide →

[a] leaves
[i] enters

[b c i]
 count = 1

Slide →

[b] leaves
[i] enters

[c i i]
 count = 2

Slide →

[c] leaves
[i] enters

[i i i]
 count = 3
```

---

## Approach

### Step 1: Count vowels in the first window

```text
[a b c]

count = 1
maxCount = 1
```

---

### Step 2: Slide the window

For every new window:

#### Outgoing Character

```text
s[i - k]
```

If it is a vowel:

```js
count--;
```

---

#### Incoming Character

```text
s[i]
```

If it is a vowel:

```js
count++;
```

---

#### Update Answer

```js
maxCount = Math.max(maxCount, count);
```

---

## Dry Run

### Initial Window

```text
[a b c]

count = 1
maxCount = 1
```

---

### Window 2

```text
[b c i]

Outgoing: a (vowel) -> count = 0
Incoming: i (vowel) -> count = 1

maxCount = 1
```

---

### Window 3

```text
[c i i]

Outgoing: b (not vowel)
Incoming: i (vowel)

count = 2
maxCount = 2
```

---

### Window 4

```text
[i i i]

Outgoing: c (not vowel)
Incoming: i (vowel)

count = 3
maxCount = 3
```

---

### Remaining Windows

```text
[i i d] -> 2
[i d e] -> 2
[d e f] -> 1
```

Maximum remains:

```text
3
```

---

## Complexity

```text
Time Complexity: O(n)

Reason:
- First window takes O(k)
- Sliding through remaining characters takes O(n - k)

Overall: O(n)
```

```text
Space Complexity: O(1)
```

---

## Sliding Window Pattern

Whenever a problem asks:

- Substring of fixed size `k`
- Subarray of fixed size `k`
- Maximum/Minimum/Sum/Count within a fixed window

Think:

```text
1. Process first window.
2. Slide the window.
3. Remove outgoing element.
4. Add incoming element.
5. Update answer.
```

This avoids recalculating everything from scratch and usually reduces the complexity from **O(n × k)** to **O(n)**.
