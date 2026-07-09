## Intuition

A pivot index is an index where:

- Sum of elements on the **left** == Sum of elements on the **right**

The brute-force approach calculates the left and right sums for every index, resulting in **O(n²)**.

We can optimize this using a **Prefix Sum** idea.

---

## Approach

1. Calculate the **total sum** of the array.
2. Initialize `leftSum = 0`.
3. Iterate through the array:
   - `rightSum = totalSum - leftSum - nums[i]`
   - If `leftSum === rightSum`, return the current index.
   - Otherwise, add `nums[i]` to `leftSum`.
4. If no pivot index is found, return `-1`.

---

### Time Complexity

- **O(n)**

### Space Complexity

- **O(1)**

---

## Intuition

For every index, we need to know:

- Sum of all elements **before** it.
- Sum of all elements **after** it.

Instead of calculating these sums again and again, we can keep track of them while traversing the array.

- `leftSum` → Sum of elements we've already passed.
- `totalSum` → Sum of all elements in the array.
- `rightSum` can be found using:

```text
rightSum = totalSum - leftSum - nums[i]
```

Why?

```text
totalSum
= leftSum + nums[i] + rightSum
```

So,

```text
rightSum = totalSum - leftSum - nums[i]
```

Now, at every index:

- If `leftSum === rightSum`, we've found the pivot index.
- Otherwise, move to the next index by adding the current element to `leftSum`.

---

## Approach

1. Find the total sum of the array.
2. Set `leftSum = 0`.
3. Traverse the array:
   - Calculate `rightSum = totalSum - leftSum - nums[i]`.
   - If `leftSum === rightSum`, return the current index.
   - Otherwise, update `leftSum += nums[i]`.
4. If no pivot exists, return `-1`.

### Time Complexity

- **O(n)**

### Space Complexity

- **O(1)**

---

## Example

```text
nums = [1, 7, 3, 6, 5, 6]
```

### Step 1: Calculate Total Sum

```text
totalSum = 1 + 7 + 3 + 6 + 5 + 6 = 28
```

Initialize:

```text
leftSum = 0
```

| Index | Value |                                 leftSum | rightSum = totalSum - leftSum - value | Pivot? |
| ----: | ----: | --------------------------------------: | ------------------------------------: | :----: |
|     0 |     1 |                                       0 |                       28 - 0 - 1 = 27 |   ❌   |
|       |       |            Update `leftSum = 0 + 1 = 1` |                                       |        |
|     1 |     7 |                                       1 |                       28 - 1 - 7 = 20 |   ❌   |
|       |       |            Update `leftSum = 1 + 7 = 8` |                                       |        |
|     2 |     3 |                                       8 |                       28 - 8 - 3 = 17 |   ❌   |
|       |       |           Update `leftSum = 8 + 3 = 11` |                                       |        |
|     3 |     6 |                                      11 |                      28 - 11 - 6 = 11 |   ✅   |
|       |       | `leftSum === rightSum`, so return **3** |                                       |        |

### Answer

```text
Pivot Index = 3
```

### Key Idea

At every index:

- `leftSum` is already known.
- `rightSum` is calculated in **O(1)** using:

```text
rightSum = totalSum - leftSum - nums[i]
```

So we only need **one traversal** after calculating the total sum.

---

## Why do we update `leftSum` after comparing?

At index `i`, `leftSum` should contain the sum of **only the elements before** `nums[i]`.

So the order should be:

1. Calculate `rightSum`.
2. Compare `leftSum` and `rightSum`.
3. Add `nums[i]` to `leftSum`.

### Why?

Suppose:

```text
nums = [1, 7, 3]
```

At `i = 1` (value = `7`):

Before updating:

```text
leftSum = 1
rightSum = 3

leftSum represents:
[1] | 7 | [3]
```

This is correct because `leftSum` contains only the elements **to the left** of the current index.

If we update first:

```javascript
leftSum += nums[i];
```

Then:

```text
leftSum = 8

leftSum represents:
[1, 7] | 7 | [3]
```

Now the current element (`7`) is included in the left sum, which violates the definition of a pivot index.

### Key Point

At every index:

- `leftSum` = sum of elements **before** the current index.
- `rightSum` = sum of elements **after** the current index.

Therefore, we must compare **before** adding the current element to `leftSum`.

---

```javascript
/**
 * Time: O(n)
 * Space: O(1)
 */

var pivotIndex = function (nums) {
  // Calculate the total sum of the array
  let totalSum = nums.reduce((sum, num) => sum + num, 0);

  // Sum of elements to the left of the current index
  let leftSum = 0;

  // Traverse the array
  for (let i = 0; i < nums.length; i++) {
    // Sum of elements to the right of the current index
    const rightSum = totalSum - leftSum - nums[i];

    // Check if current index is the pivot
    if (leftSum === rightSum) {
      return i;
    }

    // Update leftSum for the next iteration
    leftSum += nums[i];
  }

  // No pivot index found
  return -1;
};
```

## Example

```javascript
const nums = [1, 7, 3, 6, 5, 6];

console.log(pivotIndex(nums)); // 3
```
