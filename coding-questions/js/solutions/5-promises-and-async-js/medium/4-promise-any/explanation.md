# Promise.any() - Complete Interview Notes

## What is Promise.any()?

`Promise.any()` is a static Promise method that takes an **iterable (usually an array) of promises** and returns **a single promise**.

It fulfills as soon as **the first promise fulfills**.

Unlike `Promise.race()`, **rejections are ignored** unless **every promise rejects**.

---

# Syntax

```javascript
Promise.any(iterable);
```

Example

```javascript
const promises = [
  Promise.reject("Failed"),
  Promise.resolve("Success"),
  Promise.resolve("Another Success"),
];

Promise.any(promises).then(console.log);
```

Output

```javascript
Success;
```

---

# Intuition

Imagine you're ordering food from **3 delivery apps**.

- Swiggy ❌ Restaurant Closed
- Zomato ✅ Delivery Available
- Uber Eats ❌ Service Unavailable

You don't care who failed.

You only need **one successful delivery**.

That's exactly how `Promise.any()` works.

It ignores failures until it finds the first success.

---

# How it Works

Suppose

```javascript
const p1 = Promise.reject("Error");

const p2 = new Promise((resolve) => setTimeout(() => resolve("Data"), 2000));

const p3 = Promise.reject("Another Error");

Promise.any([p1, p2, p3]).then(console.log);
```

Timeline

```
0 sec → Start all promises

Immediately → p1 rejected (ignored)

2 sec → p2 fulfilled ✅

Promise.any resolves

p3 rejection doesn't matter
```

Output

```javascript
Data;
```

---

# Difference Between Promise.any() and Promise.race()

This is one of the most common interview questions.

### Promise.race()

First **settled** promise wins.

That can be

- fulfilled ✅
- rejected ❌

### Promise.any()

First **fulfilled** promise wins.

Rejections are ignored.

---

Example

```javascript
const p1 = new Promise((_, reject) => setTimeout(() => reject("Error"), 1000));

const p2 = new Promise((resolve) => setTimeout(() => resolve("Success"), 2000));
```

Using

```javascript
Promise.race([p1, p2]);
```

Output

```javascript
Error;
```

Using

```javascript
Promise.any([p1, p2]);
```

Output

```javascript
Success;
```

---

# Example 1 - First Success Wins

```javascript
const p1 = new Promise((resolve) =>
  setTimeout(() => resolve("Server 1"), 3000),
);

const p2 = new Promise((resolve) =>
  setTimeout(() => resolve("Server 2"), 1000),
);

const p3 = new Promise((resolve) =>
  setTimeout(() => resolve("Server 3"), 2000),
);

Promise.any([p1, p2, p3]).then(console.log);
```

Output

```javascript
Server 2
```

---

# Example 2 - Ignore Rejections

```javascript
const p1 = Promise.reject("API 1 Failed");

const p2 = new Promise((resolve) =>
  setTimeout(() => resolve("API 2 Success"), 2000),
);

const p3 = Promise.reject("API 3 Failed");

Promise.any([p1, p2, p3]).then(console.log);
```

Output

```javascript
API 2 Success
```

---

# What if Every Promise Rejects?

This is the most important interview question.

```javascript
Promise.any([
  Promise.reject("A"),
  Promise.reject("B"),
  Promise.reject("C"),
]).catch(console.error);
```

Output

```javascript
AggregateError: All promises were rejected
```

The error contains an `errors` array.

```javascript
Promise.any([
  Promise.reject("A"),
  Promise.reject("B"),
  Promise.reject("C"),
]).catch((error) => {
  console.log(error.name);
  console.log(error.errors);
});
```

Output

```javascript
AggregateError[("A", "B", "C")];
```

---

# Real World Example - Multiple Servers

Suppose your application has

- Primary Server
- Backup Server
- CDN Server

You only need the **first successful response**.

```javascript
Promise.any([fetch("/primary"), fetch("/backup"), fetch("/cdn")])
  .then((response) => {
    console.log(response);
  })
  .catch(console.error);
```

Whichever server responds successfully first is used.

---

# Async/Await Example

```javascript
async function loadData() {
  try {
    const result = await Promise.any([
      fetch("/server1"),
      fetch("/server2"),
      fetch("/server3"),
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
Promise.any([fetchUsers(), fetchPosts(), fetchComments()]);
```

