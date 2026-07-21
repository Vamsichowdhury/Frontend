# Promise.all() - Complete Interview Notes

## What is Promise.all()?

`Promise.all()` is a static method of the Promise object that takes an **iterable (usually an array) of promises** and returns a **single promise**.

- It executes all promises **concurrently**.
- It waits until **all promises are fulfilled**.
- If **any one promise rejects**, it immediately rejects with that error.

---

# Syntax

```javascript
Promise.all(iterable);
```

Usually,

```javascript
Promise.all([promise1, promise2, promise3]);
```

---

# Why do we use Promise.all()?

Imagine you're loading a dashboard.

You need

- User Details
- Posts
- Notifications

These APIs are independent.

❌ Bad Approach (Sequential)

```javascript
const user = await fetchUser();
const posts = await fetchPosts();
const notifications = await fetchNotifications();
```

Execution

```
User API ------------1s
Posts API ----------------2s
Notifications API --------1.5s

Total Time = 1 + 2 + 1.5
= 4.5 seconds
```

Since each request waits for the previous one, the total time increases.

---

## Better Approach

```javascript
const [user, posts, notifications] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchNotifications(),
]);
```

Execution

```
0 sec

User API ------------1s
Posts API ----------------2s
Notifications API --------1.5s

Total Time = 2 seconds
```

All APIs start together.

Promise.all() waits for the slowest one.

---

# Simple Example

```javascript
function fetchUser() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: "John" });
    }, 1000);
  });
}

function fetchPosts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Post 1", "Post 2"]);
    }, 2000);
  });
}

function fetchComments() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Comment A"]);
    }, 1500);
  });
}

async function getData() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments(),
  ]);

  console.log(user);
  console.log(posts);
  console.log(comments);
}

getData();
```

Output

```
{ name: 'John' }
['Post 1', 'Post 2']
['Comment A']
```

---

# How Promise.all() Works Internally

Suppose we have

```javascript
Promise.all([promise1, promise2, promise3]);
```

Internally,

```
Step 1

Start Promise 1

Step 2

Start Promise 2

Step 3

Start Promise 3

↓

Wait...

↓

Promise 1 Finished

↓

Wait...

↓

Promise 3 Finished

↓

Wait...

↓

Promise 2 Finished

↓

Now return

[
 result1,
 result2,
 result3
]
```

Notice something interesting.

Although Promise 3 finished before Promise 2,

the returned array is

```
[result1, result2, result3]
```

The order of results is **always the same as the input order**, not the completion order.

---

# Order Example

```javascript
const p1 = new Promise((resolve) => setTimeout(() => resolve("A"), 3000));

const p2 = new Promise((resolve) => setTimeout(() => resolve("B"), 1000));

const p3 = new Promise((resolve) => setTimeout(() => resolve("C"), 2000));

Promise.all([p1, p2, p3]).then(console.log);
```

Output

```
["A", "B", "C"]
```

Even though

```
B finished first
C finished second
A finished last
```

Output remains

```
A
B
C
```

because Promise.all preserves input order.

---

# What Happens if One Promise Rejects?

Example

```javascript
const p1 = Promise.resolve("User");

const p2 = Promise.reject("API Failed");

const p3 = Promise.resolve("Comments");

Promise.all([p1, p2, p3]).then(console.log).catch(console.log);
```

Output

```
API Failed
```

The entire Promise.all() rejects immediately.

Even if

```
Promise 1 succeeded
Promise 3 succeeded
```

you won't receive their values.

---

# Visual Representation

```
Promise 1 ✔

Promise 2 ❌

Promise 3 ✔

↓

Promise.all

↓

Reject Immediately
```

---

# Important Point

Even though Promise.all rejects immediately,

**it does NOT cancel the other promises**.

Example

```javascript
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    console.log("P1 Done");
    resolve();
  }, 3000);
});

const p2 = Promise.reject("Failed");

Promise.all([p1, p2]).catch(console.log);
```

