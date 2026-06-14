# React Event Handling — Interview Reference

> Complete guide covering all input types, keyboard events, form handling, and common interview traps.

---

## Quick Reference Table

| Input type                             | Read from event                | Bind on element           | State init   |
| -------------------------------------- | ------------------------------ | ------------------------- | ------------ |
| `text`,`email`,`password`,`textarea`   | `e.target.value`               | `value=`                  | `""`         |
| `number`,`range`                       | `e.target.value` _(parse it!)_ | `value=`                  | `0`or `""`   |
| `date`,`time`,`datetime-local`,`month` | `e.target.value`               | `value=`                  | `""`         |
| `checkbox`                             | `e.target.checked`             | `checked=`                | `false`      |
| `radio`                                | `e.target.value`               | `checked={state === val}` | `""`         |
| `select`(single)                       | `e.target.value`               | `value=`                  | `""`         |
| `select`(multiple)                     | `e.target.selectedOptions`     | `value=`                  | `[]`         |
| `file`                                 | `e.target.files[0]`            | ❌ never set `value=`     | uncontrolled |

---

## 1. Text Input

**Event property:** `e.target.value`
**Bind with:** `value={state}`
**State type:** `string`

```jsx
const [name, setName] = useState("");

const handleChange = (e) => {
  setName(e.target.value); // always a string
};

return (
  <input
    type="text"
    value={name} // controlled: React owns the value
    onChange={handleChange}
    placeholder="Enter name"
  />
);
```

### Also applies to:

- `type="email"` — same pattern, `e.target.value`
- `type="password"` — same pattern
- `type="url"` — same pattern
- `<textarea>` — same pattern (unlike HTML, React textarea uses `value=`, not children)

```jsx
// textarea in React
const [bio, setBio] = useState("");

<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />;
// ❌ NOT <textarea>{bio}</textarea> like in plain HTML
```

### Interview traps

- Even `type="number"` gives a **string** from `e.target.value`. You must convert it manually.
- `textarea` in React uses `value=` prop, not inner content — different from HTML.

---

## 2. Checkbox

**Event property:** `e.target.checked`
**Bind with:** `checked={state}`
**State type:** `boolean`

```jsx
const [agreed, setAgreed] = useState(false);

const handleChange = (e) => {
  setAgreed(e.target.checked); // boolean true/false
};

return (
  <input
    type="checkbox"
    checked={agreed} // NOT value={agreed}
    onChange={handleChange}
  />
);

// Functional toggle shortcut
<input
  type="checkbox"
  checked={agreed}
  onChange={() => setAgreed((prev) => !prev)}
/>;
```

### Multiple checkboxes → array state

```jsx
const [selected, setSelected] = useState([]);

const handleMulti = (e) => {
  const { value, checked } = e.target;
  setSelected((prev) =>
    checked ? [...prev, value] : prev.filter((v) => v !== value),
  );
};

return (
  <>
    {["React", "Vue", "Angular"].map((tech) => (
      <label key={tech}>
        <input
          type="checkbox"
          value={tech}
          checked={selected.includes(tech)}
          onChange={handleMulti}
        />
        {tech}
      </label>
    ))}
  </>
);
```

### Interview traps

- Text input → `e.target.value`. Checkbox → `e.target.checked`. Mixing these up is a top interview mistake.
- The attribute is `checked=`, not `value=`.
- For the toggle pattern, use functional update `prev => !prev` to avoid stale closure bugs.

---

## 3. Radio Button

**Event property:** `e.target.value`
**Bind with:** `checked={state === option}`
**State type:** `string` (only one selected at a time)

```jsx
const [size, setSize] = useState("medium");

return (
  <div>
    {["small", "medium", "large"].map((option) => (
      <label key={option}>
        <input
          type="radio"
          name="size" // same name groups them
          value={option}
          checked={size === option} // derived from state
          onChange={(e) => setSize(e.target.value)}
        />
        {option}
      </label>
    ))}
  </div>
);
```