Execution

```
Users      ─────────►

Posts      ─────►

Comments   ─────────────►
```

All promises start immediately.

---

# Does Promise.any Cancel Other Promises?

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

Promise.any([p1, p2]).then(console.log);
```

Output

```text
B finished
B

A finished
```

The remaining promises continue executing.

---

# Empty Array

```javascript
Promise.any([]);
```

Output

```javascript
AggregateError: All promises were rejected
```

Since there are no promises that can fulfill, it immediately rejects with an `AggregateError`.

---

# Can Promise.any Handle Normal Values?

Yes.

Non-promise values are treated as already fulfilled promises.

```javascript
Promise.any([10, Promise.resolve(20), Promise.reject("Failed")]).then(
  console.log,
);
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

Space Complexity

```
O(n)
```

JavaScript attaches handlers to every promise and may collect rejection reasons if needed.

---

# Common Interview Questions

## Q1. Does Promise.any wait for all promises?

No.

It resolves immediately after the first fulfilled promise.

---

## Q2. Does Promise.any reject?

Yes.

Only if **every promise rejects**.

---

## Q3. What error does Promise.any throw when all promises fail?

It rejects with an `AggregateError`.

---

## Q4. What is AggregateError?

An error object that contains **all rejection reasons** in its `errors` property.

Example

```javascript
try {
  await Promise.any([Promise.reject("A"), Promise.reject("B")]);
} catch (error) {
  console.log(error.errors);
}
```

Output

```javascript
["A", "B"];
```

---

## Q5. Does Promise.any preserve order?

No.

The first fulfilled promise wins, regardless of its position in the array.

---

## Q6. Does Promise.any cancel remaining promises?

No.

Other promises continue executing.

---

## Q7. What happens with an empty array?

It immediately rejects with an `AggregateError`.

---

# Promise.all() vs Promise.allSettled() vs Promise.race() vs Promise.any()

| Feature                   | Promise.all()               | Promise.allSettled()    | Promise.race()            | Promise.any()                    |
| ------------------------- | --------------------------- | ----------------------- | ------------------------- | -------------------------------- |
| Waits for all promises    | ❌ Stops on first rejection | ✅ Yes                  | ❌ No                     | ❌ No                            |
| Stops after first settled | ❌ No                       | ❌ No                   | ✅ Yes                    | ❌ (waits for first fulfillment) |
| Ignores rejections        | ❌ No                       | ❌ No                   | ❌ No                     | ✅ Yes                           |
| Rejects                   | First rejection             | Never                   | First settled rejection   | Only if all reject               |
| Resolves with             | Array of values             | Array of result objects | First settled value       | First fulfilled value            |
| Preserves input order     | ✅ Yes                      | ✅ Yes                  | ❌ No                     | ❌ No                            |
| Best use case             | All tasks must succeed      | Need all outcomes       | Fastest result or timeout | First successful result          |

---

# When Should You Use Promise.any()?

Use it when

- You only need one successful API response.
- You have multiple mirror servers.
- You have fallback APIs.
- You want the fastest successful CDN.
- You want redundancy without failing because one server is down.
- You are querying multiple data sources and only need one valid result.

---

# Visual Summary

```
Promise.any()

Start all promises
        │
        ▼
Ignore all rejections
        │
        ▼
First fulfilled promise?
        │
        ├── Yes → Resolve immediately
        │
        └── No
             │
             ▼
All promises rejected
             │
             ▼
Reject with AggregateError
```

---

# Quick Comparison: race() vs any()

| Scenario               | Promise.race()               | Promise.any()                    |
| ---------------------- | ---------------------------- | -------------------------------- |
| First promise rejects  | ❌ Rejects immediately       | ⏳ Keeps waiting                 |
| First promise fulfills | ✅ Resolves                  | ✅ Resolves                      |
| All promises reject    | ❌ Rejects with first error  | ❌ Rejects with `AggregateError` |
| Use when               | First settled result matters | First successful result matters  |

---

# Interview One-Liner

> **`Promise.any()` executes multiple promises concurrently and resolves as soon as the first promise fulfills. It ignores rejected promises and only rejects if every input promise rejects, in which case it throws an `AggregateError` containing all rejection reasons.**
