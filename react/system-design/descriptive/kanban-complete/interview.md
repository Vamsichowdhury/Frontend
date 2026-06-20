# Kanban Board — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Will push hard on the ordering data model — fractional indexing is the insight that separates strong candidates. Will also probe the drag-and-drop library choice (mobile touch is the key) and the optimistic move with snapshot rollback.

---

> **How to use this file:**
> The ordering data model discussion (Phase 3) is the dramatic centre of this interview — it is to Kanban what the conflict problem is to Google Docs. Understanding why integer positions create O(n) writes and how fractional indexing reduces that to O(1) is the single most impressive thing you can say in a Kanban interview. The drag-and-drop implementation (Phase 4 & 5) is the second most important area.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design a Kanban board — like Trello or Jira's board view. Go ahead.

---

**Candidate:**

Let me ask a few clarifying questions first.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why scoping a Kanban board matters
> "Kanban board" spans from a simple three-column Todo/In-Progress/Done board (an afternoon of work) to a full collaborative project management tool with real-time sync, permission roles, activity logs, and integrations. The ordering model, drag-and-drop implementation, and collaboration features each add substantial complexity. Scoping these upfront determines which problems are worth discussing in depth.

---

**Q1. Are columns fixed (Todo / In Progress / Done) or can users create and name their own columns?**

> **Why ask this:**
> Fixed columns means the column list is hardcoded — you never need to create, rename, reorder, or delete columns. That's a much simpler system.
>
> Custom columns means columns are data — they need the same CRUD, ordering, and drag-to-reorder functionality as cards. The ordering problem (fractional indexing) applies to both columns and cards. Asking this upfront signals you understand that columns being data is non-trivial.

---

**Q2. Do cards need to be reordered within a column, or just moved between columns?**

> **Why ask this:**
> Moving cards between columns is easier — just update the card's `columnId`. No ordering problem.
>
> Reordering within a column is where the ordering data model becomes critical. If yes, you need fractional indexing or some other ordering strategy. This single question determines whether the ordering discussion happens at all.

---

**Q3. Mobile support — should drag-and-drop work on touch devices?**

> **Why ask this:**
> This is the single most important question for the drag-and-drop implementation. The HTML5 Drag and Drop API does NOT fire on mobile touch devices. It only responds to mouse events.
>
> If mobile is required, you must use a library that uses the Pointer Events API under the hood (which works on both mouse and touch). This is the primary reason to choose @dnd-kit over the native HTML5 DnD API.
>
> Asking this immediately signals you know the HTML5 DnD limitation — a distinction most junior and mid-level candidates miss.

---

**Q4. Is real-time collaboration required — multiple users seeing each other's changes instantly?**

> **Why ask this:**
> Real-time collaboration multiplies the complexity significantly. You need WebSocket, conflict resolution (what if two users move the same card simultaneously?), and operational transformation or CRDT concepts from the Google Docs problem applied to card positions.
>
> Without collaboration, it's a single-user CRUD app. The difference in scope is 3–4× the complexity.

---

**Q5. What does a card contain — just a title, or also description, labels, assignees, due dates?**

> **Why ask this:**
> A title-only card is a simple string. A full card with rich content needs a detail modal with multiple fields, potentially inline editing, label management, and a date picker. Each field adds scope to the card detail phase of the discussion.

---

**Interviewer:**

Good questions. Here's the scope:

- Custom columns — users can create, rename, reorder, delete.
- Yes, reorder cards within columns and drag between columns.
- Yes, mobile support required.
- No real-time collaboration for now — single user.
- Cards have title, description, labels, and due date.

---

**Candidate:**

Perfect. Custom columns and mobile drag-and-drop — those two constraints shape the entire design. Let me start with the data model since that underpins everything, then go deep on drag-and-drop.

---

## ─────────────────────────────────────
## PHASE 2 — Data Model & Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the data model and state structure.

---

**Candidate:**

The board has columns, columns have cards, both have an explicit order. Here's the shape:

