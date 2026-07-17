/*
// TODO
Implement a function unflattenObject(obj) that converts a flattened object into a nested object.

const obj = {
  "user.name": "John",
  "user.age": 25,
  "user.address.city": "New York",
  "user.address.zip": "10001"
  isAdmin: true
};

{
  user: {
    name: "John",
    age: 25,
    address: {
      city: "New York",
      zip: "10001"
    }
  },
 isAdmin: true
}
  This process is similar to creating a folder
  for example i want to create a react machine coding folder
  which means first i want create UI -> Interview -> React -> machine coding

  i'll check if UI folder exists 
    if exists i'll move inside and check if Interview folder exists
    if not i'll create UI folder first and i'll move inside.
    Repeat

*/

function unflatten(obj) {
  const result = {};
  for (const skey in obj) {
    let current = result; // tracks the current obj/folder
    const keys = skey.split(".");
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = obj[skey];
  }
  return result;
}

console.log(
  unflatten({
    "user.name": "John",
    "user.age": 25,
    "user.address.city": "New York",
    "user.address.zip": "10001",
    isAdmin: true,
  }),
);
