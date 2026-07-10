// const user = {
//   user: {
//     profile: {
//       firstName: "John",
//       lastName: "Doe",
//     },
//     age: 25,
//   },
//   active: true,
// };

function flattenObject(obj, prevKey = "") {
  let result = {};
  for (key in obj) {
    const path = prevKey ? `${prevKey}.${key}` : key;

    if (typeof obj[key] === "object") {
      result = {
        ...result,
        ...flattenObject(obj[key], path),
      };
    } else {
      result[path] = obj[key];
    }
  }
  return result;
}

// console.log(flattenObject(user));

const user2 = {
  user: {
    profile: {
      firstName: "John",
      lastName: "Doe",
    },
    hobbies: ["Cricket", "Coding"],
    age: 25,
    address: null,
  },
  active: true,
};
// skip array values and null values
function flattenObject2(obj, prevKey = "") {
  let result = {};
  for (key in obj) {
    const path = prevKey ? `${prevKey}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      obj[key] !== null
    ) {
      result = {
        ...result,
        ...flattenObject2(obj[key], path),
      };
    } else {
      result[path] = obj[key];
    }
  }
  return result;
}

console.log(flattenObject2(user2));
