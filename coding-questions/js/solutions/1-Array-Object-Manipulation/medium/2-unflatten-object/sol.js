/*
// TODO
Implement a function unflattenObject(obj) that converts a flattened object into a nested object.

const obj = {
  "user.name": "John",
  "user.age": 25,
  "user.address.city": "New York"
};

{
  user: {
    name: "John",
    age: 25,
    address: {
      city: "New York"
    }
  }
}

*/

function unflatten(obj) {
  for (skey in obj) {
    const keys = skey.split(".");
    for (key of keys) {
    }
  }
}
