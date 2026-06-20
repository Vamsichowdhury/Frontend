# Kanban Board — Interview Overview

---

## What Problem Are We Solving?

Build a visual task management board where work items (cards) move across status columns. Users drag cards between columns to represent progress, reorganise within columns, and manage card details.

```
┌─────────────────────────────────────────────────────────────────┐
│  🗂 Project Board            + Add Column                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  TO DO  (3) │  │ IN PROGRESS │  │   DONE  (5) │            │
│  │             │  │    (2)      │  │             │            │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │            │
│  │ │Design   │ │  │ │Auth     │ │  │ │Setup    │ │            │
│  │ │login    │ │  │ │module   │ │  │ │project  │ │            │
│  │ │🔴 High  │ │  │ │🟡 Med   │ │  │ │✅       │ │            │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │            │
│  │             │  │             │  │             │            │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │            │
│  │ │Write    │ │  │ │Database │ │  │ │CI/CD    │ │            │
│  │ │tests    │ │  │ │schema   │ │  │ │pipeline │ │            │
│  │ │🟡 Med   │ │  │ │🔴 High  │ │  │ │✅       │ │            │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │            │
│  │             │  │             │  │             │            │
│  │ + Add card  │  │ + Add card  │  │ + Add card  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

Used in: Trello, Jira (board view), Linear, GitHub Projects, Notion, Asana

---

## What Makes a Kanban Board Hard to Build

```
1. Drag and drop — the central interaction
   HTML5 DnD API works on desktop but NOT on mobile touch
   Need to handle ghost image, drop zone highlight, placeholder
   Drag between columns AND reorder within columns
   Library choice matters: @dnd-kit vs react-beautiful-dnd vs HTML5 native

2. Ordering data model — the subtle hard problem
   Cards and columns have an explicit order
   Naive integer positions (1, 2, 3) require updating all
   subsequent cards on every insert → expensive

   Fractional indexing: insert between A(1.0) and B(2.0)
   by assigning 1.5 — only ONE record updated
   Can run out of precision eventually → need periodic rebalancing

3. Optimistic reorder
   Card moves immediately on drop (instant UX)
   API sync happens in background
   On failure: rollback to pre-drag state
   Must save snapshot before drag starts

4. Drop target detection within a column
   Not just "which column" but "between which two cards"
   Need to compute insertion position from cursor Y coordinate

5. Column reordering
   Columns themselves are draggable
   Same ordering data model problem applies to columns
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  Fixed vs custom columns? Collab?        │
│  2. Architecture    →  Data model, state shape                 │
│  3. Ordering model  →  THE first hard problem:                 │
│                         integer positions vs fractional index   │
│  4. Drag and drop   →  HTML5 DnD API mechanics                 │
│  5. Library choice  →  Why @dnd-kit over native DnD            │
│  6. Visual feedback →  Ghost, placeholder, drop zone highlight │
│  7. Optimistic move →  Snapshot → move → API → rollback        │
│  8. Card detail     →  Modal, inline edit, labels, assignee    │
│  9. Column mgmt     →  Add, rename, delete columns             │
│  10. Performance    →  Large boards, React.memo                │
│  11. Edge cases     →  Last card, delete with cards, offline   │
│  12. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                                                                  │
│  On mount:                                                       │
│    GET /api/boards/:boardId   → full board (columns + cards)     │
│                                                                  │
│  On card move (drag end):                                        │
│    PATCH /api/cards/:cardId   → { columnId, order }             │
│                                                                  │
│  On card create:                                                 │
│    POST /api/cards            → { columnId, title, order }      │
│                                                                  │
│  On column create:                                               │
│    POST /api/columns          → { boardId, title, order }       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                        │
           ┌────────────▼─────────────────┐
           │        BACKEND               │
           │  - Board service             │
           │  - Card CRUD                 │
           │  - Column CRUD               │
           │  - WebSocket (if collab)     │
           └──────────────────────────────┘
```

---

## Component Hierarchy

```
<KanbanBoard boardId={id}>
│
├── <BoardHeader>
│     ├── Board title (editable inline)
│     └── <AddColumnButton>
│
└── <ColumnsContainer>     (horizontal scroll if many columns)
      └── <Column> × N
            ├── <ColumnHeader>
            │     ├── Title (double-click to rename)
            │     ├── Card count badge
            │     └── <ColumnMenu> (rename, delete, ··· )
            │
            ├── <DroppableArea>     ← drop zone for cards
            │     └── <Card> × N
            │           ├── Title
            │           ├── Labels (coloured pills)
            │           ├── Assignee avatar
            │           ├── Due date (red if overdue)
            │           └── <DragHandle> ⠿
            │
            └── <AddCardInput>      (inline, at bottom of column)
```

---

## Data Model — The Foundation

```javascript
// Board
{
  id: "board_1",
  title: "Product Roadmap",
  columns: [ /* ordered array */ ]
}

// Column
{
  id: "col_todo",
  boardId: "board_1",
  title: "To Do",
  order: 1.0,        // ← fractional index
  cards: [ /* ordered array */ ]
}

