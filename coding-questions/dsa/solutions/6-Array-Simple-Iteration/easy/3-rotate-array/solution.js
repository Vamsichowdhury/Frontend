/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function (nums, k) {
  for (let i = 0; i < k; i++) {
    const lastNum = nums.pop();
    nums.unshift(lastNum);
  }
};

var rotate = function (nums, k) {
  const n = nums.length;
  k = k % n;
  reverseArray(nums, 0, nums.length - 1); // reverse entire array
  reverseArray(nums, 0, k - 1); // reverse first k elements
  reverseArray(nums, k, nums.length - 1); // reverse last nums.length - k elements
};

var reverseArray = (arr, left, right) => {
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
};

// 1    2   3   4   5   6   7 --> last k numbers should come first in the array, which means we need to reverse the array

// 7    6   5   4   3   2   1  --> first k elemets are in correct order, but just that in reverse order. so reverse them back

// 5    6   7   4   3   2   1  --> last n-k elemets are in correct order, but just that in reverse order. so reverse them back.

// 5    6   7   1   2   3   4

// Time complexity: Each traversal traverses the array only once, which means O(n)
// Space complexity: No new data structure is used : O(1)

/*

        1    2   3  k = 5


        3    1   2    k = 1
        2    3   1    k = 2
        1    2   3    k = 3
        3    1   2    k = 4
        2    3   1    k = 5 which is equals to k=2 which means x%y should be 2 ==> 5%3=2 ==> k%nums.length
*/
