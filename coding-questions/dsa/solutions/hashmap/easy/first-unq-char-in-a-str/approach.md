# 387. First Unique Character in a String

## Approach

1. Count the frequency of every character using a hash map.
2. Traverse the string again.
3. Return the index of the first character whose frequency is `1`.
4. If no such character exists, return `-1`.

---

## Code

```js
var firstUniqChar = function (s) {
  const freq = {};

  // Count frequencies
  for (const char of s) {
    freq[char] = (freq[char] || 0) + 1;
  }

  // Find first unique character
  for (let i = 0; i < s.length; i++) {
    if (freq[s[i]] === 1) {
      return i;
    }
  }

  return -1;
};
```

---

## Walkthrough

### Input

```js
s = "loveleetcode";
```

### Step 1: Build Frequency Map

```js
{
  l: 2,
  o: 2,
  v: 1,
  e: 4,
  t: 1,
  c: 1,
  d: 1
}
```

### Step 2: Find First Unique Character

```text
Index 0 -> l -> frequency = 2
Index 1 -> o -> frequency = 2
Index 2 -> v -> frequency = 1 ✅
```

Return:

```js
2;
```

---

## Complexity

### Time Complexity

```text
O(N)
```

- First pass to count frequencies → O(N)
- Second pass to find first unique character → O(N)

### Space Complexity

```text
O(N)    // General case
O(1)    // For LeetCode (only 26 lowercase letters)
```
