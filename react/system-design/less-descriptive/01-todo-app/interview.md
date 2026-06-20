# Todo App — Interview Transcript

**Level:** Easy | **Duration:** 30-45 min | **Status:** ⏳ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Component Architecture | ⏹️ |
| 3 | State Management & CRUD | ⏹️ |
| 4 | Persistence & Edge Cases | ⏹️ |
| 5 | Performance & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Let's build a Todo application. Before you start, what questions do you have for me?"

**What candidate should ask:**
- [ ] What operations are needed? (Add, delete, edit, toggle?)
- [ ] Should todos persist on page refresh?
- [ ] Do we need filters? (All / Active / Completed)
- [ ] Is there a max number of todos?
- [ ] Should it be accessible (keyboard navigation)?
- [ ] Mobile support needed?

**Interviewer answers:**
> "Yes to all — add, delete, toggle. Use localStorage for persistence. Add filters. No limit on todos. Accessible is a bonus."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Component Architecture

**Interviewer:**
> "Walk me through your component structure before writing any code."

**Expected hierarchy:**
```
App
├── Header (title)
├── TodoInput (add new)
├── FilterBar (All / Active / Completed)
├── TodoList
│   └── TodoItem × N
└── Footer (remaining count)
```

**Interviewer pushback:**
> "Why not put all the logic in one component?"

**Expected answer:** Separation of concerns, reusability, easier testing, each component has one job.

**Candidate response:** *(write your response here)*

---

# Phase 3 — State Management & CRUD

**Interviewer:**
> "Show me how you'd model the state and implement add/delete/toggle."

**Expected code:**
```javascript
// State shape
const [todos, setTodos] = useState([]);
const [filter, setFilter] = useState("all");
const [input, setInput] = useState("");

// Each todo: { id, text, completed }

// Add
const addTodo = () => {
  if (!input.trim()) return;
  setTodos([...todos, { id: Date.now(), text: input.trim(), completed: false }]);
  setInput("");
};

// Toggle
const toggleTodo = (id) =>
  setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

// Delete
const deleteTodo = (id) =>
  setTodos(todos.filter(t => t.id !== id));
```

**Interviewer pushback:**
> "Why use `Date.now()` as the ID? What's the risk?"

**Expected:** Not truly unique if two todos added in same millisecond. Better to use `crypto.randomUUID()`.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Filtering + Persistence

**Interviewer:**
> "How do you implement filters and persist data?"

**Expected filtering:**
```javascript
const filteredTodos = todos.filter(t => {
  if (filter === "active") return !t.completed;
  if (filter === "completed") return t.completed;
  return true;
});
```

**Expected persistence:**
```javascript
// Load on mount
const [todos, setTodos] = useState(() => {
  const saved = localStorage.getItem("todos");
  return saved ? JSON.parse(saved) : [];
});

// Save on change
useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);
```

**Interviewer pushback:**
> "What happens if localStorage is full or unavailable?"

**Expected:** Wrap in try/catch. localStorage is synchronous and can throw.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Performance & Follow-ups

**Interviewer:**
> "If the user adds 1000 todos, how do you keep it performant?"

**Expected:**
- `React.memo` on TodoItem — skips re-render if props unchanged
- `useCallback` on handlers passed as props
- Key should be stable ID (not index)

**Interviewer final question:**
> "What would you add if we had more time?"

**Good answers:**
- Edit todo text inline
- Drag to reorder
- Due dates
- Sync to backend API
- Dark mode

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
