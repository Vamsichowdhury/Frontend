# LeetCode 20 - Valid Parentheses

**Difficulty:** Easy

---

# Problem

Given a string `s` containing only:

- `(`
- `)`
- `{`
- `}`
- `[`
- `]`

Determine if the string is **valid**.

A string is valid if:

1. Every opening bracket has a matching closing bracket.
2. Brackets are closed in the correct order.
3. Every closing bracket matches the most recent unmatched opening bracket.

---

# Intuition

Think of a stack of plates.

Whenever you see an **opening bracket**, place it on the stack.

Whenever you see a **closing bracket**, it must match the **last opening bracket** that was added.

Since brackets close in **reverse order**, a **Stack (LIFO - Last In, First Out)** is the perfect data structure.

Example:

```text
({[]})

Push (
Push {
Push [

Encounter ]
Matches [

Encounter }
Matches {

Encounter )
Matches (

Stack becomes empty ✅
```

---

# Approach

### Step 1

Create an empty stack.

```javascript
const stack = [];
```

---

### Step 2

Create a map for matching brackets.

```javascript
const map = {
  ")": "(",
  "}": "{",
  "]": "[",
};
```

This tells us:

```text
) should match (
} should match {
] should match [
```

---

### Step 3

Traverse every character.

If it's an **opening bracket**

```text
Push it onto the stack.
```

If it's a **closing bracket**

1. If the stack is empty → return `false`.
2. Pop the top element.
3. Compare it with the expected opening bracket.
4. If they don't match → return `false`.

---

### Step 4

After processing all characters:

- If the stack is empty → return `true`.
- Otherwise → return `false`.

---

# Dry Run

## Example 1

```text
Input:
"()[]{}"
```

| Character | Stack | Action |
| --------- | ----- | ------ |
| (         | (     | Push   |
| )         | Empty | Pop    |
| [         | [     | Push   |
| ]         | Empty | Pop    |
| {         | {     | Push   |
| }         | Empty | Pop    |

Final Stack

```text
[]
```

Answer

```text
true
```

---

## Example 2

```text
Input:
"(]"
```

| Character | Stack | Action   |
| --------- | ----- | -------- |
| (         | (     | Push     |
| ]         | (     | Mismatch |

Answer

```text
false
```

---

## Example 3

```text
Input:
"([)]"
```

Process

```text
Push (
Push [

Encounter )

Expected (
Found [

Mismatch ❌
```

Answer

```text
false
```

---

## Example 4

```text
Input:
"{[]}"
```

```text
Push {
Push [
Encounter ] -> Pop [
Encounter } -> Pop {
Stack Empty
```

Answer

```text
true
```

---

# JavaScript Solution

```javascript
var isValid = function (s) {
  const stack = [];

  const map = {
    ")": "(",
    "}": "{",
    "]": "[",
  };

  for (const char of s) {
    // Opening bracket
    if (!map[char]) {
      stack.push(char);
    } else {
      // Closing bracket
      if (stack.length === 0) return false;

      const top = stack.pop();

      if (top !== map[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
};
```

---

# How the Code Works

Suppose

```text
s = "{[]}"
```

### Initial State

```text
stack = []
```

---

### Character = `{`

It's an opening bracket.

```text
stack = ["{"]
```

---

### Character = `[`

It's an opening bracket.

```text
stack = ["{", "["]
```

---

### Character = `]`

It's a closing bracket.

Expected opening bracket:

```javascript
map["]"]; // "["
```

Pop from stack:

```text
top = "["
```

They match.

```text
stack = ["{"]
```

---

### Character = `}`

Expected opening bracket:

```javascript
map["}"]; // "{"
```

Pop from stack:

```text
top = "{"
```

They match.

```text
stack = []
```

---

Traversal finished.

Stack is empty.

```javascript
return true;
```

---

# Time Complexity

Each character is visited exactly once.

```text
O(n)
```

where `n` is the length of the string.

---

# Space Complexity

In the worst case:

```text
(((((((
```

Every opening bracket is stored in the stack.

```text
O(n)
```

---

# Why Use a Stack?

Brackets follow **Last In, First Out (LIFO)** order.

Example

```text
({[]})

Open:
(
{
[

Close:
]
}
)
```

The **last opening bracket** must be closed **first**.

A stack naturally supports this behavior.

---

# Why Not Use a Counter?

A counter only tracks how many brackets have been seen.

It **cannot remember their order**.

Example

```text
([)]
```

Counts:

```text
(
) -> 1 pair

[
] -> 1 pair
```

The counts look balanced, but the order is incorrect.

A stack remembers the order.

---

# Why Use a Map?

Without a map:

```javascript
if (char === ")") {
  ...
} else if (char === "]") {
  ...
} else if (char === "}") {
  ...
}
```

With a map:

```javascript
if (stack.pop() !== map[char]) {
  return false;
}
```

Using a map makes the code:

- Cleaner
- Easier to read
- Easy to extend

---

# Edge Cases

### Empty String

```text
Input:
""
```

Output

```text
true
```

---

### Only Opening Brackets

```text
Input:
"((("
```

Output

```text
false
```

---

### Only Closing Brackets

```text
Input:
")))"
```

Output

```text
false
```

---

### Wrong Order

```text
Input:
"([)]"
```

Output

```text
false
```

---

### Correct Nested Brackets

```text
Input:
"({[]})"
```

Output

```text
true
```

---

# Interview Explanation (30 Seconds)

> "I use a stack because brackets close in the reverse order that they open. Every opening bracket is pushed onto the stack. Whenever I encounter a closing bracket, I pop the most recent opening bracket and verify that it matches the expected type. If there's a mismatch or the stack is empty, the string is invalid. After processing all characters, the string is valid only if the stack is empty."

---

# Key Takeaways

- Use a **Stack** because brackets follow **LIFO** order.
- Push every opening bracket.
- Pop and compare for every closing bracket.
- Any mismatch immediately returns `false`.
- The stack must be empty at the end for the string to be valid.
- **Time Complexity:** `O(n)`
- **Space Complexity:** `O(n)`