### Radio vs Checkbox — the key difference

|            | Radio                     | Checkbox               |
| ---------- | ------------------------- | ---------------------- |
| Allows     | One selection             | Multiple selections    |
| State      | `string`                  | `boolean`or `string[]` |
| Read event | `e.target.value`          | `e.target.checked`     |
| Bind       | `checked={state === val}` | `checked={state}`      |
| Group by   | `name=""`attribute        | Individual             |

### Interview trap

- Radio uses `e.target.value` like a text input, but its `checked` prop is a **comparison expression** , not state directly: `checked={size === option}`.
- All radio buttons in a group must share the same `name` attribute.

---

## 4. Select (Dropdown)

**Event property:** `e.target.value`
**Bind with:** `value={state}`
**State type:** `string`

```jsx
const [country, setCountry] = useState("");

return (
  <select value={country} onChange={(e) => setCountry(e.target.value)}>
    <option value="" disabled>
      Select country
    </option>
    <option value="in">India</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
  </select>
);
```

### Multi-select

```jsx
const [tags, setTags] = useState([]);

const handleMulti = (e) => {
  // selectedOptions is an HTMLCollection, not an array — spread it first
  const values = [...e.target.selectedOptions].map((o) => o.value);
  setTags(values);
};

return (
  <select multiple value={tags} onChange={handleMulti}>
    <option value="react">React</option>
    <option value="vue">Vue</option>
    <option value="ts">TypeScript</option>
  </select>
);
```

### Interview traps

- `e.target.selectedOptions` is an `HTMLCollection`, **not an array** . You must spread it: `[...e.target.selectedOptions]` before calling `.map()`.
- For multi-select, state must be an `array`, and you must pass `multiple` prop to `<select>`.
- A disabled `<option value="">` as a placeholder is the correct pattern for "Select one" UX.

---

## 5. Number Input

**Event property:** `e.target.value`
**Raw type:** `string` (⚠️ even with `type="number"`)
**Must parse:** `Number()`, `parseInt()`, or `parseFloat()`

```jsx
const [age, setAge] = useState("");

const handleAge = (e) => {
  const raw = e.target.value; // "25" — still a string
  const parsed = parseInt(raw, 10); // 25 — number
  if (!isNaN(parsed)) setAge(parsed); // guard against NaN
};

return (
  <input
    type="number"
    value={age}
    onChange={handleAge}
    min={0}
    max={120}
    step={1}
  />
);
```

### Range slider

```jsx
const [volume, setVolume] = useState(50);

return (
  <>
    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={volume}
      onChange={(e) => setVolume(Number(e.target.value))}
    />
    <span>{volume}%</span>
  </>
);
```

### Parsing methods — when to use which

| Method              | Use when                   | Example                                  |
| ------------------- | -------------------------- | ---------------------------------------- |
| `parseInt(val, 10)` | Whole numbers (age, count) | `parseInt("25px", 10)`→`25`              |
| `parseFloat(val)`   | Decimals (price, rating)   | `parseFloat("3.14")`→`3.14`              |
| `Number(val)`       | Strict conversion          | `Number("3.14")`→`3.14`,`Number("")`→`0` |
| `+val`              | Shorthand for `Number()`   | `+"25"`→`25`                             |

### Interview trap

- Classic bug: storing `"5"` (string) in state, then doing `age + 1` and getting `"51"` (concatenation). Always parse in the handler.
- `Number("")` returns `0`, not `NaN` — be careful with empty fields.
- Always pass `step` attribute to control decimal precision.

---

## 6. Date / Time Inputs

**Event property:** `e.target.value`
**Format:** ISO string — always a string, never a Date object directly

