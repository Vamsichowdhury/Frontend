function first() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("First function result");
    }, 2000);
  });
}

function second() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Second function result");
    }, 1000);
  });
}

function third() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Third function result");
    }, 1500);
  });
}

// Using async/await with Promise.all
const [firstResult, secondResult, thirdResult] = await Promise.all([
  first(),
  second(),
  third(),
]);

console.log("First result:", firstResult); // Output: First result: First function result
console.log("Second result:", secondResult); // Output: Second result: Second function result
console.log("Third result:", thirdResult); // Output: Third result: Third function result

// Using Promise.all with .then and .catch

Promise.all([first(), second(), third()])
  .then((results) => {
    console.log("All promises resolved:", results);
    // Output: All promises resolved:
    // [ 'First function result', 'Second function result', 'Third function result' ]
  })
  .catch((error) => {
    console.error("One of the promises rejected:", error);
  });
