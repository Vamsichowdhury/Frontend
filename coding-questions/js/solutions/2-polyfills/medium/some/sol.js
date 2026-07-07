/*
some() checks whether at least one element satisfies a condition.

* Returns true if any element passes the test.
* Returns false if none pass.
* Stops iterating as soon as it finds a match (short-circuiting).

*/

let arr = [1, 2, 3, 4, 5, -1];

console.log(arr.some((item) => item < 0)); // true

Array.prototype.mySome = function (callback) {
  let arr = this;
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i], i, arr)) {
      // Returns true if any element passes the test.
      return true;
    }
  }
  return false; // Returns false if none pass
};

// interview ready version of mySome function
Array.prototype.mySome = function (callback) {
  // Check if the callback is a function
  if (typeof callback !== "function") {
    throw new TypeError(`${callback} is not a function`);
  }

  const arr = this;
  const length = arr.length;

  for (let i = 0; i < length; i++) {
    // Skip sparse array holes. Eg: [1, 2, , 4].some(callback) will skip the empty slot at index 2
    if (!(i in arr)) continue;

    if (callback(arr[i], i, arr)) {
      return true;
    }
  }

  return false;
};