```jsx
const [dob, setDob] = useState("");

return (
  <input
    type="date"
    value={dob}
    onChange={(e) => setDob(e.target.value)} // "2024-06-14"
    min="2000-01-01"
    max="2024-12-31"
  />
);

// Convert to JS Date object when needed
const dateObj = dob ? new Date(dob) : null;

// Pre-fill with today's date
const today = new Date().toISOString().split("T")[0]; // "2024-06-14"
```

### All date/time input formats

| type             | Value format       | Example              |
| ---------------- | ------------------ | -------------------- |
| `date`           | `YYYY-MM-DD`       | `"2024-06-14"`       |
| `time`           | `HH:mm`            | `"09:30"`            |
| `datetime-local` | `YYYY-MM-DDTHH:mm` | `"2024-06-14T09:30"` |
| `month`          | `YYYY-MM`          | `"2024-06"`          |
| `week`           | `YYYY-Www`         | `"2024-W24"`         |

### datetime-local example

```jsx
const [meeting, setMeeting] = useState("");

return (
  <input
    type="datetime-local"
    value={meeting}
    onChange={(e) => setMeeting(e.target.value)} // "2024-06-14T09:30"
  />
);
```

### Interview traps

- `datetime-local` has **no timezone info** — it's a local string. If you need UTC, append `"Z"`: `new Date(value + "Z")`.
- Value is always a **string** , never a Date object.
- `min` and `max` must be in the exact same format as the input's value.

---

## 7. Keyboard Events

**Use:** `onKeyDown` (fires first, preventable)
**Read:** `e.key` (not `e.keyCode`)

```jsx
const handleKeyDown = (e) => {
  // Submit on Enter
  if (e.key === "Enter") submitForm();

  // Close on Escape
  if (e.key === "Escape") closeModal();

  // Arrow key navigation
  if (e.key === "ArrowUp") moveUp();
  if (e.key === "ArrowDown") moveDown();

  // Block non-numeric input
  if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
    e.preventDefault();
  }

  // Ctrl+S / Cmd+S save shortcut
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    save();
  }

  // Shift+Enter for newline (vs Enter to submit)
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitForm();
  }
};

<input onKeyDown={handleKeyDown} />;
```

### Key event properties

| Property     | Type    | Description                       | Example                           |
| ------------ | ------- | --------------------------------- | --------------------------------- |
| `e.key`      | string  | Layout-aware key label            | `"a"`,`"A"`,`"Enter"`,`"ArrowUp"` |
| `e.code`     | string  | Physical key (layout-independent) | `"KeyA"`,`"Space"`,`"Digit1"`     |
| `e.keyCode`  | number  | ⚠️**Deprecated**— don't use       | `13`for Enter                     |
| `e.ctrlKey`  | boolean | Ctrl held down                    | `true`/`false`                    |
| `e.shiftKey` | boolean | Shift held down                   | `true`/`false`                    |
| `e.altKey`   | boolean | Alt/Option held down              | `true`/`false`                    |
| `e.metaKey`  | boolean | Cmd (Mac) / Win key               | `true`/`false`                    |

### Common key string values

```
"Enter"     "Tab"       "Escape"    "Backspace"   "Delete"
"ArrowUp"   "ArrowDown" "ArrowLeft" "ArrowRight"
" "         (space)
"a"-"z"     "A"-"Z"     "0"-"9"
"F1"-"F12"
```

### `e.key` vs `e.code` — when to use which

|                           | `e.key`               | `e.code`                         |
| ------------------------- | --------------------- | -------------------------------- |
| Reflects Shift?           | Yes (`a`vs `A`)       | No (always `KeyA`)               |
| Reflects keyboard layout? | Yes                   | No                               |
| Use for                   | Text input, shortcuts | Game controls, physical position |

```jsx
// e.key — layout-aware, use for most cases
if (e.key === "a") { ... }       // only when user types "a"
if (e.key === "A") { ... }       // only when user types "A" (shift+a)

// e.code — physical key, use for position-based shortcuts
if (e.code === "KeyA") { ... }   // fires for "a" and "A" and ä
```

