# Advanced Debounce in JavaScript

## What is Debounce?

Debounce is a technique that delays the execution of a function until a specified delay has passed since the last invocation.

It is commonly used to:

- Search Autocomplete
- Window Resize
- Scroll Events
- API Calls
- Form Validation

---

# 1. Debounce with Cancel

## What is it?

A normal debounce delays the execution of a function.

A **cancel()** method allows you to **cancel the pending execution** before it occurs.

### Example

Suppose an API call is debounced for **500ms**.

```
User types:
H
He
Hel

(waiting...)
```

Before the timer completes:

```javascript
search.cancel();
```

The API request never executes.

---

## Timeline

```
0ms   User types
100ms User types
200ms User types
300ms cancel()

Result:
❌ Function never runs
```

---

## Use Cases

- User closes a modal
- Component unmounts
- Search input is cleared
- Cancel unnecessary API requests

---

## Implementation

```javascript
function debounce(fn, delay) {
  let timer;

  function debounced(...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}
```

---

## Example

```javascript
const search = debounce(() => {
  console.log("Searching...");
}, 1000);

search();

search.cancel();

// Nothing prints
```

---

# 2. Debounce with Flush

## What is it?

Normally debounce waits until the delay finishes.

A **flush()** method immediately executes the pending function without waiting.

---

## Example

Delay = **1000ms**

```
User types

Timer started...

User presses Enter

search.flush()

Runs immediately.
```

---

## Timeline

```
0ms search()

Timer running...

400ms flush()

✅ Executes immediately

(No waiting till 1000ms)
```

---

## Use Cases

- User presses Enter
- Submit button
- Save Draft
- Before page unload

---

## Implementation

```javascript
function debounce(fn, delay) {
  let timer;
  let lastArgs;
  let lastContext;

  function debounced(...args) {
    lastArgs = args;
    lastContext = this;

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(lastContext, lastArgs);
      timer = null;
    }, delay);
  }

  debounced.flush = function () {
    if (timer) {
      clearTimeout(timer);
      fn.apply(lastContext, lastArgs);
      timer = null;
    }
  };

  return debounced;
}
```

---

## Example

```javascript
const save = debounce(() => {
  console.log("Saved");
}, 5000);

save();

setTimeout(() => {
  save.flush();
}, 1000);

// Prints after 1 second instead of 5
```

---

# 3. Leading Debounce

## What is it?

Leading debounce executes **immediately on the first invocation**.

After that, all subsequent calls are ignored until the delay expires.

---

## Timeline

```
delay = 1000

0ms   Click
100ms Click
300ms Click
700ms Click

Output

0ms ✅ Run

Nothing else
```

---

## Logic

```
First call?
      |
     Yes
      |
Execute Immediately
      |
Start Timer
      |
Ignore all calls
      |
Delay Ends
      |
Ready for next call
```

---

## Use Cases

- Login Button
- Payment Button
- Prevent Double Click
- Purchase Button

---

## Implementation

```javascript
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    const callNow = !timer;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
    }, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}
```

---

## Example

```javascript
const submit = debounce(() => {
  console.log("Submitted");
}, 2000);

submit();
submit();
submit();

// Output
Submitted;
```

---

# 4. Trailing Debounce

## What is it?

This is the default debounce behavior.

The function executes **only after the user stops invoking it for the specified delay**.

---

## Timeline

```
delay = 1000

0ms Click
200ms Click
500ms Click
900ms Click

1900ms ✅ Execute
```

---

## Logic

```
Call
 |
Reset Timer
 |
Call
 |
Reset Timer
 |
Call
 |
Reset Timer
 |
Delay Finished
 |
Execute Function
```

---

## Use Cases

- Search Suggestions
- Window Resize
- Scroll Events
- Auto Save

---

## Implementation

```javascript
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

---

## Example

```javascript
const search = debounce(() => {
  console.log("Searching...");
}, 1000);

search();
search();
search();

// Only one execution occurs after 1 second.
```

---

# 5. Leading + Trailing Debounce

## What is it?

Some libraries (like Lodash) allow both **leading** and **trailing** execution.

Behavior:

- Execute immediately on the first call.
- If additional calls happen during the delay, execute **one more time** after the delay with the latest arguments.

---

## Timeline

```
delay = 1000

0ms    A
200ms  B
400ms  C

Output

0ms    ✅ A (Leading)

1400ms ✅ C (Trailing)
```

---

## Use Cases

- Instant UI updates
- Search input
- Live previews
- Auto-save with immediate feedback

---

# Comparison

| Feature            | Executes                                   | Use Case                    |
| ------------------ | ------------------------------------------ | --------------------------- |
| Trailing Debounce  | After user stops calling                   | Search, Resize, Scroll      |
| Leading Debounce   | Immediately on first call                  | Prevent Double Click, Login |
| Leading + Trailing | Immediately and once more after inactivity | Live Search, Auto Save      |
| Cancel             | Prevent pending execution                  | Cleanup, Component Unmount  |
| Flush              | Execute pending function immediately       | Submit, Save Draft          |

---

# Interview Questions

### Q1. What is the difference between throttle and debounce?

**Debounce**

- Waits until events stop.
- Executes only once after inactivity.

**Throttle**

- Executes at regular intervals.
- Limits execution frequency.

---

### Q2. When would you use `cancel()`?

- Component unmount
- Modal close
- Cancel pending API requests
- Clear search box

---

### Q3. When would you use `flush()`?

- User presses Enter
- Save button clicked
- Before leaving the page
- Submit immediately

---

### Q4. What is the difference between Leading and Trailing Debounce?

| Leading                  | Trailing               |
| ------------------------ | ---------------------- |
| Executes immediately     | Executes after delay   |
| Ignores subsequent calls | Waits until calls stop |
| Good for button clicks   | Good for search inputs |

---

# Summary

- **Debounce** delays execution until user activity stops.
- **Cancel** removes a pending execution.
- **Flush** executes the pending call immediately.
- **Leading Debounce** executes instantly and ignores subsequent calls until the delay ends.
- **Trailing Debounce** executes only after the delay following the last call.
- **Leading + Trailing Debounce** executes immediately and once again after the final invocation if more calls occurred during the delay.
- These patterns are commonly asked in JavaScript interviews and are used heavily in libraries like Lodash.
