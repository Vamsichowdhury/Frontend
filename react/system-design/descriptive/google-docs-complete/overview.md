# Google Docs (Collaborative Document Editor) — Interview Overview

---

## What Problem Are We Solving?

A collaborative document editor lets multiple people edit the **same document simultaneously** — changes appear on everyone's screen in real time, without conflicts, without losing anyone's work.

```
Alice types "Hello "       Bob types "World" at the same position
         ↓                              ↓
         ├──── both edits reach server ──┤
                        ↓
            Document converges to: "Hello World"
            Alice sees it.  Bob sees it.  Same result. ✅
```

This sounds simple. It is not. This is one of the hardest problems in distributed systems.

---

## What Makes This Problem Hard

```
EASY version (one editor at a time):
   User edits → save → done.

HARD version (simultaneous editors):
   Alice deletes character at position 5.
   Bob inserts "X" at position 5.
   Both changes happen at the same millisecond.
   What is the correct final document?
   Who wins? Do both win? How?
```

This is the **concurrency conflict problem**. The document must:
- Converge to the **exact same state** on every client
- Preserve the **intent** of both edits
- Never **lose data** silently

---

## The Conflict Problem — Concrete Example

```
Starting document: "Hello World"
                    0123456789...

Alice's view:    "Hello World"
Bob's view:      "Hello World"

Alice deletes 'W' at index 6:
  Operation A: DELETE(position=6)
  Alice's local view: "Hello orld"

Simultaneously, Bob inserts '!' at index 11 (after 'd'):
  Operation B: INSERT(position=11, char='!')
  Bob's local view: "Hello World!"

Now they exchange operations:

Alice receives Bob's INSERT(position=11, char='!')
  But Alice already deleted 'W', so her doc is "Hello orld"
  Applying INSERT(11) on "Hello orld" inserts at position 11
  But "Hello orld" only has 10 chars — position 11 is OUT OF BOUNDS! ❌

Result without transformation: CRASH or WRONG document.
Result with OT: INSERT position adjusted to 10 (accounting for the delete)
Final document: "Hello orld!" — same on both clients ✅
```

---

## Two Solutions: OT vs CRDT

```
┌─────────────────────────────────────────────────────────────────┐
│              OPERATIONAL TRANSFORMATION (OT)                    │
├─────────────────────────────────────────────────────────────────┤
│  Each change is an "operation": INSERT(pos, char) or DELETE(pos)│
│  When two concurrent ops exist, TRANSFORM them against each     │
│  other so both can be applied in any order and reach same result│
│                                                                 │
│  Op A: DELETE(6)         Op B: INSERT(11, '!')                 │
│  Transform B against A → INSERT(10, '!') (shift left by 1)    │
│                                                                 │
│  Used by: Google Docs, CKEditor, Etherpad                      │
│  Pros: Well-studied, efficient wire format (small ops)          │
│  Cons: Extremely hard to implement correctly (edge cases ∞)     │
│        Server must be the authority (centralised)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            CONFLICT-FREE REPLICATED DATA TYPE (CRDT)            │
├─────────────────────────────────────────────────────────────────┤
│  Each character gets a globally unique ID (not a position)      │
│  Order is determined by ID comparisons, not array indices       │
│  Deletions are "tombstones" — marked deleted, not removed       │
│  Merge is always deterministic regardless of operation order    │
│                                                                 │
│  "Hello World" in CRDT:                                        │
│  [H:a1, e:a2, l:a3, l:a4, o:a5, ' ':a6,                       │
│   W:b1, o:b2, r:b3, l:b4, d:b5]                               │
│  (a = Alice's IDs, b = Bob's IDs)                              │
│                                                                 │
│  Delete 'W': mark b1 as TOMBSTONE (don't remove from array)    │
│  Insert '!': give it ID b6, anchor it after b5                 │
│  Merge is automatic — no transformation needed                  │
│                                                                 │
│  Used by: Figma, Notion, Linear, Obsidian                      │
│  Library: Yjs (production-grade CRDT, 2024 standard)           │
│  Pros: Decentralised (no server authority), offline-first       │
│  Cons: More memory (tombstones), larger wire format             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       ALICE'S BROWSER                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     React App                             │  │
│  │                                                           │  │
│  │  ┌──────────────┐    ┌──────────────────────────────┐    │  │
│  │  │   Sidebar    │    │       Editor Area            │    │  │
│  │  │  (doc list)  │    │                              │    │  │
│  │  └──────────────┘    │  ┌────────────────────────┐  │    │  │
│  │                      │  │  Toolbar (Bold/Italic)  │  │    │  │
│  │                      │  └────────────────────────┘  │    │  │
│  │                      │  ┌────────────────────────┐  │    │  │
│  │                      │  │  CollaboratorBar        │  │    │  │
│  │                      │  │  [A] [B] [C] Share btn  │  │    │  │
│  │                      │  └────────────────────────┘  │    │  │
│  │                      │  ┌────────────────────────┐  │    │  │
│  │                      │  │  EditorCanvas           │  │    │  │
│  │                      │  │  (TipTap / ProseMirror) │  │    │  │
│  │                      │  │  "Hello |World"         │  │    │  │
│  │                      │  │       ^ Bob's cursor    │  │    │  │
│  │                      │  └────────────────────────┘  │    │  │
│  │                      │  ┌────────────────────────┐  │    │  │
│  │                      │  │  AutoSave ("Saving...") │  │    │  │
│  │                      │  └────────────────────────┘  │    │  │
│  │                      └──────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ WebSocket (wss://)
                               │ Yjs sync protocol
                    ┌──────────▼──────────┐
                    │   Collaboration     │
                    │     Server          │
                    │  (y-websocket or    │
                    │   Hocuspocus)       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   BOB'S BROWSER     │
                    │  (same doc, synced) │
                    └─────────────────────┘
```

