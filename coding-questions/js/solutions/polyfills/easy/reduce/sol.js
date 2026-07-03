let arr = [1, 2, 3, 4, 5];

Array.prototype.myReduce = function (callback, initialValue) {
  const arr = this;
  let accumulator = initialValue === undefined ? arr[0] : initialValue;
  let startIndex = initialValue === undefined ? 1 : 0;
  for (let i = startIndex; i < arr.length; i++) {
    accumulator = callback(accumulator, arr[i], i, arr);
  }
  return accumulator;
};
const result = arr.myReduce((acc, current) => acc + current, 0);
console.log(result);
