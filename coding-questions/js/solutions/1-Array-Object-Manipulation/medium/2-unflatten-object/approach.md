# Intuition

Imagine you're creating folders on your computer.

Suppose someone tells you to create this path:

```
user/address/city
```

What would you do?

1. Go to the root.
2. Is there a folder named `user`?
   - If not, create it.
3. Go inside `user`.
4. Is there a folder named `address`?
   - If not, create it.
5. Go inside `address`.
6. Create a file named `city`.

That's exactly what we're doing with objects.

---

## Example

Input:

```javascript
{
  "user.address.city": "Hyderabad"
}
```

The key tells us the path:

```
user
   ↓
address
   ↓
city
```

We start with an empty object.

```javascript
{
}
```

---

### Step 1

Split the key.

```javascript
"user.address.city".split(".");
```

Result:

```javascript
["user", "address", "city"];
```

Now we know the path we need to follow.

---

### Step 2

Start from the root object.

```javascript
{}
 ^
current
```

The `current` variable always tells us **where we are**.

Initially,

```javascript
current = result;
```

---

### Step 3

First word = `"user"`

Does `user` exist?

```
{}
```

No.

Create it.

```javascript
{
  user: {
  }
}
```

Move inside it.

```
{
  user: {}
         ^
      current
}
```

Notice that `current` has moved.

---

### Step 4

Next word = `"address"`

Current object is

```javascript
{
}
```

Does `address` exist?

No.

Create it.

```javascript
{
  user: {
    address: {
    }
  }
}
```

Move inside it.

```
{
  user: {
    address: {}
              ^
           current
  }
}
```

---

### Step 5

Last word = `"city"`

We're already inside `address`.

Simply assign the value.

```javascript
current["city"] = "Hyderabad";
```

Result

```javascript
{
  user: {
    address: {
      city: "Hyderabad";
    }
  }
}
```

Done!

---

# Another Example

Input

```javascript
{
  "user.name": "John",
  "user.age": 25
}
```

Process first key.

```
user
   ↓
name
```

Create

```javascript
{
  user: {
    name: "John";
  }
}
```

Now process second key.

```
user
   ↓
age
```

When we check,

```
user
```

already exists.

So we DON'T create it again.

We simply go inside it.

Then add

```javascript
age: 25;
```

Final object

```javascript
{
  user: {
    name: "John",
    age: 25
  }
}
```

---

# The Biggest Idea

The algorithm only does two things repeatedly.

1. **If the object doesn't exist → Create it.**

```javascript
if (!current[key]) {
  current[key] = {};
}
```

2. **Move inside that object.**

```javascript
current = current[key];
```

That's it!

Everything else is just looping over the path.

---

# Think of `current` as Your Position

Imagine you're walking through rooms in a house.

```
House
 └── user
      └── address
            └── city
```

Initially you're standing in the house.

```
current
   ↓
House
```

Move to `user`.

```
House
 └── user  ← current
```

Move to `address`.

```
House
 └── user
       └── address ← current
```

Finally create

```
city = "Hyderabad"
```

The variable `current` is nothing more than **"where am I right now?"**