---

## Component Hierarchy

```
<DocumentEditor docId={id} />
│
├── <DocumentHeader />
│     ├── Document title (editable inline)
│     ├── <AutoSaveStatus />   ("Saving..." | "All changes saved" | "Offline")
│     └── <ShareButton />
│
├── <CollaboratorBar />
│     └── <UserAvatar /> × N   (one per active editor)
│           ├── Avatar image
│           ├── Name tooltip on hover
│           └── Colored ring matching their cursor color
│
├── <Toolbar />
│     ├── Bold, Italic, Underline, Strikethrough
│     ├── Heading levels (H1, H2, H3)
│     ├── Lists (bullet, numbered)
│     ├── Link, Image
│     └── Comment button
│
├── <EditorCanvas />
│     ├── Rich text content (managed by ProseMirror/TipTap)
│     └── <RemoteCursor /> × N  (one per other editor)
│           ├── Blinking cursor line (colored per user)
│           └── User name label above cursor
│
└── <VersionHistoryPanel />  (right side, toggleable)
      └── <VersionEntry /> × N
```

---

## Document Operation Format (Yjs Delta)

```javascript
// Yjs uses a Y.Text type for collaborative text
// Changes are expressed as deltas (same as Quill.js format)

// Insert "Hello " at position 0:
{ retain: 0, insert: "Hello " }

// Bold "Hello":
{ retain: 0, retain: 5, attributes: { bold: true } }

// Delete 3 characters at position 6:
{ retain: 6, delete: 3 }

// A delta always describes: keep N chars | insert X | delete N
```

---

## Cursor Presence Data Structure

```javascript
// Each user's cursor state, broadcast via WebSocket
{
  userId: "user_alice",
  displayName: "Alice Johnson",
  color: "#6366f1",    // unique per user, shown on cursor and avatar ring
  cursor: {
    anchor: 42,        // start of selection (or caret position)
    head: 42           // end of selection (same as anchor if no selection)
  },
  updatedAt: 1699000000000
}

// If Alice selected from position 10 to 20:
{
  cursor: { anchor: 10, head: 20 }
}
```

---

## WebSocket Event Types

```
Client → Server:
  doc:update      { docId, update: Uint8Array }   ← Yjs encoded update
  cursor:update   { docId, cursor: { anchor, head }, color }
  user:join       { docId }
  user:leave      { docId }

Server → Client:
  doc:update      { update: Uint8Array }           ← remote user's changes
  cursor:update   { userId, cursor, color, name }  ← remote cursor moved
  user:joined     { userId, name, color }           ← someone opened doc
  user:left       { userId }                        ← someone closed doc
  doc:snapshot    { state: Uint8Array }             ← initial full doc state
```

---

## Auto-Save Flow

