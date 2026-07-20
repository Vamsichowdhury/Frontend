var missingNumber = function (nums) {
  const n = nums.length;
  const sumOfNnums = (n * (n + 1)) / 2;
  const sum = nums.reduce((acc, curr) => acc + curr, 0);
  return sumOfNnums - sum;
};