```javascript
// State at the top level
const [board, setBoard] = useState({
  id: "board_1",
  title: "Product Roadmap",
  columns: [
    {
      id: "col_todo",
      title: "To Do",
      order: 1.0,       // ← I'll explain this shortly
      cards: [
        {
          id: "card_1",
          title: "Design login page",
          description: "Create Figma mockups",
          order: 1.0,
          labels: ["design", "high"],
          dueDate: "2024-02-15",
          assigneeId: null
        },
        {
          id: "card_2",
          title: "Write unit tests",
          order: 2.0,
          labels: ["engineering"],
          dueDate: null
        }
      ]
    },
    {
      id: "col_inprogress",
      title: "In Progress",
      order: 2.0,
      cards: [...]
    }
  ]
});
```

The columns are sorted by `order` before rendering. Cards within each column are sorted by `order`. The `order` field is a floating-point number — and that's the most important design decision in the whole system.

---

## ─────────────────────────────────────
## PHASE 3 — The Ordering Problem
## ─────────────────────────────────────

---

**Interviewer:**

Why a floating-point `order` field? Why not just use integers — 1, 2, 3?

---

**Candidate:**

Integer positions cause an O(n) write problem on every insertion. Let me show it:

```
Column "To Do" has 3 cards:
  Card A: order=1
  Card B: order=2
  Card C: order=3

User drags card X and drops it between A and B.
X needs to be at position 2.
But B is already at position 2.

Now we must:
  Update X: order = 2
  Update B: order = 3
  Update C: order = 4

That's 3 database writes for 3 cards.
For a column with 20 cards, inserting at position 1
requires updating ALL 20 cards.
This is O(n) writes per insert.
```

Fractional indexing solves this:

```
Card A: order=1.0
Card B: order=2.0
Card C: order=3.0

User inserts X between A and B:
  X.order = (A.order + B.order) / 2
  X.order = (1.0 + 2.0) / 2 = 1.5

Only ONE write — just X.
A, B, C untouched. ✅

Sort by order: A(1.0), X(1.5), B(2.0), C(3.0) — correct order.
```

This extends to any insertion:

```
Insert Y between A(1.0) and X(1.5):
  Y.order = (1.0 + 1.5) / 2 = 1.25
  → 1 write

Insert Z between A(1.0) and Y(1.25):
  Z.order = (1.0 + 1.25) / 2 = 1.125
  → 1 write

Still O(1) per insert, always. ✅
```

---

**Interviewer:**

You keep halving the gap. Eventually the numbers get so close that floating point can't distinguish them. What happens then?

---

**Candidate:**

That's the one weakness of fractional indexing. IEEE 754 double-precision floating point has about 15–16 significant decimal digits. After approximately 50 halvings from the same gap, the computed midpoint equals one of its neighbours and the ordering becomes incorrect.

In practice, 50 halvings of the same gap never happens in real usage. Users don't insert 50 consecutive cards between the same two cards.

But for production robustness, the solution is **periodic rebalancing**:

```
Trigger: when any gap in a column falls below a threshold
  (e.g. adjacent orders differ by less than 0.0001)

Rebalance: reassign clean, evenly-spaced integers to all cards
  Card 1 → order = 1000
  Card 2 → order = 2000
  Card 3 → order = 3000
  (large gaps restore capacity for many future insertions)

Cost: O(n) writes, but this is rare — maybe once per month per column
```

In practice, I'd use the `fractional-indexing` npm library which handles this automatically. It generates string-based keys like `"a0"`, `"a1"`, `"a4V"` with lexicographic ordering — same concept but with unlimited precision.

---

**Interviewer:**

How do you compute the order for a card dropped at the top of a column — before all existing cards?

---

**Candidate:**

You need a sentinel value. There's no card before the first one to take an average with.

```javascript
const computeNewOrder = (cardsBefore, cardsAfter) => {
  // Inserting at the top: no card before
  if (!cardsBefore) {
    return cardsAfter ? cardsAfter.order / 2 : 1.0;
    // Half of the first card's order
    // If column is empty: just use 1.0
  }

  // Inserting at the bottom: no card after
  if (!cardsAfter) {
    return cardsBefore.order + 1.0;
    // One more than the last card
  }

  // Inserting between two cards (the normal case)
  return (cardsBefore.order + cardsAfter.order) / 2;
};
```

