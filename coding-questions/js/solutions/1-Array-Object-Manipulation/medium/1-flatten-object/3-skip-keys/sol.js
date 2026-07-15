function flattenObject(obj, level, prevKey = "", skipKeys = []) {
  let result = {};
  for (key in obj) {
    if (skipKeys.includes(key)) continue;
    const path = prevKey ? `${prevKey}.${key}` : key;

    if (typeof obj[key] === "object" && level > 0) {
      result = {
        ...result,
        ...flattenObject(obj[key], level - 1, path, skipKeys),
      };
    } else {
      result[path] = obj[key];
    }
  }
  return result;
}

const obj = {
  user: {
    profile: {
      firstName: "John",
      lastName: "Doe",
    },
    age: 25,
    password: "12345",
  },
  active: true,
};

console.log(flattenObject(obj, 3, "", ["password"]));
