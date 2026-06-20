# Kanban Board - System Design Overview

**Level:** Medium  
**Time to Solve:** 50-65 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build a Kanban board (Trello/Jira style):
- Multiple columns (Todo, In Progress, Done)
- Cards within each column
- Drag and drop cards between columns
- Drag and drop to reorder within a column
- Add/edit/delete cards
- Add/rename/delete columns
- Card detail modal (description, labels, due date)

---

## Real-World Examples

- Trello
- Jira board view
- Linear board view
- GitHub Projects
- Notion board

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Drag and drop | Core feature — complex interaction |
| Nested data management | Columns → cards hierarchy |
| Optimistic reorder | Card moves feel instant |
| Modal for card detail | Portal + form management |
| Flexible data model | Columns are dynamic, not hardcoded |

---

## What You'll Learn

- HTML5 Drag and Drop API (or react-dnd / @dnd-kit)
- Data structure for ordered lists of lists
- How to reorder items without mutating state
- Drop zone detection and visual feedback
- Optimistic reorder before API confirm
- Column management (add/rename/delete)
- Card detail with rich editing

---

## High-Level Architecture

```
<KanbanBoard />
├── <BoardHeader />     (board title, add column button)
└── <ColumnsContainer /> (horizontal scroll)
    └── <Column /> × N
        ├── <ColumnHeader />  (title, card count, options menu)
        ├── <CardList />      (drop zone)
        │   └── <Card /> × N
        │       ├── Title, labels, assignee, due date
        │       └── Drag handle
        └── <AddCardInput />  (inline add at bottom)
```

---

## Data Structure

```javascript
// Board data
{
  id: "board_1",
  title: "Product Roadmap",
  columns: [
    {
      id: "col_todo",
      title: "To Do",
      cards: [
        {
          id: "card_1",
          title: "Design login page",
          description: "...",
          labels: ["Design", "High Priority"],
          assignee: { id: "user_1", avatar: "..." },
          dueDate: "2024-01-20",
          order: 0
        }
      ]
    }
  ]
}

// State
const [columns, setColumns] = useState([]);
const [dragging, setDragging] = useState(null);
const [dragOverColumn, setDragOverColumn] = useState(null);
```

---

## Data Flow

```
User drags a card:
  → onDragStart: record dragged card + source column
  → set dragging state (visual feedback on card)

User drags over a column:
  → onDragEnter: setDragOverColumn(columnId)
  → highlight the column as drop target

User drops card:
  → onDrop: remove card from source column
  → insert card at drop position in target column
  → clear dragging state

State update on drop:
  → new columns array with card moved
  → POST /api/cards/:id/move { columnId, position }
  → optimistic — UI already updated before API responds

User adds a card:
  → click "Add card" at bottom of column
  → inline input appears
  → on Enter: create card, add to top/bottom of column
  → blur: cancel if empty

User edits a card:
  → click card → open CardDetailModal
  → edit title, description, labels, assignee
  → auto-save on change (debounced)
```

---

## Key Concepts to Learn

### 1. Drag and Drop (HTML5 API)
```javascript
// On card: draggable
const onDragStart = (e, card, sourceColumnId) => {
  e.dataTransfer.setData("cardId", card.id);
  e.dataTransfer.setData("sourceColumnId", sourceColumnId);
  setDragging(card.id);
};

// On column drop zone
const onDrop = (e, targetColumnId) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData("cardId");
  const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
  moveCard(cardId, sourceColumnId, targetColumnId);
  setDragging(null);
  setDragOverColumn(null);
};

const onDragOver = (e) => e.preventDefault(); // required to allow drop
```

### 2. Move Card State Update
```javascript
const moveCard = (cardId, fromColId, toColId, toIndex = null) => {
  setColumns(prev => {
    const next = prev.map(col => ({ ...col, cards: [...col.cards] }));
    const fromCol = next.find(c => c.id === fromColId);
    const toCol = next.find(c => c.id === toColId);
    const cardIndex = fromCol.cards.findIndex(c => c.id === cardId);
    const [card] = fromCol.cards.splice(cardIndex, 1);
    if (toIndex !== null) {
      toCol.cards.splice(toIndex, 0, card);
    } else {
      toCol.cards.push(card);
    }
    return next;
  });
};
```

### 3. Library Alternative (@dnd-kit)
```
HTML5 DnD has limitations:
  - No mobile touch support
  - Limited drag preview customization
  - No smooth animations

@dnd-kit is the modern choice:
  - Touch support (mobile)
  - Smooth animations
  - Accessible (keyboard drag)
  - Used by: Linear, Vercel
```

### 4. Column Reordering
```javascript
// Same drag-drop logic but for columns instead of cards
// Columns are draggable too
// onDrop between columns: reorder columns array
```

---

## Implementation Phases

### Phase 1 — Static Board
- Columns layout (horizontal)
- Cards in each column

### Phase 2 — Card CRUD
- Add card (inline input)
- Edit card title
- Delete card

### Phase 3 — Drag & Drop
- Drag between columns
- Visual feedback (ghost card, highlighted drop zone)
- State update on drop

### Phase 4 — Card Detail Modal
- Click card to open modal
- Edit description, labels, assignee, due date
- Auto-save changes

### Phase 5 — Column Management
- Add column
- Rename column
- Delete column (with cards)
- Reorder columns

---

## Performance Considerations

- `React.memo` on Card (many cards, should not re-render on unrelated state)
- Only update affected columns on card move
- Debounce auto-save in card detail modal
- Virtual scroll if columns have 100+ cards

---

## Edge Cases

| Edge Case | How to Handle |
|-----------|--------------|
| Drop on same position | No-op, no API call |
| Delete column with cards | Confirm dialog: "Move to... or delete all?" |
| Card title empty | Prevent save, show validation |
| Drag on mobile | HTML5 DnD doesn't work on mobile; use @dnd-kit |
| Very long card title | CSS truncation with title tooltip |