Output

```
Failed

(after 3 sec)

P1 Done
```

The rejected promise ends Promise.all,

but JavaScript cannot stop an already running asynchronous operation.

---

# Promise.all() with Fetch APIs

```javascript
async function getData() {
  const [users, posts, comments] = await Promise.all([
    fetch("/users"),
    fetch("/posts"),
    fetch("/comments"),
  ]);

  const usersData = await users.json();
  const postsData = await posts.json();
  const commentsData = await comments.json();

  console.log(usersData);
  console.log(postsData);
  console.log(commentsData);
}
```

---

# Promise.all() with Mixed Values

Promise.all also accepts normal values.

```javascript
Promise.all([Promise.resolve(10), 20, Promise.resolve(30)]);
```

Output

```
[10, 20, 30]
```

Normal values are automatically wrapped as resolved promises.

Equivalent to

```javascript
Promise.resolve(20);
```

---

# Empty Array

```javascript
Promise.all([]);
```

Output

```
[]
```

The returned promise resolves immediately.

---

# Time Complexity

Suppose

```
API 1 → 1 sec

API 2 → 5 sec

API 3 → 2 sec
```

Sequential

```
1 + 5 + 2

= 8 sec
```

Promise.all

```
max(1,5,2)

= 5 sec
```

Time depends on the **slowest promise**, not the sum.

---

# When Should You Use Promise.all()?

Use it when tasks are **independent**.

Examples

✅ Load Dashboard Data

- User Profile
- Notifications
- Messages

---

✅ Product Page

- Product Details
- Reviews
- Related Products

---

✅ Home Page

- Banner
- Categories
- Trending Products

---

✅ Upload Multiple Images

```
Promise.all(images.map(uploadImage))
```

---

# When NOT to Use Promise.all()

When one task depends on another.

Bad Example

```
Login User

↓

Get Token

↓

Get Profile

↓

Get Orders
```

Here,

each step depends on the previous one.

Use sequential await.

```javascript
const login = await loginUser();

const profile = await getProfile(login.token);

const orders = await getOrders(profile.id);
```

Promise.all cannot be used because the next API requires data from the previous API.

---

# Common Interview Questions

## 1. Does Promise.all execute promises one by one?

No.

It starts all promises concurrently.

---

## 2. Does Promise.all preserve order?

Yes.

Results are returned in the same order as the input promises.

---

## 3. What happens if one promise rejects?

Promise.all immediately rejects with that error.

---

## 4. Does Promise.all cancel remaining promises?

No.

Already-running asynchronous operations continue executing.

---

## 5. Can Promise.all accept non-promises?

Yes.

Normal values are treated as resolved promises.

Example

```javascript
Promise.all([Promise.resolve(1), 2, 3]);

// Output
[1, 2, 3];
```

---

## 6. What does Promise.all return?

It returns a **single Promise**.

```javascript
const result = Promise.all([promise1, promise2]);

console.log(result instanceof Promise);

// true
```

---

## 7. Is Promise.all parallel?

Not exactly.

JavaScript is single-threaded.

Promise.all starts all asynchronous operations **concurrently**. The browser (or Node.js) handles these operations in the background (e.g., network requests, timers). They are not running in parallel JavaScript threads.

---

# Promise.all() vs Sequential await

| Sequential await                   | Promise.all                   |
| ---------------------------------- | ----------------------------- |
| Runs one after another             | Starts all together           |
| Slower                             | Faster                        |
| Use when APIs depend on each other | Use when APIs are independent |
| Total time = Sum of all            | Total time = Slowest promise  |

---

# Interview One-Liner

> **Promise.all() is used to execute multiple independent asynchronous operations concurrently. It returns a single promise that resolves when all promises succeed and rejects immediately if any promise fails. The results are returned in the same order as the input promises, regardless of the order in which they complete.**
