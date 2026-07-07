// 1. Check if array contains a negative number
const nums = [5, 10, -2, 8];
const result = nums.some((num) => num < 0);
console.log(result);
// true

// 2. Check if any string is empty
const names = ["John", "", "Alex"];
console.log(names.some((name) => name === ""));
// true

// 3. Check if array contains an even number
const numbers = [1, 3, 5, 8];
console.log(numbers.some((num) => num % 2 === 0));
// true

// 4. Check if any product is out of stock
const products = [
  { name: "Laptop", stock: 5 },
  { name: "Phone", stock: 10 },
  { name: "Mouse", stock: 12 },
];

console.log(products.some((product) => product.stock === 0));
// true

// 5. Check if an array has duplicates
const arr = [1, 2, 3, 4, 5, 1];
const hasDuplicates = arr.some((item, index) => arr.indexOf(item) !== index);
console.log(hasDuplicates);

// 6. Check if any object has duplicate ID
const items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
  { id: 1, name: "Item 4" },
];
