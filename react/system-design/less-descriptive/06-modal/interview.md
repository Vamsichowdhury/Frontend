# Modal/Dialog Component — Interview Transcript

**Level:** Easy-Medium | **Duration:** 40-50 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Portal Pattern | ⏹️ |
| 3 | Close Behaviors | ⏹️ |
| 4 | Accessibility & Focus | ⏹️ |
| 5 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Build a reusable Modal component. What do you need to know?"

**What candidate should ask:**
- [ ] Should backdrop click close the modal?
- [ ] Should Escape key close it?
- [ ] Is there an animation on open/close?
- [ ] Does body scroll need to be prevented?
- [ ] Can modals be stacked (modal inside modal)?
- [ ] Accessibility requirements?

**Interviewer answers:**
> "Yes backdrop closes it. Yes Escape closes it. Simple fade is fine. Block body scroll. No stacking for now. Basic accessibility."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Portal Pattern

**Interviewer:**
> "Where in the DOM would you render the modal?"

**Expected:** Via `ReactDOM.createPortal` — render outside the current component tree, directly into `document.body` or a `#modal-root` div.

**Expected code:**
```jsx
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
```

**Interviewer pushback:**
> "Why not just render it inline in the parent component?"

**Expected:** If parent has `overflow: hidden` or low z-index, modal would be clipped or hidden behind other elements. Portal escapes the CSS stacking context.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Close Behaviors

**Interviewer:**
> "Walk me through how backdrop click and Escape key work."

**Expected backdrop + stop propagation:**
```jsx
<div className="backdrop" onClick={onClose}>       {/* closes */}
  <div className="modal" onClick={e => e.stopPropagation()}> {/* doesn't close */}
```

**Expected Escape key:**
```javascript
useEffect(() => {
  const handler = (e) => { if (e.key === "Escape") onClose(); };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, [onClose]);
```

**Expected scroll lock:**
```javascript
useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => { document.body.style.overflow = ""; };
}, []);
```

**Interviewer pushback:**
> "Why cleanup in useEffect returns?"

**Expected:** If modal unmounts without cleanup, scroll stays locked forever. Memory leak. Always clean up event listeners and side effects.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Accessibility & Focus

**Interviewer:**
> "How do you make this accessible?"

**Expected ARIA:**
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirm Delete</h2>
```

**Expected focus management:**
```javascript
const modalRef = useRef(null);
useEffect(() => {
  const firstFocusable = modalRef.current?.querySelector("button, input, [tabindex]");
  firstFocusable?.focus();
}, []);
```

**Interviewer pushback:**
> "What happens when the modal closes — where does focus go?"

**Expected:** Return focus to the element that triggered the modal. Store the trigger in a ref before opening:
```javascript
const triggerRef = useRef(null);
const openModal = () => {
  triggerRef.current = document.activeElement; // save
  setIsOpen(true);
};
const closeModal = () => {
  setIsOpen(false);
  triggerRef.current?.focus(); // restore
};
```

**Candidate response:** *(write your response here)*

---

# Phase 5 — Edge Cases & Follow-ups

**Interviewer:**
> "What about stacked modals — a modal that opens another modal?"

**Expected:** Need to manage z-index. Only the topmost modal should respond to Escape. Could use a modal stack context.

**Interviewer:**
> "How do you animate the modal open/close?"

**Expected:** CSS transitions on opacity and transform. Challenge with `if (!isOpen) return null` — can't animate out because component unmounts immediately. Solution: use `visibility` + `opacity` instead of conditional render, or use animation libraries.

**Interviewer final question:**
> "What's wrong with using z-index: 9999 everywhere?"

**Expected:** Creates arms race of z-indices. Portal + modal-root pattern is cleaner — always renders above everything naturally.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
