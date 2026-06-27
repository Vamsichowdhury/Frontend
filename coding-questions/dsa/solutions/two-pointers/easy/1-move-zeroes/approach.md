# 283. Move Zeroes

## Intuition

Think of it this way:

- `right` searches for non-zero numbers.
- `left` marks the next position where a non-zero number should be placed.

Whenever `right` finds a non-zero:

1. Swap it with `left`.
2. Move `left` forward.
3. Continue searching with `right`.

As non-zero numbers move to the front, zeros automatically get pushed to the end.

---

## Example

```text
nums = [0,1,0,3,12]
```

### Initial State

```text
[0,1,0,3,12]
 L
 R
```

`nums[right] = 0`

Zero found → skip.

---

### right = 1

```text
[0,1,0,3,12]
 L R
```

`nums[rig`

`ht] = 1`

Non-zero found.



Swap `nums[left]` and `nums[right]`

```text
[1,0,0,3,12]
```

Move `left` forward.

```text
[1,0,0,3,12]
   L
   R
```

Comment:

- 1 is now in the correct position.
- `left` moves to the next position where a non-zero should go.
- `right` continues searching.

---

### right = 2

```text
[1,0,0,3,12]
   L R
```

`nums[right] = 0`

Zero found → skip.

---

### right = 3

```text
[1,0,0,3,12]
   L   R
```

`nums[right] = 3`

Non-zero found.

Swap.

```text
[1,3,0,0,12]
```

Move `left`.

```text
[1,3,0,0,12]
     L R
```

Comment:

- 3 is now in the correct position.
- `left` moves to the next empty spot.
- `right` continues searching.

---

### right = 4

```text
[1,3,0,0,12]
     L   R
```

`nums[right] = 12`

Non-zero found.

Swap.

```text
[1,3,12,0,0]
```

Move `left`.

```text
[1,3,12,0,0]
        L R
```

Comment:

- 12 is now in the correct position.
- All non-zero numbers are placed at the front.

---

## Final Result

```text
[1,3,12,0,0]
```

---

## Approach

1. Initialize `left = 0`.
2. Traverse the array using `right`.
3. If `nums[right]` is non-zero:
   - Swap `nums[left]` and `nums[right]`.
   - Increment `left`.
4. Continue until the end of the array.

---

## Code

```js
var moveZeroes = function (nums) {
  let left = 0;

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] !== 0) {
      [nums[left], nums[right]] = [nums[right], nums[left]];
      left++;
    }
  }
};
```

---

## Why This Works

```text
left  = next position for a non-zero
right = find the next non-zero
```

Every time `right` finds a non-zero number:

```text
Find → Place → Move left
```

Eventually:

- All non-zero elements are grouped at the front.
- All zeros naturally move to the back.

---

## Complexity Analysis

### Time Complexity

```text
O(n)
```

We traverse the array only once.

### Space Complexity

```text
O(1)
```

No extra array is used.

---

## 10-Second Interview Explanation

> I use two pointers. `right` scans the array looking for non-zero elements, while `left` tracks where the next non-zero should be placed. Whenever `right` finds a non-zero, I swap it with `left` and move `left` forward. This keeps all non-zero elements at the front and pushes zeros to the end in O(n) time and O(1) space.
