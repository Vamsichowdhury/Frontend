const obj = {
  a: {
    b: {
      c: {
        d: 1,
      },
    },
    e: {
      f: 2,
      g: {
        h: 3,
      },
    },
  },
};
function flattenObject2(obj, level, prevKey = "") {
  let result = {};
  for (key in obj) {
    const path = prevKey ? `${prevKey}.${key}` : key;

    if (typeof obj[key] === "object" && level > 0) {
      result = {
        ...result,
        ...flattenObject2(obj[key], level - 1, path),
      };
    } else {
      result[path] = obj[key];
    }
  }
  return result;
}

console.log(flattenObject2(obj, 2));
