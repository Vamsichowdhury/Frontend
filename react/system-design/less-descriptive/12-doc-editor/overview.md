# Collaborative Document Editor - System Design Overview

**Level:** Hard  
**Time to Solve:** 70-90 minutes  
**Tech Stack:** React + WebSocket  

---

## Problem Statement

Build a real-time collaborative document editor (Google Docs style) where:
- Multiple users can edit the same document simultaneously
- Changes appear in real-time for all editors
- Cursor positions of other users are visible
- Undo/Redo works correctly (even with others editing)
- Conflict resolution handles simultaneous edits
- Version history is maintained
- Document is auto-saved

---

## Real-World Examples

- Google Docs
- Notion
- Figma (properties/comments)
- Office 365 Word Online
- Confluence

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Operational Transformation/CRDT | Core collaborative editing concept |
| Real-time sync via WebSocket | Receiving and applying remote changes |
| Undo/Redo in collaborative context | Complex state history management |
| Conflict resolution | Two users edit same spot simultaneously |
| Cursor position sync | Show where others are typing |
| Auto-save debouncing | Don't save on every keystroke |

---

## What You'll Learn

- Operational Transformation (OT) concept — the theory behind Google Docs
- CRDT (Conflict-free Replicated Data Type) as an alternative
- Why collaborative editing is HARD (the conflict problem)
- Real-time presence (cursors, selections, online users)
- Undo stack in a shared document environment
- Debounced auto-save
- Rich text basics with `contenteditable` or `draft-js`

---

## The Core Problem: Conflict Resolution

```
Document: "Hello World"

User A: deletes "World" → "Hello "
User B: replaces "Hello" with "Hi" → "Hi World"

If we just apply both: "Hi " (wrong!)

Correct result should be: "Hi " or "Hello " (depends on strategy)
The document must converge to the SAME state for all users.
```

---

## High-Level Architecture

```
<EditorApp />
├── <Toolbar />             (Bold, Italic, Headings, Lists)
├── <EditorCanvas />
│   ├── <ContentEditable /> or <DraftJsEditor />
│   ├── <RemoteCursors />   (other users' cursor positions)
│   └── <SelectionHighlight /> (other users' selections)
├── <CollaboratorsBar />    (avatars of online users)
└── <AutoSaveIndicator />   (Saving... / Saved)
```

---

## Data Structure

```javascript
// Document state
{
  id: "doc_abc123",
  title: "My Document",
  content: "Hello World",    // plain text or rich text (delta format)
  version: 42,               // increment on each change
  updatedAt: 1699000000000
}

// Operation (OT approach)
{
  type: "insert" | "delete" | "retain",
  position: 6,
  text: "beautiful ",        // for insert
  length: 5,                 // for delete
  version: 42                // which version this was applied to
}

// Presence (cursor position per user)
{
  userId: "user_123",
  cursorPosition: 15,
  selectionStart: 10,
  selectionEnd: 20,
  color: "#FF5733",
  name: "Alice"
}
```

---

## Data Flow

```
User A opens document:
  → fetch document from server (version 42)
  → open WebSocket connection
  → server broadcasts user A's presence

User A types "beautiful " at position 6:
  → create operation: insert("beautiful ", position=6)
  → apply LOCALLY IMMEDIATELY (for responsiveness)
  → increment local version
  → send operation via WebSocket to server

Server receives A's operation:
  → validate and store operation
  → broadcast to all OTHER clients in same document

User B receives A's operation:
  → if B hasn't edited: apply directly
  → if B has edited concurrently: TRANSFORM against B's operation first (OT)
  → apply transformed operation to B's document

Result: Both A and B see identical document
```

---

## Key Concepts to Learn

### 1. Operational Transformation (Simplified)
```javascript
// The core idea: transform operations against each other
function transform(opA, opB) {
  // opA: insert "hello" at position 5
  // opB: insert "world" at position 3 (concurrent)

  // Since opB is at position 3 (before 5),
  // opA's position must shift by length of opB's text
  if (opB.type === "insert" && opB.position < opA.position) {
    return { ...opA, position: opA.position + opB.text.length };
  }
  return opA;
}
```

### 2. CRDT as Alternative
```
CRDT (Conflict-free Replicated Data Type):
- Each character gets a globally unique ID
- Deletes mark characters as "tombstoned" (not removed)
- Merge is always deterministic regardless of order
- Used by: Figma, Notion, Automerge, Yjs library

Simpler to implement than OT for basic cases
```

### 3. Auto-save with Debounce
```javascript
const debouncedSave = useCallback(
  debounce(async (content) => {
    setAutoSaveStatus("saving");
    await fetch(`/api/docs/${docId}`, {
      method: "PATCH",
      body: JSON.stringify({ content })
    });
    setAutoSaveStatus("saved");
  }, 2000), // Save 2 seconds after last change
  [docId]
);

useEffect(() => {
  debouncedSave(content);
}, [content]);
```

### 4. Remote Cursors
```javascript
// Receive cursor updates from server
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "CURSOR_UPDATE") {
    setRemoteCursors(prev => ({
      ...prev,
      [data.userId]: {
        position: data.position,
        color: data.color,
        name: data.userName
      }
    }));
  }
};

// Send own cursor position on selection change
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  ws.send(JSON.stringify({
    type: "CURSOR_UPDATE",
    position: getCaretPosition(editorRef.current)
  }));
});
```

---

## Implementation Phases

### Phase 1 — Static Editor
- contenteditable div or draft-js
- Toolbar with basic formatting

### Phase 2 — WebSocket Connection
- Connect to document room
- Send local changes via WS
- Receive and apply remote changes

### Phase 3 — Conflict Resolution (Conceptual)
- Explain OT or CRDT
- Demonstrate with example
- Let interviewer guide depth

### Phase 4 — Presence
- Show online collaborators (avatars)
- Remote cursor positions
- Remote text selections

### Phase 5 — Auto-save + History
- Debounced auto-save
- Version history list
- Restore to previous version

---

## Practical Note for Interview

In a real interview, you won't implement full OT from scratch. Instead:
- **Explain the problem clearly** (concurrent edits conflict)
- **Name the solutions** (OT, CRDT)
- **Describe the approach** at a high level
- **Mention libraries** (Yjs, Automerge, ShareDB)
- **Focus your code time** on the WebSocket integration and auto-save

---

## Production Libraries to Know

| Library | What it does |
|---------|-------------|
| **Yjs** | CRDT-based real-time sync |
| **Automerge** | CRDT for JSON documents |
| **ShareDB** | OT-based real-time backend |
| **Quill.js** | Rich text editor with delta format |
| **Slate.js** | Customizable rich text framework |
| **TipTap** | Modern editor (built on ProseMirror) |

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| Just mentions WebSocket | Explains conflict problem + OT/CRDT |
| No cursor sync | Implements presence/cursor positions |
| No auto-save | Debounced auto-save with status indicator |
| No undo/redo discussion | Discusses undo stack complexity in collab context |
| Doesn't know libraries | Mentions Yjs, Automerge, ShareDB |
