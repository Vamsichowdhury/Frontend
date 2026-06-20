# Collaborative Document Editor — Interview Transcript

**Level:** Hard | **Duration:** 70-90 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | The Conflict Problem | ⏹️ |
| 3 | Architecture & Real-time Sync | ⏹️ |
| 4 | Presence & Cursors | ⏹️ |
| 5 | Auto-save, Undo & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a collaborative document editor like Google Docs. Where do you start?"

**What candidate should ask:**
- [ ] How many concurrent editors per document?
- [ ] Is rich text (bold, italic) needed or plain text?
- [ ] Should we show other users' cursors?
- [ ] Is offline editing required?
- [ ] Version history needed?
- [ ] What scale? (1 doc or millions?)

**Interviewer answers:**
> "Up to 10 concurrent editors. Rich text yes. Show cursors yes. No offline for now. Version history as bonus. Assume medium scale."

**Candidate response:** *(write your response here)*

---

# Phase 2 — The Conflict Problem (Critical)

**Interviewer:**
> "Two users type simultaneously in the same document. How does that work?"

**Expected — explain the conflict clearly:**
```
Document: "Hello World"

User A deletes "World" at position 6-10
User B inserts "Beautiful " at position 6

If applied naively:
  A's op: "Hello "
  B's op on original: "Hello Beautiful World"
  Apply A then B on A's result: "Hello Beautiful " (wrong position!)

Both users must end up with IDENTICAL document.
This is the hard problem.
```

**Expected solutions:**
```
1. Operational Transformation (OT):
   - Transform operations against each other before applying
   - Used by: Google Docs, Etherpad
   - Complex to implement correctly

2. CRDT (Conflict-free Replicated Data Type):
   - Each character gets a unique global ID
   - Merge is always deterministic regardless of order
   - Used by: Figma, Notion, Linear
   - Libraries: Yjs, Automerge

For this interview: explain the concept, propose CRDT + Yjs
```

**Interviewer pushback:**
> "Without using a library, how would you approach it?"

**Expected honest answer:** Implementing OT correctly from scratch is notoriously difficult — Google engineers spent years on it. In a real product, use Yjs or ShareDB. But conceptually: version each operation, transform new operations against concurrent ones.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Architecture & Real-time Sync

**Interviewer:**
> "How does the real-time sync flow work end to end?"

**Expected flow:**
```
User A types "hello":
  → contenteditable fires input event
  → create operation: insert("hello", position=5)
  → apply LOCALLY first (instant feedback)
  → send via WebSocket to server
  → server broadcasts to all other editors
  → User B receives op
  → transform against any concurrent ops
  → apply to B's document
  → both documents now identical
```

**Expected component architecture:**
```
<Editor>
├── <Toolbar>          (bold, italic, headings)
├── <ContentEditable>  (or Draft.js / Slate.js / TipTap)
├── <RemoteCursors>    (other users' cursor overlays)
└── <CollaboratorsBar> (online user avatars)
```

**Interviewer pushback:**
> "Why not just sync the full document content on every keystroke?"

**Expected:** Expensive bandwidth, slow for large documents, no way to resolve conflicts if two users type simultaneously. Operations (diffs) are small and can be merged.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Presence & Cursors

**Interviewer:**
> "How do you show where other users are in the document?"

**Expected:**
```javascript
// Send own cursor position on selection change
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  ws.send(JSON.stringify({
    type: "CURSOR_UPDATE",
    position: getCaretOffset(editorRef.current),
    userId: myId
  }));
});

// Receive and display remote cursors
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "CURSOR_UPDATE") {
    setRemoteCursors(prev => ({
      ...prev,
      [data.userId]: { position: data.position, color: data.color, name: data.name }
    }));
  }
};
```

**Interviewer pushback:**
> "User closes tab — their cursor should disappear. How?"

**Expected:** WebSocket `onclose` event fires on server. Server broadcasts `USER_LEFT` event. Other clients remove that user's cursor from remoteCursors state.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Auto-save, Undo & Follow-ups

**Interviewer:**
> "How do you implement auto-save?"

**Expected:**
```javascript
const debouncedSave = useMemo(() =>
  debounce(async (content) => {
    setAutoSaveStatus("saving");
    await fetch(`/api/docs/${docId}`, { method: "PATCH", body: JSON.stringify({ content }) });
    setAutoSaveStatus("saved");
  }, 2000)
, [docId]);

useEffect(() => { debouncedSave(content); }, [content]);
```

**Interviewer:**
> "Undo in a collaborative doc — User A undoes. What happens to User B's changes?"

**Expected honest discussion:**
- Simple solution: each user has their own undo stack (only undoes their own ops)
- Problem: undoing your op that was inserted before another user's op can corrupt the doc
- Real solution (OT/CRDT): ops are transformed during undo too
- Google Docs: each user's undo is independent — you can only undo your own changes

**Interviewer final question:**
> "What production libraries would you use?"

**Expected:**
- **Yjs**: CRDT sync engine (Figma uses this pattern)
- **TipTap** or **Slate.js**: rich text editor
- **WebSocket or y-websocket**: transport layer
- **y-indexeddb**: optional offline persistence

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
