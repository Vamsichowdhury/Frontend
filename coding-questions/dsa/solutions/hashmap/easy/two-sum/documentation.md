# Two Sum

## Problem

Given an array of integers `nums` and an integer `target`, return the indices of two numbers such that:

```text
nums[i] + nums[j] = target
```

You may assume exactly one valid answer exists.

---

# Intuition & Approach

The first question to ask is:

```text
How would I solve this if performance didn't matter?
```

Most people would compare every number with every other number until they find a pair whose sum equals the target.

That works, but feels inefficient.

The important observation is:

```text
For a number X,
I don't actually need to search for all possible pairs.

I only need ONE specific number:

target - X
```

Example:

```text
nums = [2,7,11,15]
target = 9

Current Number = 2

What number do I need?

9 - 2 = 7
```

So instead of searching for every possible pair:

```text
Ask:
"Have I already seen 7?"
```

This changes the problem from:

```text
Pair Finding
```

to

```text
Fast Lookup
```

And whenever a problem becomes:

```text
Have I already seen X?
```

HashMap is usually a strong candidate.

---

# Brute Force Solution

## Thought Process

The most natural solution is:

```text
Take every element.

For each element,
check every remaining element.

If their sum equals target,
return their indices.
```

Example:

```text
nums = [2,7,11,15]

2 + 7
2 + 11
2 + 15

7 + 11
7 + 15

11 + 15
```

Eventually we find:

```text
2 + 7 = 9
```

Return:

```text
[0,1]
```

---

## Brute Force Code

```js
var twoSum = function (nums, target) {
  // Pick first number
  for (let i = 0; i < nums.length - 1; i++) {
    // Compare it with every number after it
    for (let j = i + 1; j < nums.length; j++) {
      // Found required pair
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
};
```

---

## Why Brute Force Is Not Good

The problem is:

```text
We repeatedly search the array.
```

For every element:

```text
We scan all remaining elements.
```

As array size grows:

```text
10 elements  -> ~100 checks
100 elements -> ~10,000 checks
1000 elements -> ~1,000,000 checks
```

The work grows very quickly.

---

## Time Complexity

### O(n²)

Why?

Outer loop:

```text
Runs n times
```

Inner loop:

```text
Can run up to n times
```

Total work:

```text
n × n
```

Therefore:

```text
O(n²)
```

---

## Space Complexity

### O(1)

Why?

We only use:

```text
i
j
```

No extra data structure is created.

Therefore:

```text
O(1)
```

---

# Optimization

## Key Observation

Instead of searching for a matching number every time:

```text
Store numbers already seen.
```

For current number:

```text
current = nums[i]
```

The required partner is:

```text
target - current
```

If that partner already exists in our HashMap:

```text
Answer found.
```

Otherwise:

```text
Store current number in HashMap
and continue.
```

---

## Step-by-Step Example

```text
nums = [2,7,11,15]
target = 9
```

Initial:

```text
HashMap = {}
```

---

### i = 0

```text
current = 2

required = 9 - 2 = 7
```

Have we seen 7?

```text
No
```

Store:

```text
HashMap = {
  2 : 0
}
```

---

### i = 1

```text
current = 7

required = 9 - 7 = 2
```

Have we seen 2?

```text
Yes
```

HashMap contains:

```text
2 : 0
```

Return:

```text
[0,1]
```

Done.

---

# Optimized Code (Detailed Comments)

```js
var twoSum = function (nums, target) {
  // Stores:
  // number -> index
  //
  // Example:
  // {
  //   2 : 0,
  //   7 : 1
  // }
  const hashMap = new Map();

  // Traverse array only once
  for (let i = 0; i < nums.length; i++) {
    const currentNum = nums[i];

    // Ask:
    // What number do I need
    // to reach the target?
    //
    // target = 9
    // current = 2
    //
    // required = 7
    const requiredNum = target - currentNum;

    // Have we already seen
    // the required number?
    if (hashMap.has(requiredNum)) {
      // If yes,
      // answer found.
      //
      // Previous index comes
      // from HashMap.
      //
      // Current index is i.
      return [hashMap.get(requiredNum), i];
    }

    // Not found yet.
    //
    // Store current number
    // so future elements can use it.
    hashMap.set(currentNum, i);
  }
};
```

---

# Optimized Time Complexity

### O(n)

Why?

The array is traversed once.

```text
for loop -> n iterations
```

Inside each iteration:

```text
Map.has()
Map.get()
Map.set()
```

Average case:

```text
O(1)
```

Therefore:

```text
n × O(1)

= O(n)
```

---

# Optimized Space Complexity

### O(n)

Why?

In the worst case:

```text
No answer found until end.
```

We store every number in HashMap.

Example:

```text
1
2
3
4
5
...
n
```

HashMap size becomes:

```text
n
```

Therefore:

```text
O(n)
```

---

# Memory Hook

```text
Don't search for the pair.

For every number, ask:
"What number do I need?"

If the required number has already been seen,
HashMap gives the answer instantly.
```

Pattern:

```text
Repeated search
      ↓
Need fast lookup
      ↓
HashMap
```
