var flat = function (arr, n) {
  const result = [];
  for (num of arr) {
    if (Array.isArray(num) && n > 0) {
      result.push(...flat(num, n - 1));
    } else {
      result.push(num);
    }
  }
  return result;
};
