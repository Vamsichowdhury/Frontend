var moveZeroes = function (nums) {
  const nonZeroes = [];
  const zeroes = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nonZeroes.push(nums[i]);
    } else {
      zeroes.push(nums[i]);
    }
  }
  return [...nonZeroes, ...zeroes];
};

var moveZeroesOptimized = function (nums) {
  let L = 0;
  for (let R = 0; R < nums.length; R++) {
    // R is searching for non zero element to replace L
    if (nums[R] !== 0) {
      [nums[L], nums[R]] = [nums[R], nums[L]];
      L++;
    }
  }
};
console.log(moveZeroesOptimized([0, 1, 0, 3, 12])); // Output: [1, 3, 12, 0, 0]
