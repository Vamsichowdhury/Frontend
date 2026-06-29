# Reverse Vowels - Optimized Two Pointer Approach

## Intuition

We only care about **vowels**, not consonants.

So instead of collecting all vowels first and then replacing them, we can use **two pointers**:

- `left` starts from the beginning.
- `right` starts from the end.

### Rules

1. If `left` is not a vowel → move `left`.
2. If `right` is not a vowel → move `right`.
3. If both are vowels:
   - swap them
   - move both pointers inward

This way, each character is visited at most once.

---

## Example

Input:

```js
s = "IceCreAm";
```

Initial:

```text
I c e C r e A m
L             R
```

### Step 1

Both `I` and `A` are vowels.

Swap:

```text
A c e C r e I m
  L         R
```

### Step 2

`c` is not a vowel.

```text
A c e C r e I m
    L       R
```

### Step 3

`e` and `I` are vowels.

Swap:

```text
A c I C r e e m
      L   R
```

### Step 4

`C`, `r` are not vowels.

Pointers cross.

Result:

```js
"AcICreem";
```

---

# Optimized Code

```js
var reverseVowels = function (s) {
  const vowels = new Set(["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]);

  const arr = s.split("");

  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    while (left < right && !vowels.has(arr[left])) {
      left++;
    }

    while (left < right && !vowels.has(arr[right])) {
      right--;
    }

    [arr[left], arr[right]] = [arr[right], arr[left]];

    left++;
    right--;
  }

  return arr.join("");
};
```

---

# Why is this more optimized?

Your solution uses:

```js
vowels.includes(char);
```

`includes()` on an array is **O(10)** (linear search).

Using:

```js
const vowels = new Set(...)
```

allows:

```js
vowels.has(char);
```

which is approximately **O(1)**.

---

# Complexity

### Your Solution

```text
Time: O(n)
Space: O(n)
```

### Optimized Solution

```text
Time: O(n)
Space: O(n)
```

The Big-O is the same, but the constant factor is better because `Set.has()` is faster than repeated `Array.includes()`.
