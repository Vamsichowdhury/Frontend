# Flatten Object - Interview Variations

## 1. Flatten Nested Object (Dot Notation)

Flatten all nested object keys using `.`.

### Example

```javascript
Input:
{
  user: {
    name: "John",
    address: {
      city: "Hyderabad"
    }
  }
}

Output:
{
  "user.name": "John",
  "user.address.city": "Hyderabad"
}
```

---

## 2. Flatten Object Including Arrays

Arrays should also be flattened using their indices.

### Example

```javascript
Input:
{
  user: {
    hobbies: ["Cricket", "Coding"]
  }
}

Output:
{
  "user.hobbies.0": "Cricket",
  "user.hobbies.1": "Coding"
}
```

---

## 4. Flatten Only Up to K Levels

Flatten only the first `K` levels.

### Example (`K = 1`)

```javascript
Input:
{
  a: {
    b: {
      c: 1
    }
  }
}

Output:
{
  "a.b": {
    c: 1
  }
}
```

---

## 5. Skip Specific Keys

Do not flatten certain keys.

### Example

```javascript
Skip = ["address"]

Input:
{
  user: {
    name: "John"
  },
  address: {
    city: "Hyderabad"
  }
}

Output:
{
  "user.name": "John",
  address: {
    city: "Hyderabad"
  }
}
```

---

## 6. Flatten and Remove Null/Undefined

Ignore `null` and `undefined` values.

### Example

```javascript
Input:
{
  user: {
    name: "John",
    age: null
  }
}

Output:
{
  "user.name": "John"
}
```

---

## 7. Flatten Object Into Key-Value Pairs

Return an array instead of an object.

### Example

```javascript
Input: {
  a: {
    b: 1;
  }
}

Output: [["a.b", 1]];
```

---

## 8. Flatten Object Into Paths

Return only the property paths.

### Example

```javascript
Input: {
  a: {
    b: {
      c: 1;
    }
  }
}

Output: ["a.b.c"];
```

---

## 9. Unflatten an Object

Convert a flattened object back to its nested form.

### Example

```javascript
Input:
{
  "user.name": "John",
  "user.age": 25
}

Output:
{
  user: {
    name: "John",
    age: 25
  }
}
```

---

## 10. Flatten Object With Custom Separator

The separator is passed as a parameter.

### Example

```javascript
flatten(obj, "/");
```

Output

```javascript
{
  "user/name": "John"
}
```

---

## 11. Flatten While Preserving Arrays

Flatten objects but keep arrays unchanged.

### Example

```javascript
Input:
{
  user: {
    hobbies: ["JS", "React"]
  }
}

Output:
{
  "user.hobbies": ["JS", "React"]
}
```

---

## 12. Flatten Only Primitive Values

Ignore functions, symbols, and class instances.

### Example

```javascript
Input:
{
  a: 1,
  b: {
    c: () => {}
  }
}

Output:
{
  "a": 1
}
```
