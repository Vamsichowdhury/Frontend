// reduce array to a number
// sum of all numbers of an array

let arr = [1, 2, 3, 4, 5];

const result = arr.reduce((acc, current) => acc + current, 0);
console.log(result);

// Example 2: Concatenate all strings in an array
const strings = ["Hello", " ", "World", "!"];
// Output: "Hello World!"

const result2 = strings.reduce((acc, current) => acc + current, "");
console.log(result2);

// Example 3: Count occurrences of elements in an array
const fruits = ["apple", "banana", "orange", "apple", "banana", "apple"];
// Output: { apple: 3, banana: 2, orange: 1 }

const result3 = fruits.reduce((acc, current) => {
  if (acc[current]) {
    acc[current]++;
  } else {
    acc[current] = 1;
  }
  return acc;
}, {});

console.log(result3);

// Example 4: Flatten an array of arrays
const nestedArrays = [
  [1, 2],
  [3, 4],
  [5, 6],
];

// output: [1,2,3,4,5,6]

const result4 = nestedArrays.reduce((acc, curr) => {
  return [...acc, ...curr];
}, []);

console.log(result4);

// Example 5: Find the maximum value in an array
const values = [10, 5, 20, 15];
// output: 20

const result5 = values.reduce((max, curr) => {
  if (curr > max) return curr; // return Math.max(max, curr)
  return max;
}, -Infinity);

console.log(result5);
