/*
What is reduce()?

reduce() is an array reduction method.

Unlike map(), which returns another array, reduce() reduces an entire array into a single value.

That single value can be:

* A number
* A string
* An object
* An array
* A Map
* A Set
* Anything

Think of reduce() as repeatedly combining values until only one final result remains.

*/

// Example 1: Sum of all numbers in an array
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((accumulator, currentValue) => {
  return accumulator + currentValue;
}, 0);

console.log(sum); // Output: 15

// Example 2: Concatenate all strings in an array
const strings = ["Hello", " ", "World", "!"];

const concatenatedString = strings.reduce((accumulator, currentValue) => {
  return accumulator + currentValue;
}, "");

console.log(concatenatedString); // Output: "Hello World!"

// Example 3: Count occurrences of elements in an array
const fruits = ["apple", "banana", "orange", "apple", "banana", "apple"];

const fruitCount = fruits.reduce((accumulator, currentValue) => {
  if (accumulator[currentValue]) {
    accumulator[currentValue]++;
  } else {
    accumulator[currentValue] = 1;
  }
  return accumulator;
}, {});

// Output: { apple: 3, banana: 2, orange: 1 }
console.log(fruitCount);

// Example 4: Flatten an array of arrays
const nestedArrays = [
  [1, 2],
  [3, 4],
  [5, 6],
];

const flattenedArray = nestedArrays.reduce((accumulator, currentValue) => {
  return accumulator.concat(currentValue);
}, []);

// Output: [1, 2, 3, 4, 5, 6]
console.log(flattenedArray);

// Example 5: Find the maximum value in an array
const values = [10, 5, 20, 15];

const maxValue = values.reduce((accumulator, currentValue) => {
  return Math.max(accumulator, currentValue);
}, -Infinity);

// Output: 20
console.log(maxValue);

// Example 6: Group objects by a property
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 },
];

const groupedByAge = people.reduce((accumulator, currentValue) => {
  const age = currentValue.age;
  if (!accumulator[age]) {
    accumulator[age] = [];
  }
  accumulator[age].push(currentValue);
  return accumulator;
}, {});

// Output: { '25': [ { name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 } ], '30': [ { name: 'Bob', age: 30 } ] }
console.log(groupedByAge);

// Example 7: Create a frequency map of characters in a string
const inputString = "hello world";

const charFrequency = inputString
  .split("")
  .reduce((accumulator, currentValue) => {
    if (currentValue !== " ") {
      // Ignore spaces
      if (accumulator[currentValue]) {
        accumulator[currentValue]++;
      } else {
        accumulator[currentValue] = 1;
      }
    }
    return accumulator;
  }, {});

// Output: { h: 1, e: 1, l: 3, o: 2, w: 1, r: 1, d: 1 }
console.log(charFrequency);

// Example 8: Create a new array with unique values
const arrayWithDuplicates = [1, 2, 3, 2, 4, 1, 5];

const uniqueValues = arrayWithDuplicates.reduce((accumulator, currentValue) => {
  if (!accumulator.includes(currentValue)) {
    accumulator.push(currentValue);
  }
  return accumulator;
}, []);

// Output: [1, 2, 3, 4, 5]
console.log(uniqueValues);