```
Insert at top of column (before Card A at order=1.0):
  cardsBefore = null, cardsAfter = A(1.0)
  newOrder = 1.0 / 2 = 0.5
  Sort: new(0.5), A(1.0), B(2.0) ✅

Insert at bottom of column (after Card C at order=3.0):
  cardsBefore = C(3.0), cardsAfter = null
  newOrder = 3.0 + 1.0 = 4.0
  Sort: A(1.0), B(2.0), C(3.0), new(4.0) ✅
```

---

## ─────────────────────────────────────
## PHASE 4 — Drag and Drop — Library Choice
## ─────────────────────────────────────

---

**Interviewer:**

Let's talk about drag and drop. Why not just use the HTML5 Drag and Drop API?

---

**Candidate:**

The HTML5 DnD API has one fatal flaw for this use case: **it doesn't work on mobile**.

The HTML5 DnD API is based on `mousedown`, `mouseup`, and `dragstart` events. Mobile browsers fire touch events (`touchstart`, `touchmove`, `touchend`), not mouse events. So a drag-and-drop implementation using the native API works on desktop and is completely broken on touch devices.

Since the requirements explicitly include mobile support, the native API is ruled out.

The second reason is ghost image customisation. The native DnD creates a ghost image as a browser-rendered screenshot of the dragged element. You have limited control over how it looks. Custom styling — transparency, scale, shadow — requires a custom drag overlay.

```
HTML5 DnD:
  ❌ No mobile/touch support
  ❌ Ghost image not customisable
  ❌ No keyboard drag accessibility
  ❌ No auto-scroll when dragging near edges
  ✅ No library needed

@dnd-kit:
  ✅ Touch support via Pointer Events API
  ✅ Full custom DragOverlay (render anything)
  ✅ Keyboard accessibility (Tab + Space/Enter to drag)
  ✅ Auto-scroll when dragging near container edges
  ✅ Collision detection algorithms
  ✅ ~15KB gzip
```

---

**Interviewer:**

Walk me through how @dnd-kit works conceptually — the main components.

---

**Candidate:**

@dnd-kit has three building blocks:

```javascript
import {
  DndContext,         // 1. Context provider — wraps the whole board
  useDraggable,       // 2. Hook — makes an element draggable
  useDroppable,       // 3. Hook — makes an element a drop target
  DragOverlay,        // 4. Component — renders the custom ghost image
  closestCenter       // 5. Collision algorithm — detects drop target
} from "@dnd-kit/core";
```

**DndContext** — wraps the entire board. Manages drag state, fires events:

```jsx
<DndContext
  collisionDetection={closestCenter}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  {columns.map(col => <Column key={col.id} column={col} />)}
  <DragOverlay>
    {activeCard && <CardGhost card={activeCard} />}
  </DragOverlay>
</DndContext>
```

**useDraggable** — applied to each card:

```javascript
function Card({ card }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { type: "card", card, columnId: card.columnId }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}    // onPointerDown, onKeyDown, etc.
      {...attributes}   // aria-describedby, tabIndex, role
      style={{ opacity: isDragging ? 0 : 1 }}  // hide original while dragging
    >
      {card.title}
    </div>
  );
}
```

**useDroppable** — applied to each column's card list area:

```javascript
function ColumnDropArea({ columnId, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 100,
        background: isOver ? "rgba(99, 102, 241, 0.1)" : "transparent",
        borderRadius: 8,
        transition: "background 0.15s"
      }}
    >
      {children}
    </div>
  );
}
```

---

**Interviewer:**

When a card is dragged, the original card disappears (opacity: 0) and a ghost appears. Walk me through how the ghost works.

---

**Candidate:**

The `DragOverlay` component renders a floating element that follows the user's pointer. It exists outside the normal document flow — it's positioned absolutely over everything.

When a drag starts, I record the active card:

