/**
 * @param {number[]} prices
 * @return {number}
 */

// brute force
var maxProfit = function (prices) {
  let profit = 0;
  for (let i = 0; i < prices.length - 1; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      const curProfit = prices[j] - prices[i];
      if (curProfit > profit) {
        profit = curProfit;
      }
    }
  }
  return profit;
};

// optimized way
var maxProfit = function (prices) {
  let min = prices[0];
  let profit = 0;
  let i = 0;
  while (i < prices.length) {
    if (prices[i] < min) {
      min = prices[i];
    }
    const currentProfit = prices[i] - min;
    if (currentProfit > profit) {
      profit = currentProfit;
    }
    i++;
  }
  return profit;
};
