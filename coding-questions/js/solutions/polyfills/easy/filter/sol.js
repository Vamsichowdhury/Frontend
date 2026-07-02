/*

what is filter function in js

filter is a function that takes a callback function as an argument.

The callback function is executed for each element in the array, and the return value of the callback function is used to determine whether or not to include the element in the new array. 

If the callback function returns true, the element is included in the new array.

If the callback function returns false, the element is not included in the new array.

*/

const arr = [1, 2, 3, 4, 5];

function isEven(item) {
  return item % 2 === 0;
}

const evenNumbers = arr.filter(isEven);
console.log(evenNumbers); // [2, 4]

Array.prototype.myFilter = function (callback) {
  const newArr = [];
  const arr = this;
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i], i, arr)) {
      newArr.push(arr[i]);
    }
  }
  return newArr;
};

const newResult = arr.myFilter((item) => item % 2 === 0);
console.log(newResult);
