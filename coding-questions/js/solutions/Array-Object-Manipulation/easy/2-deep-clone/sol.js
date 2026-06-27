/*
Create a function that makes a completely independent copy of an object, including all nested objects and arrays.
*/

function deepClone(val) {
  // it means that the value is not an object or array, whihc means the value is a primitive value like string, number, boolean, null, or undefined, so we can return it as is
  if (typeof val !== "object") {
    return val;
  }
  // arrays
  if (Array.isArray(val)) {
    return val.map((item) => deepClone(item));
  }
  // objects
  const clone = {}; // create a new object to hold the cloned properties
  if (typeof val === "object") {
    for (const key in val) {
      clone[key] = deepClone(val[key]);
    }
  }
  return clone;
}

// Example usage:
const original = {
  name: "John",
  age: 30,
  hobbies: ["reading", "gaming"],
  address: {
    city: "New York",
    zip: "10001",
  },
};

// Create a deep clone of the original object
const cloned = deepClone(original);

// Modify the clone
cloned.name = "Jane";
cloned.address.city = "Los Angeles";

// The original object remains unchanged
console.log(original);
console.log(cloned);

// new simple in built method to deep clone an object
const original2 = {
  name: "Alice",
  age: 25,
  hobbies: ["painting", "hiking"],
  address: {
    city: "San Francisco",
    zip: "94101",
  },
};

// Create a deep clone using structuredClone
const cloned2 = structuredClone(original2);

// Modify the clone
cloned2.name = "Bob";
cloned2.address.city = "Seattle";

// The original object remains unchanged
console.log(original2);
console.log(cloned2);
