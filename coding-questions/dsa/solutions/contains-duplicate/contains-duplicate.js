var containsDuplicate = function (nums) {
  const hashMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (hashMap.has(nums[i])) {
      return true;
    } else {
      hashMap.set(nums[i], i);
    }
  }
  return false;
};

/*

time complexity: O(n)
space : O(n)

*/
