function flattenToPairs(obj, prevKey = "") {
  let result = [];

  for (const key in obj) {
    const path = prevKey ? `${prevKey}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      result.push(...flattenToPairs(obj[key], path)); // Recursively flatten nested objects
    } else {
      result.push([path, obj[key]]);
    }
  }

  return result;
}

const obj = {
  a: {
    b: 1,

    c: 2,
  },

  d: 3,
};

console.log(flattenToPairs(obj)); // Output: [['a.b', 1], ['a.c', 2], ['d', 3]]
