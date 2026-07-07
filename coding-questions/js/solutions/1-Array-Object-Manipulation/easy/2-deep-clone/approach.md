# Deep Clone Object

## Problem

Create a function that makes a completely independent copy of an object, including all nested objects and arrays.

### Example

```js
const obj = {
  name: "Vamsi",
  address: {
    city: "Mumbai",
  },
};

const clone = deepClone(obj);

clone.address.city = "Delhi";

console.log(obj.address.city); // Mumbai ✅
console.log(clone.address.city); // Delhi
```

---

## Intuition

For every value:

1. If it is a primitive (string, number, boolean, null, undefined), return it.
2. If it is an array, create a new array and recursively clone each element.
3. If it is an object, create a new object and recursively clone each property.

This ensures no nested references are shared.

---

## Solution

```js
function deepClone(obj) {
  // Primitive values
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  // Objects
  const clone = {};

  for (const key in obj) {
    clone[key] = deepClone(obj[key]);
  }

  return clone;
}
```

---

## Walkthrough

### Input

```js
const obj = {
  name: "John",
  address: {
    city: "New York",
    zip: 10001,
  },
};
```

### Step 1

```js
deepClone(obj);
```

Create a new empty object:

```js
{
}
```

---

### Step 2

Copy `name`

```js
{
  name: "John";
}
```

---

### Step 3

`address` is an object.

```js
address: {
  city: "New York",
  zip: 10001
}
```

Recursively call:

```js
deepClone(address);
```

Create a completely new nested object.

---

### Final Output

```js
{
  name: "John",
  address: {
    city: "New York",
    zip: 10001,
  },
}
```

Both objects are independent.

---

## Time Complexity

```txt
O(n)
```

Every property is visited once.

---

## Space Complexity

```txt
O(n)
```

A completely new object is created.

---

## Why Not Use Spread Operator?

```js
const clone = { ...obj };
```

This only creates a **shallow copy**.

### Example

```js
const obj = {
  address: {
    city: "Mumbai",
  },
};

const clone = { ...obj };

clone.address.city = "Delhi";

console.log(obj.address.city); // Delhi ❌
```

The nested object is still shared.

---

## Modern JavaScript Solution

```js
const clone = structuredClone(obj);
```

### Example

```js
const obj = {
  name: "John",
  address: {
    city: "Mumbai",
  },
};

const clone = structuredClone(obj);
```

### Benefits

- Deep copies nested objects
- Deep copies arrays
- Simple and built-in
- No custom recursion needed

---

## Interview Answer (Short)

A deep clone creates a completely independent copy of an object, including all nested objects and arrays. We recursively traverse the object, create new arrays/objects, and copy primitive values directly. Time complexity is **O(n)** and space complexity is **O(n)**.