```javascript
const [activeCard, setActiveCard] = useState(null);

const handleDragStart = (event) => {
  const { active } = event;
  setActiveCard(active.data.current.card);
};
```

The `DragOverlay` renders `<CardGhost>` which is a slightly styled version of the card:

```jsx
<DragOverlay>
  {activeCard && (
    <CardGhost card={activeCard} />
    // Rendered at 1.05× scale, with a box-shadow
    // Follows cursor position — handled by @dnd-kit automatically
  )}
</DragOverlay>
```

The original card at its source position has `opacity: 0` — it's invisible but still occupies its space in the layout (this is the placeholder). When dropped, the card animates back to full opacity in its new position.

---

## ─────────────────────────────────────
## PHASE 5 — Drop Position Detection
## ─────────────────────────────────────

---

**Interviewer:**

The user drags a card and hovers over a column with 5 cards. How does the system know which gap to insert into — above card 3 or below card 3?

---

**Candidate:**

This is the "within-column sorting" problem. I need to detect not just which column the card is over, but which position within that column.

@dnd-kit's `SortableContext` and `useSortable` handle this for the within-column case:

```javascript
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";

function Column({ column }) {
  return (
    <SortableContext
      items={column.cards.map(c => c.id)}
      strategy={verticalListSortingStrategy}
    >
      {column.cards.map(card => (
        <SortableCard key={card.id} card={card} />
      ))}
    </SortableContext>
  );
}
```

`SortableContext` uses the `closestCenter` collision algorithm to determine insertion position. As the drag overlay passes over cards, @dnd-kit computes which card's centre point the overlay is closest to. When a target card is detected, items reorder temporarily to show a placeholder.

For the cross-column case, the `onDragOver` event fires and tells us:

```javascript
const handleDragOver = (event) => {
  const { active, over } = event;

  if (!over) return;

  const activeCardId  = active.id;
  const overId        = over.id; // could be a column ID or a card ID

  const sourceColumnId = active.data.current.columnId;
  const targetColumnId = over.data.current?.columnId || overId;
  // If over.id is a card → use that card's columnId
  // If over.id is a column → use that column's id directly

  if (sourceColumnId !== targetColumnId) {
    // Move card to new column, insert at appropriate position
    moveCardToColumn(activeCardId, sourceColumnId, targetColumnId, overId);
  }
};
```

---

## ─────────────────────────────────────
## PHASE 6 — Optimistic Move
## ─────────────────────────────────────

---

**Interviewer:**

The user drops a card into a new column. Walk me through the full state update — local and API.

---

**Candidate:**

Three steps: snapshot, optimistic update, API sync.

**Step 1 — Snapshot before drag starts**

```javascript
const boardSnapshot = useRef(null);

const handleDragStart = (event) => {
  // Deep copy current state before any changes
  boardSnapshot.current = JSON.parse(JSON.stringify(board));
  setActiveCard(event.active.data.current.card);
};
```

**Step 2 — Optimistic update on drop**

```javascript
const handleDragEnd = async (event) => {
  const { active, over } = event;
  setActiveCard(null);

  if (!over) return; // dropped outside any column

  const cardId        = active.id;
  const sourceColId   = active.data.current.columnId;
  const targetColId   = over.data.current?.columnId || over.id;
  const overCardId    = over.data.current?.type === "card" ? over.id : null;

  // Compute the new order value
  const targetColumn = board.columns.find(c => c.id === targetColId);
  const overIndex    = overCardId
    ? targetColumn.cards.findIndex(c => c.id === overCardId)
    : targetColumn.cards.length;

  const cardBefore = targetColumn.cards[overIndex - 1] ?? null;
  const cardAfter  = targetColumn.cards[overIndex] ?? null;
  const newOrder   = computeNewOrder(cardBefore, cardAfter);

  // Apply to local state immediately
  setBoard(prev => moveCardInState(prev, cardId, sourceColId, targetColId, newOrder));

  // API call in background
  try {
    await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: targetColId, order: newOrder })
    });
    boardSnapshot.current = null; // success — discard snapshot
  } catch {
    // Rollback
    setBoard(boardSnapshot.current);
    boardSnapshot.current = null;
    showToast("Failed to move card. Change reverted.");
  }
};
```

