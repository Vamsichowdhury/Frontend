# Modal/Dialog Component - System Design Overview

**Level:** Easy-Medium  
**Time to Solve:** 40-50 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a reusable Modal component where:
- Opens and closes programmatically
- Closes on backdrop click
- Closes on Escape key press
- Traps focus inside the modal
- Renders outside normal DOM hierarchy (portal)
- Blocks body scroll when open
- Accessible to screen readers

---

## Real-World Examples

- Confirmation dialogs ("Are you sure you want to delete?")
- Image preview overlays
- Form popups (create new item)
- Alert / error dialogs
- Cookie consent banners

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| ReactDOM.createPortal | Render outside component tree |
| Event bubbling | Closing on backdrop but not content |
| Focus management | Trap focus, return on close |
| useEffect for keyboard | Escape key listener |
| Accessibility | ARIA roles, focus trap |
| Body scroll lock | Prevent scroll behind modal |

---

## What You'll Learn

- Portal pattern: why and how to render outside parent DOM
- Event bubbling: stopPropagation to prevent backdrop click propagating
- Focus trap: keep keyboard focus inside modal while open
- Scroll lock: `document.body.style.overflow = "hidden"`
- ARIA dialog pattern: role, aria-modal, aria-labelledby
- useEffect cleanup: remove event listeners on unmount

---

## High-Level Architecture

```
<App />
└── <Modal isOpen={true} onClose={fn} title="Confirm">
    ├── rendered via ReactDOM.createPortal into #modal-root
    └── DOM output:
        <div class="backdrop" onClick={onClose}>   ← clicking this closes
          <div class="modal" onClick={stopPropagation}>
            <header>Title + CloseButton</header>
            <main>{children}</main>
            <footer>Action Buttons</footer>
          </div>
        </div>
```

---

## Data Structure

```javascript
// Modal Props
{
  isOpen: boolean,
  onClose: () => void,
  title: string,
  children: ReactNode,
  size?: "sm" | "md" | "lg",
  closeOnBackdrop?: boolean,   // default true
  showCloseButton?: boolean    // default true
}

// Usage
const [isModalOpen, setIsModalOpen] = useState(false);

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Delete Item"
>
  <p>Are you sure?</p>
  <button onClick={handleDelete}>Yes, Delete</button>
</Modal>
```

---

## Data Flow

```
Parent renders <Modal isOpen={false} />:
  → nothing rendered

User clicks "Open Modal":
  → setIsOpen(true)
  → Modal renders via portal into #modal-root
  → body scroll locked
  → focus moves to modal
  → Escape listener added

User clicks Backdrop:
  → backdrop's onClick fires
  → onClose() called
  → isOpen = false
  → Modal removed from DOM
  → scroll restored
  → focus returns to trigger element

User clicks inside Modal content:
  → stopPropagation prevents event reaching backdrop
  → Modal stays open

User presses Escape:
  → keydown listener fires
  → onClose() called

Modal closes:
  → useEffect cleanup removes keydown listener
  → body scroll restored
```

---

## Key Concepts to Learn

### 1. Portal — Render Outside Parent
```jsx
import { createPortal } from "react-dom";

function Modal({ isOpen, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="backdrop">
      <div className="modal">{children}</div>
    </div>,
    document.getElementById("modal-root") // in public/index.html
  );
}
```

### 2. Backdrop Click (Stop Propagation)
```jsx
<div
  className="backdrop"
  onClick={onClose}
>
  <div
    className="modal"
    onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
  >
    {children}
  </div>
</div>
```

### 3. Escape Key Listener
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown); // cleanup!
}, [onClose]);
```

### 4. Body Scroll Lock
```javascript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  }
  return () => {
    document.body.style.overflow = ""; // restore on close
  };
}, [isOpen]);
```

### 5. Focus Trap
```javascript
const modalRef = useRef(null);

useEffect(() => {
  if (isOpen) {
    // Auto-focus first focusable element
    const focusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }
}, [isOpen]);
```

### 6. Accessibility
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  ref={modalRef}
>
  <h2 id="modal-title">{title}</h2>
  {children}
</div>
```

---

## Implementation Phases

### Phase 1 — Basic Modal
- isOpen prop controls visibility
- Children rendered inside modal box
- Close button

### Phase 2 — Portal
- createPortal into #modal-root
- Add modal-root div to index.html

### Phase 3 — Close Behaviors
- Backdrop click (with stopPropagation)
- Escape key listener
- Cleanup on unmount

### Phase 4 — UX Polish
- Body scroll lock
- CSS animation (fade in/slide up)
- Focus management

### Phase 5 — Accessibility
- ARIA roles and attributes
- Focus trap implementation
- Return focus to trigger on close

---

## Performance Considerations

- Lazy render: only mount modal DOM when `isOpen = true`
- Animation: CSS transitions are GPU accelerated vs JS
- Z-index management: use a stacking context strategy

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Multiple modals stacked | Z-index management, modal stack |
| Modal inside a modal | Handle Escape key for topmost only |
| Long content in modal | Internal scroll on modal body |
| Modal while page is loading | Disable trigger button |
| Page scrolled before opening | Lock scroll, restore same scroll position |
| Form inside modal | Handle submit separately from close |

---

## Interview Tips for This Question

- Immediately mention createPortal — this is what separates candidates
- Explain WHY portal: avoid z-index and overflow:hidden conflicts from ancestors
- Mention focus trap — accessibility-conscious answer
- Ask: "Should clicking backdrop close the modal? Always, or configurable?"

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| Renders inline in parent | Uses createPortal |
| No event stopPropagation | Properly prevents backdrop close when clicking content |
| No Escape key | Keyboard accessible |
| No scroll lock | Locks body scroll while open |
| No accessibility | ARIA roles, focus trap, return focus |
