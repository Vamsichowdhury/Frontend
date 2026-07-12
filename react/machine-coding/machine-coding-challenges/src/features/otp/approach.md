# React OTP Input - Development Approach (Machine Coding)

Instead of building the entire component at once, implement it step by step.

## Step 1: Render 4 Input Boxes

- Create 4 input elements using `map()`.
- Add basic styling.
- Verify that all inputs are visible.

---

## Step 2: Add State

- Create an `otp` array using `useState`.
- Bind each input's `value` to its corresponding array element.
- Ensure each input is a controlled component.

---

## Step 3: Handle Typing

- Update the correct index in the `otp` array.
- Allow only one character per input using `maxLength={1}`.
- Verify typing and deleting work correctly.

---

## Step 4: Allow Only Numeric Input

- Ignore alphabets and special characters.
- Validate the input inside `onChange`.
- Accept only digits (`0-9`).

---

## Step 5: Auto Focus Next Input

- Create input references using `useRef`.
- After entering a digit, automatically move focus to the next input.
- Do not move focus after the last input.

---

## Step 6: Handle Backspace

- Detect `Backspace` using `onKeyDown`.
- If the current input is empty, move focus to the previous input.
- Do not move before the first input.

---

## Step 7: Handle Paste

- Capture the pasted text.
- Validate that it contains only digits.
- Split the text into individual digits.
- Fill all input boxes automatically.
- Ignore extra digits beyond the required length.

---

## Step 8: Trigger Callback

- Check if all input boxes are filled.
- Join the array into a string.
- Call `onChangeOTP(otp.join(""))`.

---

## Step 9: Handle Edge Cases

- Ignore non-numeric paste.
- Ignore typing more than one character.
- Prevent focus from moving outside the input range.
- Handle incomplete paste gracefully.

---

# Interview Development Flow

```text
✅ Step 1 → Render 4 inputs
✅ Step 2 → Add state
✅ Step 3 → Handle typing
✅ Step 4 → Restrict to numeric input
✅ Step 5 → Auto-focus next input
✅ Step 6 → Handle Backspace
✅ Step 7 → Support paste
✅ Step 8 → Trigger onChangeOTP callback
✅ Step 9 → Handle edge cases
```

## Why This Order?

- Each step builds on the previous one.
- The component remains functional after every step.
- It's easy for the interviewer to follow your thought process.
- You can test each feature independently before moving to the next.

---

# Why does the previous digit get deleted automatically?

Suppose the inputs look like this:

```text
Input1   Input2   Input3   Input4
  1        1        1        |
--------------------------------------
Input1   Input2   Input3   Input4
  1        1        |        ""
```

The cursor is in the **4th (empty) input**.

When you press **Backspace**, the following happens:

1. The `keydown` event fires.
2. Your `handleBackspace()` function runs.
3. Since the current input is empty, you move the focus to the previous input using `focus()`.
4. **The browser is still processing the same Backspace key press.**
5. Since the focus has now moved to the previous input, the browser applies its default Backspace behavior there and deletes the digit.

### Event Flow

```text
Press Backspace
      ↓
keydown event
      ↓
handleBackspace()
      ↓
focus() moves to previous input
      ↓
Browser continues default Backspace action
      ↓
Deletes the digit in the newly focused input
```

## Why doesn't this happen if we use `preventDefault()`?

```js
e.preventDefault();
```

Calling `preventDefault()` stops the browser's default Backspace behavior.

Now the sequence becomes:

```text
Press Backspace
      ↓
keydown event
      ↓
handleBackspace()
      ↓
preventDefault()
      ↓
Focus moves to previous input
      ↓
No digit is deleted
```

In this case, you'll need to press **Backspace again** to delete the previous digit.

---

# Why do we use `e.preventDefault()` in `handlePaste()`?

When the user presses **Ctrl + V**, the browser has a **default paste behavior**:

- It pastes the entire clipboard content into the currently focused input.

For example, if the clipboard contains:

```text
1234
```

Without `preventDefault()`, the browser tries to paste:

```text
1234
```

into **one input box**, resulting in:

```text
Input 1: 1234
Input 2:
Input 3:
Input 4:
```

This is **not** what we want for an OTP component.

---

## What does `preventDefault()` do?

```js
e.preventDefault();
```

It stops the browser's default paste behavior.

Now **our code** decides how to handle the pasted text.

```js
const pastedData = e.clipboardData.getData("text");
const digits = pastedData.slice(0, 4).split("");

setOtp(digits);
```

Result:

```text
Input 1: 1
Input 2: 2
Input 3: 3
Input 4: 4
```

---

## Flow

### Without `preventDefault()`

```text
Ctrl + V
    ↓
Browser pastes "1234" into current input
    ↓
Wrong behavior
```

### With `preventDefault()`

```text
Ctrl + V
    ↓
Stop browser's default paste
    ↓
Read clipboard manually
    ↓
Split into digits
    ↓
Fill all 4 input boxes
```

**Rule of thumb:** Use `e.preventDefault()` whenever you want to replace the browser's default behavior with your own custom logic.
