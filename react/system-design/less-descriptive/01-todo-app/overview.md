# Todo App - System Design Overview

**Level:** Easy  
**Time to Solve:** 30-45 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a functional Todo application where users can:
- Add new tasks
- Mark tasks as complete/incomplete
- Delete tasks
- Filter tasks (All, Active, Completed)
- Persist tasks across page refresh (localStorage)

---

## Real-World Examples

- Todoist
- Microsoft To Do
- Apple Reminders
- Notion Task Lists

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Component composition | Do you break UI into small, reusable pieces? |
| State management | Can you manage list data with useState? |
| Event handling | Add, delete, toggle — clean handlers |
| Controlled components | Input value managed by React state |
| Side effects | useEffect for localStorage sync |
| Conditional rendering | Show empty state, filtered lists |

---

## What You'll Learn

- How to structure a small React app from scratch
- Controlled vs uncontrolled input components
- Array manipulation (add, remove, update in state)
- `useEffect` for syncing state to localStorage
- Lifting state up vs keeping local state
- Filtering and rendering dynamic lists
- How to ask clarifying questions for "simple" problems

---

## High-Level Architecture

```
App (holds all state)
├── Header
├── TodoInput (add new todo)
├── FilterBar (All / Active / Completed)
├── TodoList
│   └── TodoItem (for each todo)
└── Footer (count of remaining)
```

---

## Data Structure

```javascript
// Each todo item shape:
{
  id: "unique_id",         // crypto.randomUUID()
  text: "Buy groceries",   // task description
  completed: false,         // toggle state
  createdAt: 1234567890    // timestamp
}

// App state:
const [todos, setTodos] = useState([]);
const [filter, setFilter] = useState("all"); // "all" | "active" | "completed"
const [inputValue, setInputValue] = useState("");
```

---

## Data Flow

```
User types in input → update inputValue (controlled input)
User presses Enter / clicks Add:
    → create new todo object
    → setTodos([...todos, newTodo])
    → clear inputValue

User clicks checkbox:
    → map through todos
    → toggle completed for that id
    → setTodos(updated list)

User clicks delete:
    → filter out that todo by id
    → setTodos(filtered list)

Filter changes:
    → compute filteredTodos from todos + filter
    → re-render TodoList with filtered items

State changes:
    → useEffect saves todos to localStorage
```

---

## Key Concepts to Learn

### 1. Controlled Input
```jsx
// Input is controlled by React state, not DOM
<input
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && addTodo()}
/>
```

### 2. Immutable State Updates
```javascript
// WRONG — mutating state directly
todos.push(newTodo);

// CORRECT — return new array
setTodos([...todos, newTodo]);

// Toggling a specific item
setTodos(todos.map(todo =>
  todo.id === id ? { ...todo, completed: !todo.completed } : todo
));

// Deleting an item
setTodos(todos.filter(todo => todo.id !== id));
```

### 3. useEffect for localStorage
```javascript
// Save to localStorage whenever todos change
useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);

// Load from localStorage on mount
const [todos, setTodos] = useState(() => {
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : [];
});
```

### 4. Derived State for Filters
```javascript
// Don't store filtered todos in state — compute from existing state
const filteredTodos = todos.filter(todo => {
  if (filter === "active") return !todo.completed;
  if (filter === "completed") return todo.completed;
  return true; // "all"
});
```

---

## Implementation Phases

### Phase 1 — Core Structure
- App component with todos state
- TodoInput component
- Basic TodoItem render

### Phase 2 — CRUD Operations
- Add todo on Enter / button click
- Toggle complete on checkbox click
- Delete todo on button click

### Phase 3 — Filtering
- Filter state (all/active/completed)
- FilterBar component
- Derived filteredTodos

### Phase 4 — Persistence
- useEffect to save to localStorage
- Load initial state from localStorage

### Phase 5 — Polish (if time)
- Empty state message
- Footer with count of remaining items
- Edit todo text inline

---

## Performance Considerations

- Use `useCallback` on handlers passed to TodoItem (avoids re-renders)
- Use `React.memo` on TodoItem (memoize if list is large)
- Key prop must be stable (use id, not index)

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Empty input submitted | Trim whitespace, reject empty strings |
| Duplicate todos | Allow (don't block unless required) |
| Very long text | CSS truncation + title tooltip |
| localStorage unavailable | Wrap in try/catch |
| 100+ todos in list | Key prop optimization, lazy render |

---

## Interview Tips for This Question

- Don't underestimate it — show depth by discussing `useCallback`, `React.memo`
- Ask about persistence requirement early (localStorage vs API?)
- Ask about edit functionality
- Mention accessibility (checkbox labeling, keyboard navigation)
- Discuss data structure design upfront

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| Just implements Add/Delete/Toggle | Also discusses persistence, edit, and performance |
| Uses index as key | Uses unique id as key, explains why |
| Ignores empty input | Validates and trims input |
| Single monolithic component | Clean component hierarchy |
| Doesn't mention localStorage | Proactively discusses persistence |
