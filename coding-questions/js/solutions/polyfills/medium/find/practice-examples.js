// 1. Find the first even number
const nums = [1, 3, 5, 8, 10];
// output: 8

const result = nums.find((num) => num % 2 == 0);
console.log(result);

// 2. Find the first string longer than 5 characters
const words = ["cat", "dog", "elephant", "tiger"];
const longWord = words.find((word) => word.length > 5);
console.log(longWord);
// output: "elephant"

// 3. Find a product by ID

const products = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Phone" },
  { id: 3, name: "Tablet" },
];
const product = products.find((product) => product.id === 2);
console.log(product);
// output: { id: 2, name: "Phone" }
