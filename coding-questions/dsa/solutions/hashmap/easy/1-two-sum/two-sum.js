// Two Sum Problem : https://leetcode.com/problems/two-sum/description/

// var twoSum = function (nums, target) {
//     for (let i = 0; i < nums.length - 1; i++) {
//         for (let j = i + 1; j < nums.length; j++) {
//             if (nums[i] + nums[j] === target) {
//                 return [i, j]
//             }
//         }
//     }
// };

var twoSum = function (nums, target) {
  const hashMap = new Map();

  for (let i = 0; i < nums.length; i++) {
    const requiredNum = target - nums[i];
    if (hashMap.has(requiredNum)) {
      return [hashMap.get(requiredNum), i];
    } else {
      hashMap.set(nums[i], i);
    }
  }
};
