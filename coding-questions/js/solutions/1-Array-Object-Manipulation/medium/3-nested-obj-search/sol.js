// Given a nested object, write a function that checks whether a target value exists anywhere inside the object.

const data = {
  name: "John",
  age: 30,
  address: {
    city: "Hyderabad",
    country: "India",
    location: {
      pincode: 500081,
    },
  },
};

function searchNestedObject(obj, target) {
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const result = searchNestedObject(obj[key], target);
      if (result) return true;
    } else {
      if (obj[key] === target) return true;
    }
  }
  return false;
}

console.log(searchNestedObject(data, "Hyderabad")); // true

// Return the path of the value instead of true/false.

function searchNestedObjectPath(obj, target, prevPath = "") {
  for (const key in obj) {
    const currentPath = prevPath ? `${prevPath}.${key}` : key;

    if (typeof obj[key] === "object" && obj[key] !== null) {
      const result = searchNestedObjectPath(obj[key], target, currentPath);
      if (result) return result;
    } else {
      if (obj[key] === target) return currentPath;
    }
  }
  return null;
}

console.log(searchNestedObjectPath(data, "Hyderabad")); // address.city
