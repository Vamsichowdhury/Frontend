var majorityElement = function (nums) {
  const freq = {};
  for (let i = 0; i < nums.length; i++) {
    const char = nums[i];
    freq[char] = (freq[char] || 0) + 1;

    if (freq[char] > nums.length / 2) {
      return char;
    }
  }
};