### Three keyboard events — which to use

| Event        | When fires          | Preventable | Use for                                 |
| ------------ | ------------------- | ----------- | --------------------------------------- |
| `onKeyDown`  | Key pressed (first) | ✅ Yes      | Most cases — block input, detect Escape |
| `onKeyUp`    | Key released        | ✅ Yes      | After-action (e.g. search after typing) |
| `onKeyPress` | ⚠️**Deprecated**    | —           | Don't use                               |

### Interview traps

- `e.keyCode` is deprecated. Always use `e.key`.
- `onKeyPress` is deprecated. Always use `onKeyDown` or `onKeyUp`.
- For cross-platform shortcuts, check both `e.ctrlKey` (Windows) and `e.metaKey` (Mac).
- `e.key === " "` for spacebar — it's a single space character, not `"Space"`.

---

## 8. Form Submit

**Event:** `onSubmit` on `<form>`
**Must always call:** `e.preventDefault()`

```jsx
const [form, setForm] = useState({ name: "", email: "" });

// Single handler for all inputs using name attribute
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = (e) => {
  e.preventDefault(); // MUST — stops page reload
  console.log(form);
  // validate, then call API
};

return (
  <form onSubmit={handleSubmit}>
    <input name="name" value={form.name} onChange={handleChange} />
    <input name="email" value={form.email} onChange={handleChange} />
    <button type="submit">Submit</button>
    <button type="button" onClick={resetForm}>
      Reset
    </button>
  </form>
);
```

### Button types inside a form

| `type=`    | Behavior                                          |
| ---------- | ------------------------------------------------- |
| `"submit"` | Submits the form (triggers `onSubmit`)            |
| `"button"` | Does nothing by default — safe for custom actions |
| `"reset"`  | Clears all form fields to their initial values    |
| _(none)_   | ⚠️ Defaults to `"submit"`— common bug             |

```jsx
// ❌ BUG — this button accidentally submits the form
<button onClick={openModal}>Open Modal</button>

// ✅ CORRECT
<button type="button" onClick={openModal}>Open Modal</button>
```

### Reading form with FormData (uncontrolled)

```jsx
const handleSubmit = (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  console.log(data.get("name")); // "John"
  console.log(data.get("email")); // "john@example.com"
  // data.getAll("tags") for multi-select/checkboxes
};
```

### Interview traps

- Forgetting `e.preventDefault()` causes a full page reload.
- `onSubmit` goes on `<form>`, not on the button.
- Any `<button>` without `type="button"` inside a form submits it when clicked.
- Enter key inside a form input automatically triggers submit — that's browser-native behavior.

---

## 9. File Input

**Event property:** `e.target.files[0]` (a `File` object)
**Always uncontrolled** — you cannot set `value=` on file inputs

```jsx
const [file, setFile] = useState(null);

const handleFile = (e) => {
  const file = e.target.files[0]; // File object
  if (!file) return;

  console.log(file.name); // "resume.pdf"
  console.log(file.size); // size in bytes
  console.log(file.type); // "application/pdf"

  setFile(file);
};

// Multiple files
const handleMultiple = (e) => {
  const files = [...e.target.files]; // FileList → array
  setFiles(files);
};

return (
  <>
    <input type="file" onChange={handleFile} />
    <input type="file" multiple onChange={handleMultiple} accept=".pdf,.doc" />
  </>
);
```

### Preview an image file

```jsx
const [preview, setPreview] = useState("");

const handleImage = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  setPreview(url);
};

return (
  <>
    <input type="file" accept="image/*" onChange={handleImage} />
    {preview && <img src={preview} alt="preview" />}
  </>
);
```

### Interview traps

