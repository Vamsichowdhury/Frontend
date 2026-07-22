# Promise.race() - Complete Interview Notes

## What is Promise.race()?

`Promise.race()` is a static Promise method that takes an **iterable (usually an array) of promises** and returns **a single promise**.

It settles (either **fulfills** or **rejects**) as soon as **the first promise settles**.

The remaining promises continue running in the background, but their results are ignored.

---

# Syntax

```javascript
Promise.race(iterable);
```

Example

```javascript
const p1 = Promise.resolve("First");
const p2 = Promise.resolve("Second");

Promise.race([p1, p2]).then(console.log);
```

Output

```javascript
First;
```

---

# Intuition

Imagine a **100-meter race**.

- Runner A
- Runner B
- Runner C

The moment **one runner crosses the finish line**, the race winner is declared.

You don't wait for everyone.

That's exactly how `Promise.race()` works.

The **first settled promise wins**.

---

# How it Works

Suppose

```javascript
const p1 = new Promise((resolve) => setTimeout(() => resolve("A"), 3000));

const p2 = new Promise((resolve) => setTimeout(() => resolve("B"), 1000));

const p3 = new Promise((resolve) => setTimeout(() => resolve("C"), 2000));

Promise.race([p1, p2, p3]).then(console.log);
```

Timeline

```
0 sec → Start all promises

1 sec → p2 fulfilled ✅

Promise.race resolves immediately

2 sec → p3 ignored

3 sec → p1 ignored
```

Output

```javascript
B;
```

---

# It Can Reject Too

The first settled promise may be a rejection.

```javascript
const p1 = new Promise((_, reject) => setTimeout(() => reject("Failed"), 1000));

const p2 = new Promise((resolve) => setTimeout(() => resolve("Success"), 2000));

Promise.race([p1, p2]).then(console.log).catch(console.error);
```

Output

```javascript
Failed;
```

The rejection happened first.

---

# Example 1 - First Promise Wins

```javascript
const p1 = new Promise((resolve) => setTimeout(() => resolve("User"), 3000));

const p2 = new Promise((resolve) => setTimeout(() => resolve("Orders"), 1000));

Promise.race([p1, p2]).then(console.log);
```

Output

```javascript
Orders;
```

---

# Example 2 - First Rejection Wins

```javascript
const p1 = new Promise((_, reject) =>
  setTimeout(() => reject("API Failed"), 1500),
);

const p2 = new Promise((resolve) => setTimeout(() => resolve("Success"), 3000));

Promise.race([p1, p2]).then(console.log).catch(console.error);
```

Output

```javascript
API Failed
```

---

# Real World Example - API Timeout

One of the most common interview questions.

Suppose you want to cancel waiting after **5 seconds**.

```javascript
function fetchData() {
  return fetch("/users");
}

function timeout() {
  return new Promise((_, reject) =>
    setTimeout(() => reject("Request Timed Out"), 5000),
  );
}

Promise.race([fetchData(), timeout()])
  .then((response) => console.log(response))
  .catch(console.error);
```

If the API responds in

```
3 seconds
```

Output

```
API Response
```

If the API takes

```
6 seconds
```

Output

```
Request Timed Out
```

---

# Async/Await Example

```javascript
async function load() {
  try {
    const result = await Promise.race([
      fetch("/users"),
      fetch("/backup-users"),
    ]);

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

---

# Do All Promises Start Together?

Yes.

```javascript
Promise.race([fetchUsers(), fetchPosts(), fetchComments()]);
```

Execution

```
Users      ─────────►

Posts      ─────►

Comments   ─────────────►
```

All promises start immediately.

---

# Does Promise.race Cancel Other Promises?

No.

Example

```javascript
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    console.log("A finished");
    resolve("A");
  }, 3000);
});

const p2 = new Promise((resolve) => {
  setTimeout(() => {
    console.log("B finished");
    resolve("B");
  }, 1000);
});

Promise.race([p1, p2]).then(console.log);
```

Output

```text
B finished
B

A finished
```

Notice

`Promise.race()` already resolved with `"B"`.

But `p1` still continued executing.

JavaScript **cannot automatically cancel** promises.

---

# What Happens if Every Promise Rejects?

```javascript
Promise.race([Promise.reject("A"), Promise.reject("B")]).catch(console.error);
```

Output

```javascript
A;
```

The first rejection wins.

---

# Empty Array

```javascript
Promise.race([]);
```

Result

The returned promise remains **pending forever**.

It neither resolves nor rejects because there is no promise to settle first.

---

# Can Promise.race Handle Normal Values?

Yes.

Non-promise values are treated as already fulfilled promises.

```javascript
Promise.race([10, Promise.resolve(20)]).then(console.log);
```

Output

```javascript
10;
```

---

# Time Complexity

If there are **n promises**

Time Complexity

```
O(n)
```

Internally, JavaScript attaches handlers to each promise.

The returned promise settles as soon as the first one settles.

Space Complexity

```
O(n)
```

---

# Common Interview Questions

## Q1. Does Promise.race wait for all promises?

No.

It settles immediately after the first promise settles.

---

## Q2. Can Promise.race reject?

Yes.

If the first settled promise rejects, the returned promise rejects.

---

## Q3. Does Promise.race preserve order?

No.

The **fastest settled promise wins**, regardless of its position in the array.

---

## Q4. Does Promise.race cancel other promises?

No.

Other promises continue running in the background.

---

## Q5. What happens if the fastest promise rejects?

The returned promise rejects immediately with that reason.

---

## Q6. What happens if the iterable is empty?

The returned promise stays **pending forever**.

---

# Promise.all() vs Promise.allSettled() vs Promise.race()

| Feature                   | Promise.all()          | Promise.allSettled()    | Promise.race()                     |
| ------------------------- | ---------------------- | ----------------------- | ---------------------------------- |
| Waits for all promises    | ✅ Yes                 | ✅ Yes                  | ❌ No                              |
| Stops after first settled | ❌ No                  | ❌ No                   | ✅ Yes                             |
| Rejects on failure        | ✅ First rejection     | ❌ Never                | ✅ If first settled rejects        |
| Returns                   | Array of values        | Array of result objects | First settled value/reason         |
| Preserves input order     | ✅ Yes                 | ✅ Yes                  | ❌ No (fastest wins)               |
| Best use case             | All tasks must succeed | Need every result       | Need the fastest result or timeout |

---

# When Should You Use Promise.race()?

Use it when

- Implementing API request timeouts.
- Choosing the fastest server or CDN.
- Using multiple fallback APIs and taking the first response.
- Returning the quickest cache/database result.
- Running redundant requests where only the first response matters.

---

# Visual Summary

```
Promise.race()

Start all promises
        │
        ▼
Who settles first?
        │
        ├── fulfilled → Resolve immediately
        │
        └── rejected → Reject immediately

Ignore all later results
```

---

# Interview One-Liner

> **`Promise.race()` executes multiple promises concurrently and returns a promise that settles as soon as the first input promise settles (either fulfilled or rejected). It does not wait for the remaining promises, and it does not cancel them—they continue running in the background.**