**The `moveCardInState` helper:**

```javascript
const moveCardInState = (board, cardId, fromColId, toColId, newOrder) => {
  return {
    ...board,
    columns: board.columns.map(col => {
      if (col.id === fromColId) {
        // Remove card from source column
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
      }
      if (col.id === toColId) {
        // Find the moved card (might still be in fromColId if same column)
        const movedCard = board.columns
          .find(c => c.id === fromColId)
          .cards.find(c => c.id === cardId);

        // Add card with new order
        const updated = [
          ...col.cards.filter(c => c.id !== cardId),
          { ...movedCard, columnId: toColId, order: newOrder }
        ].sort((a, b) => a.order - b.order);

        return { ...col, cards: updated };
      }
      return col;
    })
  };
};
```

---

**Interviewer:**

Two users are on the board at the same time (even though we said no real-time collab). User A moves card 1 to column B. User B simultaneously moves card 1 to column C. Both save. What happens?

---

**Candidate:**

This is a write conflict. Without real-time collaboration, the board is "last write wins" by default — whoever saves last determines the card's final position. User A saves to column B, User B saves to column C 2 seconds later → card ends up in column C.

This is acceptable for a non-collaborative tool. It's the same behaviour as Google Sheets without real-time sync — last save wins.

For a production-grade fix without full real-time collaboration, you'd add an `updatedAt` timestamp to each card:

```javascript
// On save:
PATCH /api/cards/:id { columnId, order, updatedAt: clientTimestamp }

// Server checks:
if (card.updatedAt > requestBody.updatedAt) {
  return 409 Conflict  // someone else updated more recently
}
```

The client receives 409 and shows: "This card was updated by someone else. Reload to see current state."

Full conflict resolution (both moves preserved) would require the CRDT approach from the Google Docs problem — a significant investment.

---

## ─────────────────────────────────────
## PHASE 7 — Card Detail Modal
## ─────────────────────────────────────

---

**Interviewer:**

User clicks on a card to open the detail modal. Walk me through it.

---

**Candidate:**

The card detail modal opens as a portal — same pattern as the Kanban board's cards need to escape the column's overflow constraints:

```javascript
function CardDetailModal({ card, onClose, onUpdate }) {
  const [editedCard, setEditedCard] = useState(card);
  const debouncedSave = useCallback(
    debounce((updates) => {
      fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
    }, 800),
    [card.id]
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setEditedCard(prev => ({ ...prev, title: newTitle }));
    debouncedSave({ title: newTitle });       // auto-save as user types
    onUpdate({ ...card, title: newTitle });   // update board state optimistically
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card-modal" onClick={e => e.stopPropagation()}>
        <textarea
          value={editedCard.title}
          onChange={handleTitleChange}
          className="card-title-input"
        />
        <textarea
          value={editedCard.description}
          onChange={e => {
            setEditedCard(prev => ({ ...prev, description: e.target.value }));
            debouncedSave({ description: e.target.value });
          }}
          placeholder="Add a description..."
        />
        <LabelSelector
          selected={editedCard.labels}
          onChange={labels => {
            setEditedCard(prev => ({ ...prev, labels }));
            debouncedSave({ labels });
          }}
        />
        <DatePicker
          value={editedCard.dueDate}
          onChange={dueDate => {
            setEditedCard(prev => ({ ...prev, dueDate }));
            debouncedSave({ dueDate });
          }}
        />
      </div>
    </div>,
    document.body
  );
}
```

Auto-save with debounce means changes save automatically 800ms after the user stops typing — no explicit "Save" button needed. This is the pattern Notion, Linear, and Trello all use.

---

**Interviewer:**

The user is typing in the title field in the modal. Simultaneously the board state updates (from a different action). Does the modal lose focus?

---

**Candidate:**

The modal is controlled by `editedCard` — its own local state, separate from the board state. Board state changes don't affect `editedCard` directly.

