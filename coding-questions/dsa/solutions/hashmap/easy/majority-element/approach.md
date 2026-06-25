# 169. Majority Element

## Approach

1. Count the frequency of each number using a hash map.
2. If any number's count becomes greater than `n / 2`, return it immediately.
3. The problem guarantees that a majority element always exists.

---

## Code

```js
var majorityElement = function (nums) {
  const freq = {};

  for (const num of nums) {
    freq[num] = (freq[num] || 0) + 1;

    if (freq[num] > nums.length / 2) {
      return num;
    }
  }
};
```

---

## Walkthrough

### Input

```js
nums = [2, 2, 1, 1, 1, 2, 2];
```

### Step 1: Build Frequency Map

```js
2 -> 1
2 -> 2
1 -> 1
1 -> 2
1 -> 3
2 -> 3
2 -> 4
```

### Step 2: Check Majority

```text
n = 7
n / 2 = 3.5

Frequency of 2 = 4 > 3.5 ✅
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

One pass through the array.

### Space Complexity

```text
O(N)
```

In the worst case, all elements are unique.