```
User types a character
        │
        ▼
Editor change event fires
        │
        ▼
Debounce timer resets (2 seconds)
        │
        ├──── timer still running ────▶ user keeps typing
        │
        └──── 2 seconds of silence ──▶
                    │
                    ▼
             setAutoSaveStatus("saving")
                    │
                    ▼
             PATCH /api/docs/:id
             { content: editor.getHTML() }
                    │
             ┌──────┴──────┐
             │             │
           200 OK        Error
             │             │
             ▼             ▼
      setStatus("saved")  setStatus("error")
      "All changes saved"  "Failed to save"
```

---

## Undo/Redo in a Collaborative Document

```
NAIVE approach (shared undo stack):
   Alice types "Hello" → on undo stack: [insert "Hello"]
   Bob types "World"  → on undo stack: [insert "Hello", insert "World"]
   Alice presses Cmd+Z → undoes Bob's "World"? ❌ Wrong!

CORRECT approach (per-user undo stack):
   Alice's stack:  [insert "Hello"]
   Bob's stack:    [insert "World"]
   Alice Cmd+Z   → undoes Alice's last action only ✅
   Bob's text stays untouched ✅

Yjs implements this correctly out of the box.
Each Y.UndoManager tracks operations by user.
```

---

## Version History

```
Two approaches:

1. SNAPSHOT model:
   Every N minutes or N operations, save full document snapshot.
   Restore = load a past snapshot.
   Simple. Expensive on storage. Coarse-grained.

2. OPERATION LOG model:
   Store every individual operation.
   Restore = replay operations from the beginning.
   Fine-grained (restore to any moment in time).
   Expensive on replay for old docs.

Google Docs uses a hybrid:
   Periodic snapshots + operation log since last snapshot.
   Restore = load nearest snapshot + replay ops since then.
```

---

## Rich Text Editor Libraries

```
┌──────────────────────────────────────────────────────────────────┐
│              EDITOR LIBRARY COMPARISON                           │
├──────────────────┬───────────────────────────────────────────────┤
│ ProseMirror      │ The foundation. Low-level, full control.       │
│                  │ Google Docs, Atlassian, NYT use it.            │
│                  │ Very complex to use directly.                  │
├──────────────────┼───────────────────────────────────────────────┤
│ TipTap           │ Built on ProseMirror. React-friendly.          │
│                  │ Has built-in Yjs collaboration extension.      │
│                  │ Recommended for most projects in 2024.         │
├──────────────────┼───────────────────────────────────────────────┤
│ Slate.js         │ React-native. Highly customizable.             │
│                  │ Yjs integration available but manual.          │
│                  │ Good if you need full control.                 │
├──────────────────┼───────────────────────────────────────────────┤
│ Quill.js         │ Older. Easy to start. Delta format.            │
│                  │ Yjs integration exists.                        │
│                  │ Less maintained now.                           │
├──────────────────┼───────────────────────────────────────────────┤
│ contenteditable  │ Raw browser API. Don't use for prod.           │
│                  │ Cross-browser inconsistencies.                 │
│                  │ No undo/redo, no rich text abstractions.       │
└──────────────────┴───────────────────────────────────────────────┘
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|---------------|
| The conflict problem | Why naive "last write wins" destroys documents |
| Operational Transformation | The theory behind Google Docs |
| CRDT / Yjs | The modern practical alternative |
| Document delta format | How changes are represented as operations |
| Remote cursor presence | Showing where other users are editing |
| Auto-save debounce | Don't save on every keystroke |
| Per-user undo stack | Collaborative undo without undoing others' work |
| Version history models | Snapshot vs operation log |
| Rich text editor choice | ProseMirror vs TipTap vs Slate.js |
| Offline editing | Work without connection, sync on reconnect |

---

## Interview Evaluation Criteria

```
Level          What They Want to See
────────────────────────────────────────────────────────────────
Junior     →   Knows this is hard. Mentions real-time sync.
               Knows WebSocket is needed.
Mid-level  →   Explains conflict problem clearly.
               Knows OT or CRDT by name.
               Can describe auto-save and cursor presence.
Senior     →   Deep on OT vs CRDT tradeoffs.
               Recommends Yjs for practical implementation.
               Covers offline, undo/redo, version history.
               Knows ProseMirror / TipTap ecosystem.
Staff      →   System-level: how to scale to millions of docs,
               operational log storage, CRDT convergence proofs,
               access control architecture.
```
