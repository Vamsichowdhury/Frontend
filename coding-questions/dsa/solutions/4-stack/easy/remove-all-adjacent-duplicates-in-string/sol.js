/**

 * @param {string} s

 * @return {string}
 *
 */

var removeDuplicates = function (s) {
  const stack = [];

  for (const char of s) {
    // If current character matches the top of the stack,

    // remove the top element (adjacent duplicate found)

    if (stack.length > 0 && stack[stack.length - 1] === char) {
      stack.pop();
    } else {
      // Otherwise, keep the character

      stack.push(char);
    }
  }

  // Convert the stack back into a string

  return stack.join("");
};

/**
 * @param {string} s
 * @return {string}
 */
var removeDuplicates = function (s) {
  const stack = [];
  for (let c of s) {
    if (stack.length > 0) {
      if (stack[stack.length - 1] === c) {
        stack.pop();
      } else {
        stack.push(c);
      }
    } else {
      stack.push(c);
    }
  }
  return stack.join("");
};