The only risk is if `onUpdate` causes a re-render that somehow steals focus. This is prevented by:
1. The modal being a portal (rendered in `document.body`, outside the board component tree)
2. React preserving focus across re-renders — focus only moves if the DOM node is unmounted and remounted

If the `card` prop changes during editing (e.g. another user updates the same card in a collab scenario), I'd need to decide whether to merge changes or show a conflict warning. For single-user, this isn't a concern.

---

## ─────────────────────────────────────
## PHASE 8 — Column Management
## ─────────────────────────────────────

---

**Interviewer:**

User clicks "+ Add Column." Walk me through it.

---

**Candidate:**

```javascript
const addColumn = async () => {
  const newColumn = {
    id: `col_${Date.now()}`,  // temp ID
    title: "New Column",
    order: getLastColumnOrder() + 1.0,  // add after last column
    cards: []
  };

  // Optimistic: add to board immediately, auto-focus the title
  setBoard(prev => ({
    ...prev,
    columns: [...prev.columns, newColumn]
  }));
  setEditingColumnId(newColumn.id);  // auto-focus title for immediate rename

  try {
    const created = await fetch("/api/columns", {
      method: "POST",
      body: JSON.stringify({
        boardId: board.id,
        title: newColumn.title,
        order: newColumn.order
      })
    }).then(r => r.json());

    // Replace temp ID with server-assigned real ID
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.id === newColumn.id ? { ...col, id: created.id } : col
      )
    }));
  } catch {
    // Remove the optimistically added column
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== newColumn.id)
    }));
    showToast("Failed to create column.");
  }
};
```

The new column appears immediately with the title focused for immediate rename — the same UX as Trello.

---

**Interviewer:**

User deletes a column that has 8 cards in it. What happens?

---

**Candidate:**

Deleting a column with cards is destructive — 8 cards would be permanently deleted. This requires an explicit confirmation:

```jsx
const handleDeleteColumn = (columnId) => {
  const column = board.columns.find(c => c.id === columnId);

  if (column.cards.length > 0) {
    setConfirmDialog({
      message: `Delete "${column.title}"? This will permanently delete ${column.cards.length} card${column.cards.length > 1 ? "s" : ""}.`,
      onConfirm: () => executeDeleteColumn(columnId),
      onCancel:  () => setConfirmDialog(null),
      confirmLabel: "Delete column and all cards",
      confirmVariant: "destructive"
    });
  } else {
    // Empty column — safe to delete without confirmation
    executeDeleteColumn(columnId);
  }
};
```

The confirmation dialog uses a `<Modal>` portal. The confirm button is styled red (destructive variant) and the cancel button is the visual default — reducing accidental deletions.

---

**Interviewer:**

User renames a column by double-clicking its title. What's the implementation?

---

**Candidate:**

Inline editing — the title becomes an input on double-click, saves on blur or Enter:

```javascript
function ColumnHeader({ column, onRename }) {
  const [isEditing, setIsEditing]   = useState(false);
  const [editValue, setEditValue]   = useState(column.title);
  const inputRef = useRef(null);

  const startEdit = () => {
    setIsEditing(true);
    setEditValue(column.title);
    // Auto-focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== column.title) {
      onRename(column.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div className="column-header">
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="column-title-input"
        />
      ) : (
        <h3 onDoubleClick={startEdit}>{column.title}</h3>
      )}
    </div>
  );
}
```

If the user presses Escape, the edit is abandoned and the original title is restored. If they type nothing and blur, the empty string check prevents saving an empty column title.

---

## ─────────────────────────────────────
## PHASE 9 — Column Reordering
## ─────────────────────────────────────

---

**Interviewer:**

Columns themselves can be reordered. How does that work?

---

**Candidate:**

Column reordering is the exact same problem as card reordering — it's the ordering data model applied one level up.

Columns have an `order` field, same fractional indexing approach:

