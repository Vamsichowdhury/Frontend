# Squares of a Sorted Array - Intuition & Approach

## Intuition

The array is already sorted.

```text
[-7,-3,2,3,11]
```

But after squaring:

```text
[49,9,4,9,121]
```

it is no longer sorted.

---

### Key Observation

The largest square will always come from one of the ends:

```text
[-7,-3,2,3,11]
  L         R
```

Why?

Because the numbers with the largest absolute values are always at either:

- Left end (large negative)
- Right end (large positive)

Examples:

```text
|-7| = 7
|11| = 11
```

Largest square:

```text
11² = 121
```

---

After removing 11:

```text
[-7,-3,2,3]
  L      R
```

Again the largest square comes from either end:

```text
|-7| = 7
|3|  = 3
```

Largest square:

```text
49
```

---

Therefore, instead of sorting after squaring, we can:

1. Compare absolute values at both ends.
2. Put the larger square into the result array.
3. Fill the result array from right to left.

---

## Approach

### Step 1

Create a result array.

```js
const result = new Array(nums.length);
```

---

### Step 2

Initialize pointers.

```text
[-7,-3,2,3,11]
  L         R

Result:
[_, _, _, _, _]
              P
```

Where:

- `L` = left pointer
- `R` = right pointer
- `P` = position to fill in result

---

### Step 3

Compare absolute values.

```text
|-7| = 7
|11| = 11
```

11 is larger.

```text
121 goes at P
```

```text
[_, _, _, _, 121]
```

Move:

```text
R--
P--
```

---

### Step 4

Repeat until pointers cross.

At each step:

```text
if abs(nums[L]) > abs(nums[R])
    put nums[L]² into result[P]
    L++
else
    put nums[R]² into result[P]
    R--

P--
```

---

### Step 5

When all positions are filled:

```text
[4,9,9,49,121]
```

---

## Why Fill From Right to Left?

Because every iteration finds the **largest remaining square**.

Largest values belong at the end of the sorted result.

```text
Result:

[_, _, _, _, 121]
[_, _, _, 49, 121]
[_, _, 9, 49, 121]
[_, 9, 9, 49, 121]
[4, 9, 9, 49, 121]
```

---

## Complexity

### Time

```text
O(n)
```

Each pointer moves at most `n` times.

---

### Space

```text
O(n)
```

For the result array.

---

# Squares of a Sorted Array

Input:

```text
[-7,-3,2,3,11]
  L         R
```

Result:

```text
[_, _, _, _, _]
              P
```

---

## Iteration 1

```text
[-7,-3,2,3,11]
  L         R

|-7| = 7
|11| = 11
```

11 is larger.

```text
11² = 121
```

Place at P.

```text
Result:

[_, _, _, _, 121]
           P

Move R--
Move P--
```

---

## Iteration 2

```text
[-7,-3,2,3,11]
  L      R

|-7| = 7
|3|  = 3
```

7 is larger.

```text
(-7)² = 49
```

Place at P.

```text
[_, _, _, 49, 121]
        P

Move L++
Move P--
```

---

## Iteration 3

```text
[-7,-3,2,3,11]
     L   R

|-3| = 3
|3|  = 3
```

Either side works.

```text
3² = 9
```

Place at P.

```text
[_, _, 9, 49, 121]
     P

Move R--
Move P--
```

---

## Iteration 4

```text
[-7,-3,2,3,11]
     L R

|-3| = 3
|2|  = 2
```

3 is larger.

```text
(-3)² = 9
```

Place at P.

```text
[_, 9, 9, 49, 121]
  P

Move L++
Move P--
```

---

## Iteration 5

```text
[-7,-3,2,3,11]
       L
       R

|2| = 2
```

```text
2² = 4
```

Place at P.

```text
[4, 9, 9, 49, 121]
```

Done.

---

# Pointer Movement Summary

```text
Step 1

[-7,-3,2,3,11]
  L         R
            ↑
          121


Step 2

[-7,-3,2,3,11]
     L    R
         ↑
         49


Step 3

[-7,-3,2,3,11]
     L R
       ↑
       9


Step 4

[-7,-3,2,3,11]
       LR
     ↑
     9


Step 5

[-7,-3,2,3,11]
       L
       R
↑
4
```

### Final Result

```text
[4, 9, 9, 49, 121]
```

## Interview Explanation

> Since the input array is already sorted, the largest square must come from either the leftmost negative number or the rightmost positive number. We use two pointers to compare absolute values at both ends, place the larger square at the end of the result array, and move inward. This allows us to build the sorted squared array in O(n) time without performing an additional sort.
