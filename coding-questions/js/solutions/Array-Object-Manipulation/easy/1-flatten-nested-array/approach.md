# LeetCode 2625 - Flatten Deeply Nested Array

## Thought Process

### 1. Start with normal flatten

For each element:

- If it's an array → recurse.
- Otherwise → push it into the result.

```js
if (Array.isArray(item)) {
  result.push(...flatten(item));
} else {
  result.push(item);
}
```

---

### 2. What changes for depth?

We are given a depth `n`.

Think of `n` as a **flatten budget**.

- Every time we flatten a nested array, we spend 1 depth.
- Recursive calls receive `n - 1`.

```js
flatten(subArray, n - 1);
```

---

### 3. When do we stop?

When:

```js
n === 0;
```

No more flattening is allowed.

So:

- If `item` is an array AND `n > 0` → recurse.
- Otherwise → push the item as-is.

```js
if (Array.isArray(item) && n > 0) {
  result.push(...flatten(item, n - 1));
} else {
  result.push(item);
}
```

---

## Mental Model

```text
n = 2

Found an array?
|
|-- n > 0
|      Flatten it
|      n--
|
|-- n === 0
       Stop flattening
       Push array as-is
```

---

## One-Line Interview Explanation

"Use recursion and treat `n` as the remaining flatten depth. Every recursive call consumes one depth (`n - 1`). When `n` becomes 0, stop flattening and push arrays directly into the result."
