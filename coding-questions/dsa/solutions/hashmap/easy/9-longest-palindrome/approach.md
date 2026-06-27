# Longest Palindrome - Intuition

A palindrome is symmetric.

- Characters with **even frequency** can be used completely.
- Characters with **odd frequency** can use `count - 1` characters (making them even).
- Only **one odd character** can be placed in the center.

# Approach

1. Count frequency of each character.
2. For each frequency:
   - If even → add all characters to the length.
   - If odd → add `count - 1` and mark that an odd character exists.
3. If any odd frequency exists, add `1` for the center character.
4. Return the total length.

# Example

Input: `"abccccdd"`

Frequency:

```js
a = 1;
b = 1;
c = 4;
d = 2;
```

Calculation:

```js
c -> +4
d -> +2
a -> +(1 - 1) = 0
b -> +(1 - 1) = 0
```

Length = `6`

Odd characters exist (`a`, `b`), so one can be placed in the center:

```js
6 + 1 = 7
```

Output:

```js
7;
```

# Example

Input:

```js
"aabccccceee";
```

Frequency:

```js
a = 2;
b = 1;
c = 5;
e = 3;
```

Counts:

```js
(2, 1, 5, 3);
```

Calculation:

```js
a -> +2
b -> +(1 - 1) = 0
c -> +(5 - 1) = 4
e -> +(3 - 1) = 2
```

Length so far:

```js
2 + 0 + 4 + 2 = 8
```

Odd frequencies exist (`b`, `c`, `e`), so one character can be placed in the center:

```js
8 + 1 = 9
```

Output:

```js
9;
```

Possible palindrome:

```text
aceccceca
```

Length:

```js
9;
```

# Key Idea

👉 Use all even counts completely.
👉 From odd counts, use `count - 1`.
👉 Add one extra character in the center if any odd count exists.
