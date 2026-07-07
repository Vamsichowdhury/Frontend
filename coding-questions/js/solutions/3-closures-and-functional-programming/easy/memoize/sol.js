/*

function square(n) {
  return n * n;
}

const memoizedSquare = memoize(square);
console.log(memoizedSquare(5)); // Computing... 25
console.log(memoizedSquare(5)); // Returning from cache... 25
console.log(memoizedSquare(5)); // Returning from cache... 25
console.log(memoizedSquare(10)); // Computing... 100
console.log(memoizedSquare(10)); // Returning from cache... 100

*/

function memoize(fn) {
  let cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("Returning from cache...", cache.get(key));
      return cache.get(key);
    } else {
      const result = fn(...args);
      cache.set(key, result);
      console.log("Computing...", result);
      return result;
    }
  };
}
function square(n) {
  return n * n;
}

const memoizedSquare = memoize(square);

console.log(memoizedSquare(5));
console.log(memoizedSquare(5));
console.log(memoizedSquare(5));
console.log(memoizedSquare(10));
console.log(memoizedSquare(10));
