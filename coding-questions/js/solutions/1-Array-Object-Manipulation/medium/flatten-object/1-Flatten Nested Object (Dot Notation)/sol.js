const user = {
  user: {
    profile: {
      firstName: "John",
      lastName: "Doe",
    },
    age: 25,
  },
  active: true,
};

function flattenObject(obj, prevKey = "") {
  let result = {};
  for (key in obj) {
    if (typeof obj[key] === "object") {
      result = {
        ...result,
        ...flattenObject(obj[key], prevKey ? `${prevKey}.${key}` : key),
      };
    } else {
      result[prevKey ? `${prevKey}.${key}` : key] = obj[key];
    }
  }
  return result;
}

console.log(flattenObject(user));
