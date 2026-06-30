# LeetCode 121 - Best Time to Buy and Sell Stock

## Problem Statement

You are given an array `prices` where:

- `prices[i]` = price of a stock on day `i`

You want to:

1. Buy one stock on one day.
2. Sell it on a later day.

Return the **maximum profit** you can achieve.

If no profit is possible, return `0`.

### Example

```js
Input: [7, 1, 5, 3, 6, 4];

Output: 5;
```

Explanation:

- Buy at price `1`
- Sell at price `6`
- Profit = `6 - 1 = 5`

---

## Intuition

For every day, we need two things:

1. The **lowest price seen so far** (best day to buy)
2. The profit if we sell today

Instead of checking every pair of days (`O(n²)`), we can:

- Keep track of the minimum price seen so far.
- For each current price:
  - Calculate profit = currentPrice - minPrice
  - Update maximum profit if needed.

### Key Idea

When we reach a day:

- The best buying price is always the minimum price from previous days.
- The current day can act as a selling day.

So:

```text
Profit Today = Current Price - Lowest Price Seen So Far
```

---

## Visual Example

```js
prices = [7, 1, 5, 3, 6, 4];
```

### Day 1

```text
Price = 7

Min Price = 7
Profit = 0
Max Profit = 0
```

---

### Day 2

```text
Price = 1

Min Price = min(7,1) = 1

Profit = 1 - 1 = 0

Max Profit = 0
```

---

### Day 3

```text
Price = 5

Min Price = 1

Profit = 5 - 1 = 4

Max Profit = 4
```

---

### Day 4

```text
Price = 3

Min Price = 1

Profit = 3 - 1 = 2

Max Profit = 4
```

---

### Day 5

```text
Price = 6

Min Price = 1

Profit = 6 - 1 = 5

Max Profit = 5
```

---

### Day 6

```text
Price = 4

Min Price = 1

Profit = 4 - 1 = 3

Max Profit = 5
```

---

## Dry Run Table

| Day | Price | Min Price So Far | Profit If Sold Today | Max Profit |
| --- | ----- | ---------------- | -------------------- | ---------- |
| 1   | 7     | 7                | 0                    | 0          |
| 2   | 1     | 1                | 0                    | 0          |
| 3   | 5     | 1                | 4                    | 4          |
| 4   | 3     | 1                | 2                    | 4          |
| 5   | 6     | 1                | 5                    | 5          |
| 6   | 4     | 1                | 3                    | 5          |

Final Answer:

```text
5
```

---

## Approach

1. Initialize:
   - `minPrice` = first price
   - `maxProfit` = 0

2. Iterate through the array:
   - Update minimum price seen so far.
   - Calculate profit if sold today.
   - Update maximum profit.

3. Return `maxProfit`.

---

## Code

```js
var maxProfit = function (prices) {
  let minPrice = prices[0];
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    minPrice = Math.min(minPrice, prices[i]);

    const profit = prices[i] - minPrice;

    maxProfit = Math.max(maxProfit, profit);
  }

  return maxProfit;
};
```

---

## Why This Works

At every index:

```text
Current Price = Possible Selling Price
Minimum Price Seen So Far = Best Buying Price
```

Therefore:

```text
Profit = Sell Price - Buy Price
```

We continuously keep the best buying price and the best profit found so far.

---

## Time Complexity

```text
O(n)
```

We traverse the array once.

---

## Space Complexity

```text
O(1)
```

Only two variables are used:

- minPrice
- maxProfit