```javascript
// Drag column "In Progress" before column "To Do":
  In Progress: order = 2.0
  To Do:       order = 1.0

  New order for In Progress:
    cardBefore = null (nothing before "To Do")
    cardAfter  = To Do (order=1.0)
    newOrder   = 1.0 / 2 = 0.5

  Result: In Progress(0.5), To Do(1.0), Done(3.0) ✅
```

With @dnd-kit, I wrap the columns container in a `SortableContext`:

```jsx
<SortableContext
  items={columns.map(c => c.id)}
  strategy={horizontalListSortingStrategy}  // columns are horizontal
>
  {columns.map(col => (
    <SortableColumn key={col.id} column={col} />
  ))}
</SortableContext>
```

The `SortableColumn` uses `useSortable` with `data: { type: "column" }` so the collision detection can distinguish between dragging a card and dragging a column.

---

## ─────────────────────────────────────
## PHASE 10 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

A board has 10 columns and 50 cards. User drags a card. Without any optimisation, which components re-render?

---

**Candidate:**

Without `React.memo`:

```
Board state changes on every drag move (onDragOver fires continuously)
→ Board re-renders
→ All 10 Column components re-render
→ All 50 Card components re-render
→ All column headers re-render

50 cards × each re-render = visible jank during drag
```

With `React.memo`:

```javascript
const Card = React.memo(({ card, isActive }) => {
  // Only re-renders if card data or isActive changes
  return (
    <div style={{ opacity: isActive ? 0 : 1 }}>
      {card.title}
    </div>
  );
}, (prev, next) => {
  return (
    prev.card.title     === next.card.title    &&
    prev.card.labels    === next.card.labels   &&
    prev.card.dueDate   === next.card.dueDate  &&
    prev.isActive       === next.isActive
  );
});

const Column = React.memo(({ column }) => { ... });
```

Now during a drag:
- Only the dragged card re-renders (to become `opacity: 0`)
- Only the column being dragged OVER re-renders (to show highlight)
- All other cards and columns skip their render cycle ✅

For very large boards (100+ cards), I'd also virtualise each column's card list — only render visible cards using `react-virtuoso` with a fixed container height per column.

---

## ─────────────────────────────────────
## PHASE 11 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

User drags a card to an empty column. What's the drop target?

---

**Candidate:**

An empty column has no cards — there's nothing for the `closestCenter` collision algorithm to find. Without special handling, the drop is never registered.

Fix: every column has a minimum droppable area regardless of its card count:

```javascript
function ColumnDropArea({ columnId, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 80,   // ← always has a drop target surface even when empty
        padding: "8px 0",
        background: isOver ? "rgba(99,102,241,0.1)" : "transparent"
      }}
    >
      {children}
      {/* Show a visual hint when empty */}
      {children.length === 0 && (
        <div className="empty-column-hint">
          {isOver ? "Drop here" : "No cards"}
        </div>
      )}
    </div>
  );
}
```

---

**Interviewer:**

User is offline and moves a card. What happens?

---

**Candidate:**

The optimistic update already happened — the card is visually in its new position. The API call fails with a network error.

Without special handling: the catch block rolls back the card to its previous position. The user sees the card snap back and gets "Failed to move card" toast.

For better offline UX, I'd queue the failed operations and retry on reconnect:

```javascript
const offlineQueue = useRef([]);

// In catch block:
catch {
  if (!navigator.onLine) {
    // Don't rollback — queue for retry when online
    offlineQueue.current.push({ type: "MOVE_CARD", cardId, columnId, order });
    // Show subtle "offline" banner instead of error toast
    setConnectionStatus("offline");
  } else {
    // Online but server error — rollback
    setBoard(boardSnapshot.current);
    showToast("Failed to move card.");
  }
}

// On reconnect:
window.addEventListener("online", async () => {
  setConnectionStatus("online");
  const queue = [...offlineQueue.current];
  offlineQueue.current = [];
  for (const op of queue) {
    await executeOperation(op);
  }
});
```

---

## ─────────────────────────────────────
## PHASE 12 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

Three most important technical decisions. Go.

---

**Candidate:**

