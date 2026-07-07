var flat = function (arr) {
  const result = [];
  for (num of arr) {
    if (Array.isArray(num)) {
      result.push(...flat(num));
    } else {
      result.push(num);
    }
  }
  return result;
};