- You **cannot** set `value=` on a file input (browser security policy — JS can't pre-fill file paths).
- `e.target.files` is a `FileList`, not an array — spread it: `[...e.target.files]`.
- To programmatically clear a file input, set `e.target.value = ""` (the only time you can write to `.value` on file input — it only accepts an empty string).

---

## 10. Focus and Blur Events

```jsx
const [isFocused, setIsFocused] = useState(false);
const [touched, setTouched] = useState(false); // for validation

return (
  <input
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onFocus={() => setIsFocused(true)}
    onBlur={() => {
      setIsFocused(false);
      setTouched(true); // mark field as visited — trigger validation
    }}
  />
);

// Show error only after user has touched the field
{
  touched && !value && <span>Required</span>;
}
```

### Focus vs FocusIn — event bubbling

| Event        | Bubbles? | Use on           |
| ------------ | -------- | ---------------- |
| `onFocus`    | ❌ No    | The input itself |
| `onBlur`     | ❌ No    | The input itself |
| `onFocusIn`  | ✅ Yes   | Parent container |
| `onFocusOut` | ✅ Yes   | Parent container |

---

## 11. Controlled vs Uncontrolled Inputs

### Controlled (React owns the value) — preferred

```jsx
const [email, setEmail] = useState("");

<input
  value={email} // React drives the value
  onChange={(e) => setEmail(e.target.value)} // state updates on change
/>;
```

### Uncontrolled (DOM owns the value) — use with `useRef`

```jsx
const inputRef = useRef(null);

<input defaultValue="" ref={inputRef} />;

// Read on demand (e.g. on submit)
const value = inputRef.current.value;
```

### Key differences

|                    | Controlled          | Uncontrolled        |
| ------------------ | ------------------- | ------------------- |
| Value stored in    | React state         | DOM                 |
| Bind with          | `value=`            | `defaultValue=`     |
| Read via           | state variable      | `ref.current.value` |
| Validate           | Any time in handler | On submit only      |
| Real-time feedback | ✅ Easy             | ❌ Hard             |
| Use case           | Most inputs         | File inputs, legacy |

### The "uncontrolled to controlled" warning

React shows: `"A component is changing an uncontrolled input to be controlled."`

**Cause:** State starts as `undefined` or `null`, which makes React treat the input as uncontrolled. When state updates to a string, React tries to make it controlled.

```jsx
// ❌ Causes warning
const [name, setName] = useState(); // undefined
const [name, setName] = useState(null); // null

// ✅ Fix — always initialise to empty string
const [name, setName] = useState("");
```

### `value` vs `defaultValue`

|                      | `value=`          | `defaultValue=`           |
| -------------------- | ----------------- | ------------------------- |
| Who controls it      | React             | DOM                       |
| Re-renders update it | ✅ Yes            | ❌ No (only sets initial) |
| Used with            | Controlled inputs | Uncontrolled inputs       |

---

## 12. onChange vs onInput

In React, `onChange` behaves like the browser's native `oninput` — it fires on every keystroke, not just when the input loses focus.

```jsx
// In React, these are equivalent in behavior:
<input onChange={fn} />   // fires on every keystroke ✅
<input onInput={fn} />    // also works, but use onChange (React convention)
```

> In plain HTML, `onchange` fires only on blur. In React, `onChange` fires on every change. This is intentional React behavior — don't confuse it with the HTML version.

---

## 13. One Handler for Multiple Inputs (Pattern)

Use `e.target.name` to manage a whole form with one function:

```jsx
const [form, setForm] = useState({
  name: "",
  email: "",
  age: "",
  subscribe: false,
});

const handleChange = (e) => {
  const { name, type, value, checked } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
    // ↑ checkbox uses checked, everything else uses value
  }));
};

return (
  <form>
    <input name="name" type="text" value={form.name} onChange={handleChange} />
    <input
      name="email"
      type="email"
      value={form.email}
      onChange={handleChange}
    />
    <input name="age" type="number" value={form.age} onChange={handleChange} />
    <input
      name="subscribe"
      type="checkbox"
      checked={form.subscribe}
      onChange={handleChange}
    />
  </form>
);
```

This pattern works because `e.target.type` tells you whether to read `checked` or `value`.

---

## 14. Synthetic Events and `e.persist()`

React wraps native events in a **SyntheticEvent** for cross-browser consistency.

```jsx
// ⚠️ Pre-React 17: events were pooled and nullified after handler
// So you couldn't use them asynchronously:
const handleChange = (e) => {
  setTimeout(() => {
    console.log(e.target.value); // ❌ null in React <17 — event pooled
  }, 1000);
};

// Fix in React <17: call e.persist() to retain the event
const handleChange = (e) => {
  e.persist();
  setTimeout(() => {
    console.log(e.target.value); // ✅ works
  }, 1000);
};

// React 17+: event pooling removed — e.persist() is a no-op
// But it's safe to call (won't break anything)
```

> In modern React (17+), you don't need `e.persist()`. But interviewers at legacy codebases may ask about it.

---

## 15. Common Interview Questions

**Q: What is the difference between `e.target` and `e.currentTarget`?**

`e.target` is the element that triggered the event. `e.currentTarget` is the element that has the event listener attached. They differ when events bubble up.

```jsx
<div
  onClick={(e) => {
    console.log(e.target); // the button that was clicked
    console.log(e.currentTarget); // the div that has the listener
  }}
>
  <button>Click me</button>
</div>
```

---

**Q: What is event delegation and how does it work in React?**

Event delegation means attaching one listener to a parent instead of many listeners on children. React does this automatically — it attaches a single listener to the root, not to each DOM element.

---

**Q: How do you prevent a form from reloading the page?**

Call `e.preventDefault()` in the `onSubmit` handler. Without it, the browser follows the native form submission behavior and reloads.

---

**Q: Why does `onChange` fire on every keystroke in React but not in plain HTML?**

In React, `onChange` is mapped to the native `input` event (fires on every change), not the native `change` event (fires on blur). This is intentional — React's `onChange` gives you a controlled, real-time update model.

---

**Q: What's the difference between `e.key` and `e.keyCode`?**

`e.key` returns a human-readable string like `"Enter"` or `"ArrowUp"`. `e.keyCode` returned a numeric code like `13` for Enter — it's deprecated. Always use `e.key`.

---

**Q: Can you set `value` on a file input to pre-fill it?**

No. Browser security policy prevents JavaScript from setting a file path on a file input. You can only read `e.target.files`. To clear it programmatically, set `e.target.value = ""`.

---

**Q: What causes the "changing uncontrolled to controlled" warning?**

Initialising state as `undefined` or `null` instead of `""`. React sees no `value` prop initially (uncontrolled), then when state updates to a string, it becomes controlled — React warns about this switch. Fix: always use `useState("")`.

---

**Q: When would you use an uncontrolled input?**

File inputs (must be uncontrolled), integrating with third-party DOM libraries, or when you only need the value on submit and don't need real-time validation.

---

## Cheat Sheet Summary

```
Text / Email / Password / Textarea
  → e.target.value   |  value={state}   |  useState("")

Checkbox
  → e.target.checked |  checked={state} |  useState(false)

Radio
  → e.target.value   |  checked={state === option}  |  useState("")

Select (single)
  → e.target.value   |  value={state}   |  useState("")

Select (multiple)
  → [...e.target.selectedOptions].map(o => o.value)
  |  value={state}   |  useState([])

Number / Range
  → Number(e.target.value)  (it's a string — parse it!)
  |  value={state}   |  useState(0)

Date / Time / datetime-local
  → e.target.value   (ISO string "YYYY-MM-DD")
  |  value={state}   |  useState("")

File
  → e.target.files[0]   (File object — no value= binding)

Keyboard
  → e.key  (not e.keyCode)
  |  onKeyDown  (not onKeyPress — deprecated)

Form submit
  → e.preventDefault()  (always)
  |  onSubmit on <form>, not on button
  |  <button type="button"> for non-submit buttons
```