**1. Fractional indexing for card and column order.**
Every insert is O(1) — one database write, regardless of how many items exist in the list. Integer positions cause O(n) updates on every insertion. This scales correctly as boards grow and is the same technique used by Notion, Linear, and Figma for their list ordering.

**2. @dnd-kit over native HTML5 DnD API.**
The native API doesn't fire on mobile touch devices. Since mobile support was required, a library using the Pointer Events API is mandatory. @dnd-kit also provides a `DragOverlay` for custom ghost rendering, keyboard accessibility, and auto-scroll — all non-trivial to implement manually.

**3. Snapshot before drag → optimistic update → rollback on failure.**
The board state snapshot taken on `onDragStart` is the safety net. The optimistic update makes the card move feel instant. On API failure, the snapshot restores the exact pre-drag state without any risk of partial corruption.

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

1. **Undo/redo** — a history stack of board state snapshots. Cmd+Z restores the previous state. Cmd+Shift+Z re-applies. Cap the stack at 50 entries to manage memory.

2. **Card search / filter** — a search bar above the board that highlights matching cards across all columns and dims non-matching ones. Client-side filtering with `useMemo`.

3. **Card count badge per column** — already in the UI sketch, but also a "WIP limit" (Work In Progress) — warn when a column exceeds N cards (Kanban methodology). Visual indicator changes colour.

4. **Swimlanes** — a second dimension of grouping (e.g. by assignee). Each swimlane row shows all columns. Significantly more complex data model.

5. **Keyboard-first navigation** — Tab to navigate cards, Enter to open detail, arrow keys to move between cards, Shift+M to move card to another column. @dnd-kit has built-in keyboard drag support as a starting point.

---

**Interviewer:**

Excellent — the fractional indexing and snapshot rollback were particularly strong.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked about mobile support upfront (signals HTML5 DnD limitation awareness)
✅  Asked about column reordering as a separate scope question
✅  Fractional indexing explained with math (not just named)
✅  O(1) vs O(n) comparison made explicit
✅  Rebalancing strategy mentioned for floating-point precision limit
✅  computeNewOrder handles insert-at-top, insert-at-bottom, insert-between
✅  @dnd-kit justified with mobile + custom overlay + accessibility reasons
✅  onDragStart snapshot → optimistic → rollback pattern complete
✅  moveCardInState is a pure function (no mutation)
✅  Column deletion confirmation dialog with card count warning
✅  Inline column rename (double-click, commit on blur/Enter, cancel on Escape)
✅  Empty column minimum height for drop target
✅  React.memo with custom comparison on Card
✅  Offline queue with reconnect retry
✅  Column reordering uses same fractional index (consistency)
```

---

## What Would Have Hurt the Score

```
❌  Integer positions without mentioning the O(n) write problem
❌  Not knowing HTML5 DnD doesn't work on mobile
❌  Using native DnD when mobile was required
❌  No snapshot before drag start (can't safely rollback)
❌  Mutating state directly in moveCardInState
❌  No confirmation before deleting a column with cards
❌  Empty column with no drop target (dropped card disappears)
❌  Not using React.memo (drag causes full re-render of 50 cards)
❌  No handling for insert-at-top (cardBefore = null case)
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Fractional indexing O(1) | "Why floating-point order, not integers?" |
| 2 | Floating-point precision limit | "You keep halving — what happens eventually?" |
| 3 | Insert-at-top/bottom sentinel | "How do you compute order at top of column?" |
| 4 | HTML5 DnD mobile limitation | "Why not native DnD API?" |
| 5 | @dnd-kit Pointer Events | "Walk me through how @dnd-kit works" |
| 6 | DragOverlay custom ghost | "How does the ghost image work?" |
| 7 | Snapshot before drag start | "Walk me through the optimistic move" |
| 8 | Pure moveCardInState function | "State update on drop" |
| 9 | Column deletion confirmation | "User deletes a column with 8 cards" |
| 10 | Inline rename (blur/Enter/Escape) | "User renames a column" |
| 11 | Empty column minimum height | "User drags to empty column" |
| 12 | React.memo custom comparison | "Board has 50 cards — drag performance?" |
