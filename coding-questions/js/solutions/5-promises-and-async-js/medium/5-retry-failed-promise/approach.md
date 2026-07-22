# Retry Failed Promise - Complete Interview Notes

## What is Retry Failed Promise?

Retrying a promise means **attempting an asynchronous operation again if it fails**.

Instead of immediately giving up after the first failure, we try the operation multiple times before finally rejecting.

This is commonly used for:

- Network requests
- API calls
- Database connections
- File uploads
- Payment requests
- External services

---

# Why Do We Need Retries?

Many failures are **temporary**, not permanent.

Examples

- Temporary network issue
- Server is overloaded
- Internet disconnects briefly
- API timeout
- DNS lookup failure

Retrying after a short delay often succeeds.

---

# Intuition

Imagine you're calling your friend.

```
1st call ❌ Busy

Wait 2 seconds

2nd call ❌ Busy

Wait 2 seconds

3rd call ✅ Answered
```

You don't stop after the first failure.

That's exactly what retry logic does.

---

# Basic Retry Logic

```
Attempt

      │
      ▼

Success?
   │
   ├── Yes → Return Result
   │
   ▼
 No

Retry Count Left?
   │
   ├── Yes → Retry Again
   │
   ▼
 No

Throw Error
```

---

# Example Without Retry

```javascript
fetch("/users").then(console.log).catch(console.error);
```

If the request fails once

```
❌ Finished
```

---

# Example With Retry

```javascript
Retry

Attempt 1 ❌

↓

Attempt 2 ❌

↓

Attempt 3 ✅
```

Now the operation succeeds.

---

# Retry Function

```javascript
async function retry(fn, retries) {
  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      retries--;
    }
  }

  throw new Error("All retries failed");
}
```

Usage

```javascript
retry(() => fetch("/users"), 3)
  .then(console.log)
  .catch(console.error);
```

---

# Step-by-Step Execution

Suppose

```
Retries = 3
```

```
Attempt 1

↓

Failed

↓

Retries = 2

↓

Attempt 2

↓

Failed

↓

Retries = 1

↓

Attempt 3

↓

Success

↓

Return Result
```

---

# Example Using Fake API

```javascript
let count = 0;

async function fakeApi() {
  count++;

  console.log(`Attempt ${count}`);

  if (count < 3) {
    throw new Error("Server Error");
  }

  return "Success";
}

retry(fakeApi, 3).then(console.log).catch(console.error);
```

Output

```text
Attempt 1

Attempt 2

Attempt 3

Success
```

---

# Recursive Solution

```javascript
async function retry(fn, retries) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    return retry(fn, retries - 1);
  }
}
```

---

# Retry with Delay

Usually we don't retry immediately.

Instead we wait.

Helper

```javascript
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

Retry

```javascript
async function retry(fn, retries, delay) {
  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      retries--;

      if (retries === 0) {
        throw error;
      }

      await wait(delay);
    }
  }
}
```

Usage

```javascript
retry(fetchUsers, 3, 2000);
```

Timeline

```
Attempt 1

↓

Fail

↓

Wait 2 sec

↓

Attempt 2

↓

Fail

↓

Wait 2 sec

↓

Attempt 3

↓

Success
```

---

# Exponential Backoff

Instead of waiting the same delay

```
2 sec

2 sec

2 sec
```

Increase the delay every retry.

```
1 sec

2 sec

4 sec

8 sec
```

Why?

To reduce server load.

---

Example

```javascript
async function retry(fn, retries) {
  let delay = 1000;

  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      retries--;

      if (retries === 0) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));

      delay *= 2;
    }
  }
}
```

Timeline

```
Attempt 1

↓

Wait 1 sec

↓

Attempt 2

↓

Wait 2 sec

↓

Attempt 3

↓

Wait 4 sec

↓

Attempt 4
```

---

# Retry Only for Specific Errors

Don't retry everything.

Example

```
404 Not Found ❌

Retrying won't help.
```

But

```
500 Server Error

Retry ✅
```

Example

```javascript
async function retry(fn, retries) {
  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }

      retries--;
    }
  }

  throw new Error("Failed");
}
```

---

# Retry with Fetch

```javascript
async function fetchWithRetry(url, retries = 3) {
  while (retries > 0) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Server Error");
      }

      return response.json();
    } catch (error) {
      retries--;

      if (retries === 0) {
        throw error;
      }
    }
  }
}
```

Usage

```javascript
fetchWithRetry("/users").then(console.log).catch(console.error);
```

---

# Real World Example

Suppose payment API

```
Attempt 1

↓

Network Error

↓

Retry

↓

Attempt 2

↓

Network Error

↓

Retry

↓

Attempt 3

↓

Payment Success
```

Without retry

```
Payment Failed
```

With retry

```
Payment Completed
```

---

# Time Complexity

If

```
n = retries
```

Worst case

```
O(n)
```

Space

Iterative

```
O(1)
```

Recursive

```
O(n)
```

because of recursion stack.

---

# Common Interview Questions

## Q1. Why do we retry failed promises?

Because many failures are temporary.

Examples

- Network issue
- Timeout
- Temporary server overload

---

## Q2. Should every failed promise be retried?

No.

Retry only temporary failures.

Examples

Retry

- Timeout
- Network Error
- HTTP 500
- HTTP 503

Don't Retry

- HTTP 400
- HTTP 401
- HTTP 403
- HTTP 404
- Validation Error

---

## Q3. Why use exponential backoff?

To reduce load on servers.

Instead of

```
1 sec

1 sec

1 sec
```

Use

```
1 sec

2 sec

4 sec

8 sec
```

---

## Q4. Why add delay between retries?

Without delay

```
Retry

Retry

Retry
```

This may overload the server.

With delay

```
Retry

↓

Wait

↓

Retry
```

The server gets time to recover.

---

## Q5. What's the difference between retrying and looping?

A normal loop repeats immediately.

A retry loop:

- waits for asynchronous completion (`await`)
- stops when successful
- may include delays or backoff
- usually retries only on recoverable errors

---

# Real Interview Problem

### Implement `retry(fn, retries)`

Example

```javascript
let attempts = 0;

async function api() {
  attempts++;

  if (attempts < 3) {
    throw new Error("Failed");
  }

  return "Success";
}

retry(api, 3).then(console.log).catch(console.error);
```

Expected Output

```text
Success
```

---

# Complete Interview Solution

```javascript
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function retry(fn, retries, delay = 1000) {
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      retries--;

      await wait(delay);
    }
  }
}
```

Usage

```javascript
retry(api, 3, 1000).then(console.log).catch(console.error);
```

---

# Visual Summary

```
Call Function
      │
      ▼
Success?
   │
   ├── Yes
   │      │
   │      ▼
   │   Return Result
   │
   ▼
Failed
   │
Retries Left?
   │
   ├── No
   │      │
   │      ▼
   │   Throw Error
   │
   ▼
Wait
   │
   ▼
Retry Again
```

---

# Best Practices

- Retry only transient (temporary) errors.
- Limit the maximum number of retries.
- Add a delay between retries.
- Prefer exponential backoff for production systems.
- Log retry attempts for debugging.
- Consider adding **jitter** (a small random delay) in distributed systems to prevent many clients from retrying at exactly the same time.

---

# Interview One-Liner

> **Retrying a failed promise means executing an asynchronous operation again when it fails, usually for temporary errors like network failures or server timeouts. A good retry strategy limits the number of attempts, waits between retries (preferably using exponential backoff), and retries only recoverable errors.**
