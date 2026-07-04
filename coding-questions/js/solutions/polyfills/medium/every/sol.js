/*
Array.prototype.every() checks whether every element in an array satisfies a condition.

Think of it as asking:

“Does every item pass this test?”

* ✅ If all elements pass → returns true
* ❌ If even one element fails → returns false immediately (stops looping)

*/

let arr = [1, 2, 3, 4, 5];
console.log(arr.every((num) => num > 0)); // true
console.log(arr.every((num) => num % 2 === 0)); // false

Array.prototype.myEvery = function (callback) {
  let arr = this;
  for (let i = 0; i < arr.length; i++) {
    if (!callback(arr[i], i, arr)) {
      return false;
    }
  }
  return true;
};
