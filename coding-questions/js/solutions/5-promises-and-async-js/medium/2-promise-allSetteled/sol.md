# Promise.allSettled() - Complete Interview Notes

## What is Promise.allSettled()?

`Promise.allSettled()` is a static Promise method that takes an **iterable (usually an array) of promises** and returns **a single promise**.

Unlike `Promise.all()`, it **never rejects** because one promise fails.

It waits until **every promise is either fulfilled or rejected**, then returns the result of each promise.

---

## Syntax

```javascript
Promise.allSettled(iterable);
```

Example:

```javascript
const promises = [
  Promise.resolve("Success"),
  Promise.reject("Failed"),
  Promise.resolve("Done"),
];

Promise.allSettled(promises).then((results) => {
  console.log(results);
});
```

Output

```javascript
[
  {
    status: "fulfilled",
    value: "Success",
  },
  {
    status: "rejected",
    reason: "Failed",
  },
  {
    status: "fulfilled",
    value: "Done",
  },
];
```

---

# Intuition

Imagine you're interviewing **5 candidates**.

- Candidate 1 attended ✅
- Candidate 2 didn't attend ❌
- Candidate 3 attended ✅
- Candidate 4 didn't attend ❌
- Candidate 5 attended ✅

Would you cancel the interview process because Candidate 2 didn't come?

No.

You simply record everyone's result.

That's exactly what `Promise.allSettled()` does.

It waits for **everyone**, regardless of success or failure.

---

# How it Works

Suppose you have

```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.reject("Error");
const p3 = Promise.resolve(3);
```

When you do

```javascript
Promise.allSettled([p1, p2, p3]);
```

JavaScript

1. Starts all promises immediately.
2. Waits until all finish.
3. Collects every result.
4. Returns an array of result objects.

---

# Return Value

It always returns

```javascript
Promise<Array<Result>>
```

Each result object is either

### Fulfilled Promise

```javascript
{
    status: "fulfilled",
    value: result
}
```

### Rejected Promise

```javascript
{
    status: "rejected",
    reason: error
}
```

Notice

- fulfilled → `value`
- rejected → `reason`

---

# Example 1 — All Success

```javascript
const p1 = Promise.resolve("A");
const p2 = Promise.resolve("B");
const p3 = Promise.resolve("C");

Promise.allSettled([p1, p2, p3]).then(console.log);
```

Output

```javascript
[
  { status: "fulfilled", value: "A" },
  { status: "fulfilled", value: "B" },
  { status: "fulfilled", value: "C" },
];
```

---

# Example 2 — Mixed Results

```javascript
const p1 = Promise.resolve("User Data");

const p2 = Promise.reject("Payment Failed");

const p3 = Promise.resolve("Orders");

Promise.allSettled([p1, p2, p3]).then(console.log);
```

Output

```javascript
[
  {
    status: "fulfilled",
    value: "User Data",
  },
  {
    status: "rejected",
    reason: "Payment Failed",
  },
  {
    status: "fulfilled",
    value: "Orders",
  },
];
```

Notice

The rejection **does not stop** other promises.

---

# Example 3 — Delayed Promises

```javascript
const p1 = new Promise((resolve) => setTimeout(() => resolve("First"), 3000));

const p2 = new Promise((resolve) => setTimeout(() => resolve("Second"), 1000));

const p3 = new Promise((_, reject) =>
  setTimeout(() => reject("Third Failed"), 2000),
);

Promise.allSettled([p1, p2, p3]).then(console.log);
```

Timeline

```
0 sec → Start all promises

1 sec → p2 fulfilled

2 sec → p3 rejected

3 sec → p1 fulfilled

Now Promise.allSettled resolves.
```

Output

```javascript
[
  { status: "fulfilled", value: "First" },
  { status: "fulfilled", value: "Second" },
  { status: "rejected", reason: "Third Failed" },
];
```

---

# Order is Preserved

Completion order doesn't matter.

```javascript
const p1 = new Promise((resolve) => setTimeout(() => resolve(1), 3000));

const p2 = new Promise((resolve) => setTimeout(() => resolve(2), 1000));

const p3 = new Promise((resolve) => setTimeout(() => resolve(3), 2000));

Promise.allSettled([p1, p2, p3]).then(console.log);
```

Output

```javascript
[
  { status: "fulfilled", value: 1 },
  { status: "fulfilled", value: 2 },
  { status: "fulfilled", value: 3 },
];
```

Even though

```
p2 finished first
p3 finished second
p1 finished last
```

The returned array keeps the **same order** as the input array.

---

# Real World Example

Suppose your dashboard loads

