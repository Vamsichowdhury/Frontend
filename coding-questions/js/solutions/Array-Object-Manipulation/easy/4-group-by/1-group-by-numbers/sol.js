/*

Question

Group numbers into “even” and “odd”.

Input: [1, 2, 3, 4, 5, 6]
Output: { even: [2, 4, 6], odd: [1, 3, 5] }

*/
// with out reduce

function groupByNumbers(arr) {
  const result = {
    even: [],
    odd: [],
  };

  for (const num of arr) {
    if (num % 2 === 0) {
      result.even.push(num);
    } else {
      result.odd.push(num);
    }
  }
  return result;
}

console.log(groupByNumbers([1, 2, 3, 4, 5, 6])); // Output: { even: [2, 4, 6], odd: [1, 3, 5] }

// with reduce

function groupByNumbersWithReduce(arr) {
  return arr.reduce(
    (result, num) => {
      if (num % 2 === 0) {
        result.even.push(num);
      } else {
        result.odd.push(num);
      }
      return result;
    },
    { even: [], odd: [] },
  );
}

console.log(groupByNumbersWithReduce([1, 2, 3, 4, 5, 6])); // Output: { even: [2, 4, 6], odd: [1, 3, 5] }
