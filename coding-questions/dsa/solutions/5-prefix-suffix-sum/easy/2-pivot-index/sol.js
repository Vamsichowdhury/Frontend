/**
 * @param {number[]} nums
 * @return {number}
 */
var pivotIndex = function (nums) {
  // we will be starting from left index, so by default left sum will be 0
  let leftSum = 0;

  // Now we need to check if right sum === left sum
  // first calculate total sum so that rightSum = totalSum - leftsum

  let totalSum = nums.reduce((acc, curr) => acc + curr, 0);

  for (let i = 0; i < nums.length; i++) {
    // Sum of elements to the right of the current index
    let rightSum = totalSum - leftSum - nums[i];
    // Check if current index is the pivot
    if (leftSum === rightSum) {
      return i;
    }
    // Update leftSum for the next iteration
    leftSum = leftSum + nums[i];
  }
  // No pivot index found
  return -1;
};