- User Profile
- Notifications
- Messages
- Friend List

Even if Notifications API fails,

you still want to show everything else.

```javascript
const profile = fetch("/profile");
const notifications = fetch("/notifications");
const messages = fetch("/messages");
const friends = fetch("/friends");

Promise.allSettled([profile, notifications, messages, friends]).then(
  (results) => {
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        console.log(result.value);
      } else {
        console.error(result.reason);
      }
    });
  },
);
```

---

# Filtering Successful Results

```javascript
const promises = [
  Promise.resolve(10),
  Promise.reject("Failed"),
  Promise.resolve(30),
];

Promise.allSettled(promises).then((results) => {
  const success = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  console.log(success);
});
```

Output

```javascript
[10, 30];
```

---

# Filtering Failed Results

```javascript
Promise.allSettled(promises).then((results) => {
  const failed = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason);

  console.log(failed);
});
```

Output

```javascript
["Failed"];
```

---

# Async/Await Example

```javascript
async function loadData() {
  const results = await Promise.allSettled([
    fetch("/users"),
    fetch("/posts"),
    fetch("/comments"),
  ]);

  console.log(results);
}

loadData();
```

---

# Does Promise.allSettled Run Promises One by One?

No.

All promises start immediately.

```javascript
Promise.allSettled([fetchUsers(), fetchPosts(), fetchComments()]);
```

Execution

```
Users      ───────────►

Posts      ─────►

Comments   ─────────►
```

Everything runs concurrently.

---

# Does Promise.allSettled Cancel Other Promises?

No.

Even if one promise rejects,

the remaining promises continue running.

---

# What Happens if Every Promise Rejects?

```javascript
Promise.allSettled([
  Promise.reject("A"),
  Promise.reject("B"),
  Promise.reject("C"),
]).then(console.log);
```

Output

```javascript
[
  { status: "rejected", reason: "A" },
  { status: "rejected", reason: "B" },
  { status: "rejected", reason: "C" },
];
```

Still resolves successfully with the array of results.

---

# Empty Array

```javascript
Promise.allSettled([]);
```

Output

```javascript
[];
```

The returned promise resolves immediately.

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

because it stores every result.

---

# Common Interview Questions

## Q1. Does Promise.allSettled reject?

No.

It **always resolves**, even if every promise rejects.

---

## Q2. What does Promise.allSettled return?

A promise that resolves to an array of result objects.

---

## Q3. Does Promise.allSettled preserve order?

Yes.

Input order is always preserved.

---

## Q4. Does Promise.allSettled stop when one promise rejects?

No.

It waits for every promise.

---

## Q5. Can Promise.allSettled handle normal values?

Yes.

Non-promise values are automatically wrapped using `Promise.resolve()`.

```javascript
Promise.allSettled([1, Promise.resolve(2), 3]).then(console.log);
```

Output

```javascript
[
  { status: "fulfilled", value: 1 },
  { status: "fulfilled", value: 2 },
  { status: "fulfilled", value: 3 },
];
```

---

# Promise.all() vs Promise.allSettled()

| Feature                  | Promise.all()               | Promise.allSettled()       |
| ------------------------ | --------------------------- | -------------------------- |
| Waits for all promises   | ❌ Stops on first rejection | ✅ Yes                     |
| Rejects on failure       | ✅ Yes                      | ❌ Never                   |
| Returns fulfilled values | ✅ Yes                      | ✅ Along with failures     |
| Returns rejected reasons | ❌ No                       | ✅ Yes                     |
| Preserves input order    | ✅ Yes                      | ✅ Yes                     |
| Use when                 | All tasks must succeed      | Want results of every task |

---

# When Should You Use Promise.allSettled()?

Use it when

- Some API calls may fail, but others should continue.
- You want every result regardless of success or failure.
- You're collecting logs or analytics.
- You're executing independent background tasks.
- You're loading multiple dashboard widgets where each widget is independent.
- You're uploading multiple files and want to know which succeeded and which failed.
- You're sending notifications (email, SMS, push) and want a report of all outcomes.

---

# Visual Summary

```
Promise.allSettled()

Start all promises
        │
        ▼
Wait until every promise settles
        │
        ▼
Collect results
        │
        ▼
[
  fulfilled,
  rejected,
  fulfilled,
  rejected
]
        │
        ▼
Promise resolves with the results array
```

---

# Interview One-Liner

> **`Promise.allSettled()` executes multiple promises concurrently, waits until every promise is either fulfilled or rejected, never rejects itself because of individual failures, preserves the input order, and returns an array of objects describing the outcome (`status`, `value`, or `reason`) of each promise.**