// Card
{
  id: "card_1",
  columnId: "col_todo",
  title: "Design login page",
  description: "Create Figma mockups for the login flow",
  order: 1.0,           // ← fractional index within its column
  labels: ["design", "high-priority"],
  assigneeId: "user_123",
  dueDate: "2024-02-15",
  createdAt: "2024-01-15T10:00:00Z"
}
```

---

## Fractional Indexing — The Key Insight

```
PROBLEM with integer positions:

  Column "To Do" cards:
    Card A: order=1
    Card B: order=2
    Card C: order=3

  User inserts card X between A and B:
    X needs order=2
    But B already has order=2
    → Must shift B to 3, C to 4
    → UPDATE 2 records in the database ← gets worse as list grows

  Insert at position 1:
    → Shift EVERY card by 1
    → n database updates for n cards ← O(n) writes

─────────────────────────────────────────────────────────────────

SOLUTION: Fractional indexing

  Card A: order=1.0
  Card B: order=2.0
  Card C: order=3.0

  Insert X between A and B:
    X.order = (1.0 + 2.0) / 2 = 1.5
    → Only INSERT one record
    → A, B, C unchanged ← O(1) write ✅

  Insert Y between A and X:
    Y.order = (1.0 + 1.5) / 2 = 1.25
    → Still O(1) ✅

  Insert Z between A and Y:
    Z.order = (1.0 + 1.25) / 2 = 1.125

  Can keep halving forever... but floating-point precision has limits.
  After ~52 halvings → numbers become indistinguishable.
  Solution: periodic rebalancing (assign clean integers to all cards)
  Libraries like "fractional-indexing" handle this automatically.
```

---

## Drag and Drop — Three Visual States

```
IDLE:                     DRAGGING:               DROPPED:
┌─────────┐               ┌─────────┐ ← ghost    ┌─────────┐
│ Design  │               │ Design  │   (dragged │ Design  │
│ login   │               │ login   │    image)  │ login   │
│ 🔴 High │               │ 🔴 High │            │ 🔴 High │
└─────────┘               └─────────┘            └─────────┘
                          ┌─────────┐ ← placeholder
                          │ ░░░░░░░ │   (empty box
                          │ ░░░░░░░ │    showing where
                          └─────────┘    card will land)
                          Drop zone column highlighted with
                          a coloured border
```

---

## Optimistic Move — State Snapshot Pattern

```
Before drag:
  Snapshot saved: { columns: deep copy of current state }

Drag ends (card dropped):
  1. Compute new order for drop position
  2. Update local state IMMEDIATELY (card visually moves)
  3. PATCH /api/cards/:id { columnId, order }

API succeeds:
  → Nothing extra needed (state already correct)
  → Discard snapshot

API fails:
  → Restore from snapshot: setState(snapshot)
  → Show toast: "Failed to move card. Change reverted."
  → User sees card snap back to original position
```

---

## HTML5 DnD Events Map

```
On the DRAGGABLE element (Card):
  onDragStart  → record dragged card + source column
                 set dataTransfer payload
  onDragEnd    → cleanup visual state (remove drag class)

On the DROP TARGET (Column / Card gap):
  onDragEnter  → highlight drop zone
  onDragOver   → e.preventDefault() ← REQUIRED to allow drop
                 compute insertion position from cursor Y
  onDragLeave  → remove drop zone highlight
  onDrop       → read dataTransfer, call moveCard()
                 e.preventDefault() ← prevent browser default
```

---

## @dnd-kit vs HTML5 DnD

```
HTML5 DnD API:
  ✅ No library, smaller bundle
  ✅ Works on desktop browsers
  ❌ No touch support (mobile doesn't fire drag events)
  ❌ Ghost image hard to customise (shows screenshot of element)
  ❌ No drag-to-scroll (can't drag near edge to scroll container)
  ❌ Accessibility is manual work

@dnd-kit:
  ✅ Touch support (Pointer Events API underneath)
  ✅ Full custom drag overlay (render anything as the ghost)
  ✅ Keyboard drag-and-drop accessibility built-in
  ✅ Auto-scroll on drag near edge
  ✅ Collision detection algorithms (closest centre, pointer)
  ✅ Used by Linear, Vercel, Atlassian
  ⚠️ Adds ~15KB to bundle

Verdict: Use @dnd-kit for any production kanban board.
         Use native DnD for a quick demo or if mobile is excluded.
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|----------------|
| Fractional indexing | O(1) insert vs O(n) integer reordering |
| State snapshot for rollback | Optimistic move with safe revert |
| HTML5 DnD API events | dragstart, dragover, drop mechanics |
| @dnd-kit over native DnD | Mobile touch support is the key reason |
| Drop position calculation | Cursor Y within column → insert above/below |
| Drag overlay vs ghost | Custom ghost image renders anything |
| Column as droppable | Column accepts card drops from anywhere |
| Card as droppable too | Enables insert between cards |
| Inline add card input | Appears at column bottom, auto-focus |
| Recursive delete guard | Deleting column with cards needs confirmation |
| Column reordering | Same fractional index applies to columns |
| React.memo on Card | Re-renders only the moved card |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Knows drag-and-drop is needed.
              Basic CRUD for columns and cards.
Mid-level →   HTML5 DnD API mechanics.
              Optimistic updates with snapshot rollback.
              Integer position ordering.
Senior    →   Fractional indexing (O(1) vs O(n) reasoning).
              @dnd-kit over native DnD (mobile + accessibility).
              Drop position calculation from cursor Y.
              Column reordering as the same problem.
Staff     →   Real-time collaborative Kanban (WebSocket + CRDT).
              Undo/redo history stack.
              Board-level permission model.
              Conflict resolution on concurrent card moves.
```
