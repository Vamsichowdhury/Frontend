var isValid = function (s) {
  const stack = [];
  const mappings = {
    ")": "(",
    "}": "{",
    "]": "[",
  };
  for (let c of s) {
    if (mappings[c]) {
      if (stack[stack.length - 1] === mappings[c]) {
        stack.pop();
      } else {
        return false;
      }
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0 ? true : false;
};
