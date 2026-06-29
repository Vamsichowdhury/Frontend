/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortedSquares = function (nums) {
  const squared = [];
  for (const num of nums) {
    squared.push(num * num);
  }
  const result = Array(nums.length);

  let l = 0;
  let r = nums.length - 1;
  let p = nums.length - 1;

  while (l <= r) {
    if (squared[l] < squared[r]) {
      result[p] = squared[r];
      p--;
      r--;
    } else {
      result[p] = squared[l];
      p--;
      l++;
    }
  }
  return result;
};
