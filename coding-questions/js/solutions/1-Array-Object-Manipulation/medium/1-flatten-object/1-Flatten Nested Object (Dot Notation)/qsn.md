## 1. Flatten Nested Object (Dot Notation)

Flatten all nested object keys using `.`.

### Example

```javascript

Input:

{

  user: {
    profile: {
      firstName: "John",
      lastName: "Doe"
    },
    age: 25
  },
  active: true
}

Output:

{
  "user.profile.firstName": "John",
  "user.profile.lastName": "Doe",
  "user.age": 25,
  "active": true
}

```

---

# Flatten Object (Using Recursion)

## Problem Statement

Given a nested JavaScript object, flatten it into a single-level object using **dot (`.`) notation**.

### Input

```javascript
const obj = {
  user: {
    profile: {
      firstName: "John",
      lastName: "Doe",
    },
    age: 25,
  },
  active: true,
};
```

### Output

```javascript
{
  "user.profile.firstName": "John",
  "user.profile.lastName": "Doe",
  "user.age": 25,
  "active": true
}
```

---

# Intuition

- If the value is **another object**, keep going deeper (recursion).
- If the value is **not an object** (primitive), we've reached a leaf node.
- Store the leaf node with its complete path.

---

# Approach

1. Create an empty result object.
2. Traverse each key in the current object.
3. Build the current path.
4. If the value is an object, recursively flatten it.
5. Otherwise, store the value in the result.

---

# Recursion Diagram

```
flatten(obj, "")

│
├── user (object)
│   │
│   └── flatten(user, "user")
│       │
│       ├── profile (object)
│       │   │
│       │   └── flatten(profile, "user.profile")
│       │       │
│       │       ├── firstName
│       │       │
│       │       └── result["user.profile.firstName"] = "John"
│       │
│       │
│       │
│       │       ├── lastName
│       │       │
│       │       └── result["user.profile.lastName"] = "Doe"
│       │
│       │
│       ├── age
│       │
│       └── result["user.age"] = 25
│
│
├── active
│
└── result["active"] = true
```

---

# How the Path Changes

```
""                     (root)
│
├── user
│      path = "user"
│
├── profile
│      path = "user.profile"
│
├── firstName
│      path = "user.profile.firstName"
│
└── lastName
       path = "user.profile.lastName"
```

---

# Dry Run

### Initially

```javascript
result = {};
```

---

### Visit `user`

```javascript
path = "user";
```

It's an object.

Go deeper.

---

### Visit `profile`

```javascript
path = "user.profile";
```

It's an object.

Go deeper.

---

### Visit `firstName`

```javascript
path = "user.profile.firstName";

result = {
  "user.profile.firstName": "John",
};
```

Return.

---

### Visit `lastName`

```javascript
path = "user.profile.lastName";

result = {
  "user.profile.firstName": "John",
  "user.profile.lastName": "Doe",
};
```

Return.

---

### Back to `user`

Visit `age`

```javascript
path = "user.age";

result = {
  "user.profile.firstName": "John",
  "user.profile.lastName": "Doe",
  "user.age": 25,
};
```

Return.

---

### Visit `active`

```javascript
path = "active";

result = {
  "user.profile.firstName": "John",
  "user.profile.lastName": "Doe",
  "user.age": 25,
  active: true,
};
```

Done.

---

# Code

```javascript
function flattenObject(obj) {
  const result = {};

  function flatten(current, path) {
    for (const key in current) {
      const newPath = path ? `${path}.${key}` : key;

      if (
        typeof current[key] === "object" &&
        current[key] !== null &&
        !Array.isArray(current[key])
      ) {
        flatten(current[key], newPath);
      } else {
        result[newPath] = current[key];
      }
    }
  }

  flatten(obj, "");

  return result;
}
```

---

# Example

```javascript
const obj = {
  user: {
    profile: {
      firstName: "John",
      lastName: "Doe",
    },
    age: 25,
  },
  active: true,
};

console.log(flattenObject(obj));
```

### Output

```javascript
{
  "user.profile.firstName": "John",
  "user.profile.lastName": "Doe",
  "user.age": 25,
  "active": true
}
```

---

# Complexity

### Time Complexity

```
O(n)
```

Every property is visited exactly once.

### Space Complexity

```
O(n)
```

- Result object stores all flattened keys.
- Recursion stack is `O(depth)`.
