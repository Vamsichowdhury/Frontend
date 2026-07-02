# Understanding `Array.prototype.map()`

Before implementing a polyfill, it's important to understand **what `map()` is** and **how it works internally**.

---

# What is `map()`?

`map()` is an **array transformation method**.

It **does not modify the original array**. Instead, it creates a **new array** by applying a callback function to every element of the original array.

### Steps performed by `map()`

1. Visit each element of the array.
2. Call the callback function for that element.
3. Take the value returned by the callback.
4. Store that returned value in a new array.
5. Return the new array after processing all elements.

Think of it as an assembly line:

```text
Original Array
      │
      ▼
+---------------------+
| callback(element)   |
+---------------------+
      │
      ▼
New Array
```

Example:

```javascript
const nums = [10, 20, 30];

const result = nums.map((num) => num * 2);

console.log(result); // [20, 40, 60]
```

Internally, it behaves like this:

```text
10
 ↓
callback(10)
 ↓
20 → stored

20
 ↓
callback(20)
 ↓
40 → stored

30
 ↓
callback(30)
 ↓
60 → stored

Final Result:
[20, 40, 60]
```

Notice that the callback decides **what gets stored** in the new array.

---

# How does `map()` call my callback?

Suppose you write:

```javascript
const arr = [5, 8, 10];

arr.map(function (value, index, array) {
  console.log(value);
  console.log(index);
  console.log(array);
});
```

You only wrote **one callback function**, but JavaScript automatically calls it once for every element.

Internally, it behaves something like this:

```javascript
callback(5, 0, arr);

callback(8, 1, arr);

callback(10, 2, arr);
```

So on every iteration, the callback receives three arguments:

```text
callback(
    currentElement,
    currentIndex,
    originalArray
)
```

---

# Where do these values come from?

Suppose you call:

```javascript
arr.map(myFunction);
```

JavaScript already knows that:

```javascript
arr = [5, 8, 10];
```

So internally it simply loops through the array and calls:

```javascript
myFunction(arr[i], i, arr);
```

That's all there is to it.

There is no hidden magic—`map()` is just repeatedly invoking your callback with the current element, its index, and the original array.

---

# Thinking Like an Interviewer

Before writing a polyfill, think about the algorithm in plain English:

```text
I have an array.

↓

Create a new empty array.

↓

Visit every element.

↓

For each element, call the callback with:

(currentElement, currentIndex, originalArray)

↓

Take whatever the callback returns.

↓

Store it in the new array.

↓

After processing all elements, return the new array.
```

---

# Mental Model

Whenever you see:

```javascript
arr.map(callback);
```

Imagine JavaScript is secretly doing something like this:

```text
newArray = []

for every item in arr

    answer = callback(
        currentElement,
        currentIndex,
        originalArray
    )

    newArray.push(answer)

return newArray
```

Once this mental model is clear, writing the polyfill becomes straightforward because you're simply implementing the above steps yourself.

---

# Key Takeaways

- `map()` is used to **transform** an array.
- It always returns a **new array**.
- It never modifies the original array.
- The callback is called once for every element.
- The callback receives:
  - `currentElement`
  - `currentIndex`
  - `originalArray`
- Whatever the callback returns becomes the corresponding element in the new array.
- Internally, `map()` is just a loop that repeatedly calls the callback and stores its return value.
