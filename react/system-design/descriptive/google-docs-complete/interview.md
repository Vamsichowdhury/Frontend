# Google Docs (Collaborative Document Editor) — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Collaborative, but will push hard on the conflict problem — that's the heart of this question

---

> **How to use this file:**
> Read it like a screenplay. The conflict problem discussion (Phase 3) is the most important part.
> If you can explain the conflict clearly and name OT and CRDT, you will stand out from most candidates.
> Every clarifying question has an annotation explaining why it's asked.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

I'd like you to design a collaborative document editor — think Google Docs. Multiple users editing the same document in real time. How would you approach the frontend design?

---

**Candidate:**

This is a rich problem — I want to make sure I'm scoping it right before designing. A few questions first.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why clarifying questions matter especially for this problem
> "Collaborative document editor" is one of the broadest prompts in frontend system design. The scope can range from a basic shared notepad (10 hours of work) to a full Google Docs replacement (years of engineering). Every question below rules out a significant chunk of complexity or rules it in.

---

**Q1. How many people can edit the same document at the same time?**

> **Why ask this:**
> The concurrent editor count changes the conflict resolution strategy.
> - *2 users*: A simple lock/turn-based model could technically work ("only one person types at a time"). Still bad UX, but possible.
> - *Up to 10 users*: Real-time collaborative editing is required. You need OT or CRDT.
> - *100+ users*: Same core algorithm but you need to think about broadcasting efficiency — one user's change needs to go to 99 others, which is a fan-out problem at scale.
>
> Also relevant for the cursor presence system — rendering 100 simultaneous cursors vs 5 is very different.

---

**Q2. Is this rich text (bold, headings, lists) or plain text?**

> **Why ask this:**
> This determines which editor library you use and how complex the operation format is.
> - *Plain text*: Simple. You can use a `<textarea>`. Operations are just INSERT(pos, char) and DELETE(pos). Much easier to implement OT or CRDT manually.
> - *Rich text*: You need a proper editor library (TipTap, Slate.js, ProseMirror). Operations become complex — a single "bold this text" operation needs to mark a range of characters with an attribute. The CRDT implementation becomes significantly harder.
>
> 90% of the time the answer will be rich text, since plain text isn't very interesting as a product.

---

**Q3. Should it work offline — can users edit without internet and sync when reconnected?**

> **Why ask this:**
> Offline support fundamentally changes the architecture. Without offline, the client is dumb — it sends changes to the server which is the single source of truth. With offline, the client must become its own source of truth, reconcile diverged histories on reconnect, and handle conflicts that happened while offline.
>
> CRDT handles this naturally. OT requires a central server to be the authority, making offline much harder.
>
> This is a senior-level concern. Asking it signals you think about real-world conditions, not just the happy path.

---

**Q4. Do we need version history — the ability to revert to an earlier state?**

> **Why ask this:**
> Version history is a separate system layered on top of the collaborative editing core. It requires either:
> - Periodic snapshots of the document (simple but coarse-grained)
> - An operation log so you can replay history to any point in time (complex but granular)
>
> If yes, the data model needs to store every change, not just the current state. That's a significant storage and architectural concern.

---

**Q5. Do we need cursor presence — seeing where other users are in the document?**

> **Why ask this:**
> Cursor presence is technically separate from document sync. The document state (the text) uses one sync channel. Cursor positions use a different, ephemeral channel — there's no point storing cursor positions in the database.
>
> Cursor position data is:
> - High frequency (updates on every character typed or mouse click)
> - Ephemeral (meaningless after the user closes the doc)
> - Not critical (losing a cursor update is fine — next one will arrive)
>
> This is a separate concern from the document sync protocol.

---

**Q6. Do we need comments and suggestions mode — like the Google Docs comment sidebar?**

> **Why ask this:**
> Comments are anchored to a specific text range. When the surrounding text gets edited, the comment's anchor position needs to update. This is another layer of the operational transformation problem — comment positions need to be transformed along with the text.
>
> Suggestions mode ("suggesting" changes that can be accepted or rejected) is even more complex — it's essentially a second layer of document state.
>
> If yes, this adds significant scope. Usually an interviewer will say "not for today".

---

**Q7. What scale are we designing for? How many documents, how many users?**

> **Why ask this:**
> Scale determines the backend architecture, but it also affects frontend decisions:
> - *Small*: One server handles all WebSocket connections. Simple.
> - *Large*: Multiple servers, which means a user's WebSocket might connect to a different server than the other editors of the same document. You need pub/sub (Redis) to route messages between servers.
>
> Also: at large scale, loading a document with millions of operations in its history requires lazy loading sections rather than loading the entire operation log upfront.

---

**Interviewer:**

Good questions. Here's the scope:

- Up to 10 concurrent editors per document.
- Yes, rich text — bold, italic, headings, lists.
- Yes, offline editing with sync on reconnect.
- Yes, version history as a bonus.
- Yes, cursor presence is required.
- No comments/suggestions for today.
- Tens of thousands of documents, hundreds of thousands of users.

---

**Candidate:**

Perfect. This is a real-time collaborative rich text editor with offline support. The most important thing to talk about first is the conflict problem — because that shapes everything else. Let me start there.

---

## ─────────────────────────────────────
## PHASE 2 — Why This Is Hard
## ─────────────────────────────────────

---

**Interviewer:**

You said the conflict problem shapes everything. What is it?

---

**Candidate:**

Let me show it with a concrete example.

```
Starting document:  "Hello World"
                     0123456789 10
```

Alice and Bob both have this document open. There's a 200ms network delay between them.

```
At t=0:
  Alice deletes the space at position 5
  Her local doc becomes: "HelloWorld"
  She sends op to server: DELETE(position=5)

Also at t=0 (simultaneous):
  Bob inserts '!' at the end — position 11
  His local doc becomes: "Hello World!"
  He sends op to server: INSERT(position=11, char='!')
```

Now the server has received both operations. It applies them one at a time. Let's say it applies Alice's DELETE first:

```
After Alice's DELETE(5):  "HelloWorld"   (10 chars now, positions shifted)
```

Now it applies Bob's INSERT(position=11, char='!'):

```
"HelloWorld" only has 10 characters (0–9).
Inserting at position 11 is OUT OF BOUNDS. 💥
```

The document is broken. Even if we don't crash, Bob inserted '!' expecting it to go after 'd' in "World" — but Alice deleted the space, so positions shifted. The '!' ends up in the wrong place.

This is the conflict problem. **Two operations that were valid on their originating client become invalid when applied to a different document state.**

---

**Interviewer:**

Naively you might say "last write wins" — just overwrite with whatever came last. Why doesn't that work?

---

**Candidate:**

Because you would destroy data silently.

```
Alice has been writing for 20 minutes.
Bob opens the doc and types one character.
Bob's change arrives at the server 1ms after Alice's last save.

"Last write wins" → Bob's state overwrites Alice's 20 minutes of work.
Alice refreshes the page → her work is gone. 💀
```

That's catastrophic. The goal is for both edits to survive and the document to converge to a state that reflects **both users' intentions**.

```
Alice's intention: remove the space between "Hello" and "World"
Bob's intention:   add '!' at the end

Correct result:    "HelloWorld!"

Both intentions preserved. No data lost. ✅
```

---

## ─────────────────────────────────────
## PHASE 3 — OT vs CRDT
## ─────────────────────────────────────

---

**Interviewer:**

So how do you actually solve it?

---

**Candidate:**

There are two well-known approaches. I'll explain both, then tell you which I'd use.

---

### Approach 1: Operational Transformation (OT)

The idea: before applying a remote operation, **transform it** to account for any local operations that happened concurrently.

Back to our example:

```
Server receives:
  Op A: DELETE(position=5)    ← from Alice
  Op B: INSERT(position=11, char='!')  ← from Bob (concurrent)

To apply B after A, transform B against A:
  A deleted 1 character at position 5.
  B's insertion position 11 is after position 5.
  Therefore B's position shifts left by 1: INSERT(position=10, char='!')

Apply transformed B to "HelloWorld":
  "HelloWorld!" at position 10 ✅
```

The transformation function for INSERT vs DELETE:

```javascript
// Transform INSERT(pos2) against DELETE(pos1)
function transformInsertAgainstDelete(insertPos, deletePos) {
  if (insertPos > deletePos) {
    return insertPos - 1; // shift left because something was deleted before it
  }
  return insertPos; // no effect, insertion is before the deletion
}
```

OT is what Google Docs uses. It's mathematically proven to work.

**The problem with OT:**

The transformation functions need to handle every possible pair of operation types. INSERT vs INSERT, DELETE vs DELETE, INSERT vs DELETE, and when you add rich text formatting — bold, italic, headings — the number of cases explodes. Google has a team of engineers who worked on this for years and still have edge cases. The famous "Operational Transformation is a minefield" paper by Joseph Gentle documented over 20 known bugs in published OT algorithms.

---

### Approach 2: CRDT (Conflict-free Replicated Data Type)

CRDTs take a different approach: instead of transforming operations, they design the data structure so that **merge is always automatic and conflict-free**.

The key insight: positions in an array are fragile (they shift as you add/remove characters). Character IDs are stable.

```
"Hello World" in CRDT:

Instead of: ['H','e','l','l','o',' ','W','o','r','l','d']
                0   1   2   3   4   5   6   7   8   9   10

Store as:   [
  {id:"a1", char:'H'},
  {id:"a2", char:'e'},
  {id:"a3", char:'l'},
  {id:"a4", char:'l'},
  {id:"a5", char:'o'},
  {id:"a6", char:' '},
  {id:"b1", char:'W'},   ← b = Bob's characters
  {id:"b2", char:'o'},
  {id:"b3", char:'r'},
  {id:"b4", char:'l'},
  {id:"b5", char:'d'},
]
```

Now Alice deletes the space (id:"a6"):

```
Alice marks a6 as TOMBSTONE:
  {id:"a6", char:' ', deleted: true}
  ← character is marked, NOT removed from array
```

Bob inserts '!' after 'd' (after id:"b5"):

```
Bob creates: {id:"b6", char:'!', after:"b5"}
```

Now both operations are exchanged:

```
Alice receives Bob's insert:
  "insert b6 after b5" — b5 still exists with id "b5"
  Alice inserts b6 after b5 ✅ No position confusion.

Bob receives Alice's delete:
  "mark a6 as deleted"
  Bob marks a6 as deleted ✅

Both render: filter out tombstones → "HelloWorld!" ✅
```

No transformation needed. Operations are based on stable IDs, not fragile positions. Merge is automatic.

---

**Interviewer:**

Which would you use and why?

---

**Candidate:**

**CRDT via Yjs** — without hesitation for a new project in 2024.

Here's why:

```
OT:
  ✅ Proven correct
  ✅ Efficient wire format (small ops)
  ❌ Extremely hard to implement correctly
  ❌ Requires central server as authority
  ❌ No offline support without significant extra work
  ❌ Google has a dedicated team for this

CRDT (Yjs):
  ✅ Free open-source library
  ✅ Battle-tested (Figma, Notion, Obsidian, many others)
  ✅ Offline-first by design
  ✅ Decentralized — works peer-to-peer
  ✅ Integrates with TipTap, ProseMirror, Quill, Slate
  ⚠️ Slightly more memory (tombstones)
  ⚠️ Slightly larger wire format

Implementing OT correctly from scratch would take months
and still have edge cases. Yjs is production-ready today.
```

---

**Interviewer:**

How does Yjs work with a React editor?

---

**Candidate:**

The integration is surprisingly clean. Here's the setup with TipTap (the most React-friendly editor that has native Yjs support):

```javascript
import { useEditor, EditorContent } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function DocumentEditor({ docId, currentUser }) {
  // 1. Create a Yjs document
  const ydoc = useMemo(() => new Y.Doc(), []);

  // 2. Connect to WebSocket sync server
  const provider = useMemo(() => {
    return new WebsocketProvider(
      "wss://your-sync-server.com",
      docId,   // room name — everyone with same docId shares the same Y.Doc
      ydoc
    );
  }, [docId, ydoc]);

  // 3. Wire editor to Yjs
  const editor = useEditor({
    extensions: [
      // ... other TipTap extensions (Bold, Italic, Heading, etc.)
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: currentUser.name,
          color: currentUser.color  // "#6366f1"
        }
      })
    ]
  });

  // Cleanup
  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  return <EditorContent editor={editor} />;
}
```

That's it. Yjs handles all the CRDT logic. The WebsocketProvider handles syncing. TipTap renders the rich text. Remote cursors show up automatically via `CollaborationCursor`.

---

**Interviewer:**

So the hard part is handled by the library. What do *you* actually build?

---

**Candidate:**

The product layer — everything around the editor:

```
What Yjs + TipTap handle:
  ✅ Document CRDT state
  ✅ Real-time sync between clients
  ✅ Remote cursor positions
  ✅ Offline queueing
  ✅ Undo/redo per user

What I build:
  1. Document title editing (separate from body text)
  2. Auto-save to backend (persist to database, not just Yjs)
  3. CollaboratorBar (avatars of online users)
  4. Version history UI
  5. Access control (who can edit vs view)
  6. Share modal
  7. Toolbar UI
  8. Loading state (fetching initial doc)
  9. Connection status banner ("Reconnecting...")
  10. Document list / sidebar
```

In an interview, this is the honest answer. You don't pretend to implement CRDT from scratch — you demonstrate you understand the problem deeply, make the right technology choice, and explain what the actual product work is.

---

## ─────────────────────────────────────
## PHASE 4 — Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the full architecture — components, state, how data flows.

---

**Candidate:**

```
<DocumentEditor docId={id} currentUser={user} />
│
├── <DocumentHeader />
│     ├── <TitleInput />          ← editable, separate from body
│     └── <AutoSaveIndicator />   ← "Saving..." | "Saved" | "Error"
│
├── <CollaboratorBar />
│     └── <UserAvatar /> × N (connected editors, colored rings)
│
├── <Toolbar />
│     └── Bold, Italic, H1/H2, Lists, Link — all call editor.chain()...
│
└── <EditorContent editor={editor} />
      └── TipTap renders here, Yjs cursors injected automatically
```

State split:

```javascript
// Yjs manages document content — I don't touch this
// const ydoc = new Y.Doc()

// App-level React state
const [title, setTitle] = useState("");           // doc title
const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
const [connectedUsers, setConnectedUsers] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [connectionStatus, setConnectionStatus] = useState("connected");
```

Key principle: **the editor content (the actual document text) lives in Yjs, not in React state**. React state is only for UI metadata around the editor.

---

**Interviewer:**

What happens when a user first opens the document?

---

**Candidate:**

```
Step 1 — Fetch document metadata via HTTP
  GET /api/docs/:docId
  Response: { id, title, permissions, createdAt }
  → setTitle, setIsLoading(false)

Step 2 — Yjs WebsocketProvider connects
  wss://sync.example.com/{docId}
  Server sends current document state (Uint8Array encoded)
  Yjs applies the initial state to ydoc
  TipTap editor hydrates with the document content
  → User sees the document text appear

Step 3 — User appears in ConnectedUsers list
  Server broadcasts USER_JOINED to all other editors
  Other clients update their CollaboratorBar
  → Remote users see the new avatar appear

Step 4 — User starts typing
  Yjs intercepts keystrokes (via TipTap extension)
  Creates CRDT operations locally
  Applies them locally (instant, no waiting)
  Sends encoded update to WebSocket server
  Server broadcasts to all other connected editors
  Other clients receive and apply update
  → Other users see the change appear within ~50ms
```

---

**Interviewer:**

The title is editable separately from the body. How do you handle that?

---

**Candidate:**

The title is just a controlled React input — it's not part of the Yjs document. It's simpler state:

```javascript
const [title, setTitle] = useState(initialTitle);
const debouncedTitle = useDebounce(title, 1000);

// Save title to backend when it stops changing
useEffect(() => {
  if (debouncedTitle !== initialTitle) {
    fetch(`/api/docs/${docId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: debouncedTitle })
    });
  }
}, [debouncedTitle]);
```

Should the title be collaborative too? In a real product, yes — if two people are in the title at the same time it should sync. For the interview scope, treating it as "last write wins with debounce" is acceptable and honest to say.

---

## ─────────────────────────────────────
## PHASE 5 — Auto-Save
## ─────────────────────────────────────

---

**Interviewer:**

How does auto-save work?

---

**Candidate:**

There are two layers of persistence that people confuse:

**Layer 1 — Yjs real-time sync (between clients)**

This is handled by the WebsocketProvider. Every change is immediately synced to all connected editors. The Yjs server persists the current document state (usually in Redis or a database) so new editors who join later get the current state.

This is not "saving to the database" in the traditional sense — it's the live collaboration state.

**Layer 2 — Backend persistence (the "saved to disk" save)**

This is the PATCH to the database that gives users confidence their document won't disappear. This is what the "All changes saved" indicator reflects.

```javascript
const debouncedSave = useCallback(
  debounce(async () => {
    setAutoSaveStatus("saving");
    try {
      const html = editor.getHTML(); // get current content from TipTap
      await fetch(`/api/docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: html })
      });
      setAutoSaveStatus("saved");
    } catch {
      setAutoSaveStatus("error");
    }
  }, 2000),  // 2 seconds after last change
  [editor, docId]
);

// Wire to editor's onChange event
useEffect(() => {
  if (!editor) return;
  editor.on("update", debouncedSave);
  return () => editor.off("update", debouncedSave);
}, [editor, debouncedSave]);
```

The status indicator:

```jsx
const statusConfig = {
  saving: { icon: "⟳", text: "Saving..." },
  saved:  { icon: "✓", text: "All changes saved" },
  error:  { icon: "⚠", text: "Failed to save. Retrying..." },
  offline:{ icon: "◌", text: "Working offline" }
};

<AutoSaveIndicator status={autoSaveStatus} />
```

---

**Interviewer:**

Why 2 seconds? Why not save on every change?

---

**Candidate:**

A fast typist does 70–80 words per minute — about 6 characters per second. Saving on every character means 6 HTTP requests per second per user. With 1,000 active users, that's 6,000 database writes per second just for auto-save.

2 seconds means at most 1 save per 2 seconds per user — 500 writes/second for 1,000 users. A 12× reduction.

Also: Yjs is already persisting the live document state in real-time. The 2-second save is for durability and backup — not for collaboration. Losing 2 seconds of work in a power failure is an acceptable trade-off.

---

## ─────────────────────────────────────
## PHASE 6 — Cursor Presence
## ─────────────────────────────────────

---

**Interviewer:**

How do you show other users' cursors in the document?

---

**Candidate:**

Yjs has a concept called **Awareness** built-in — it's a lightweight, ephemeral side-channel separate from the document data. It's specifically designed for presence information like cursors and user status.

The CollaborationCursor TipTap extension uses Awareness under the hood:

```javascript
// When Alice moves her cursor, TipTap automatically does:
provider.awareness.setLocalStateField("cursor", {
  anchor: editor.state.selection.anchor,
  head: editor.state.selection.head,
  name: currentUser.name,
  color: currentUser.color
});

// Other clients receive these updates and TipTap renders
// a cursor at that position in their editor
```

Awareness state is:
- **Not persisted** — cursor positions vanish when the user closes the tab
- **Propagated to all clients** — everyone sees all cursors
- **Per-user** — each connected client has its own awareness state

The rendering is handled by the CollaborationCursor extension — it injects an absolutely-positioned `<span>` at the cursor position with the user's name label and color.

---

**Interviewer:**

What happens to the cursor when a user disconnects?

---

**Candidate:**

The WebsocketProvider automatically removes the user from the awareness state when their connection closes. The server detects the disconnect and notifies all remaining clients. TipTap removes the cursor rendering for that user.

For the CollaboratorBar (the avatars row), I listen to the awareness change event:

```javascript
useEffect(() => {
  if (!provider) return;

  const updateUsers = () => {
    const states = provider.awareness.getStates();
    const users = Array.from(states.values()).map(state => ({
      userId: state.userId,
      name: state.user?.name,
      color: state.user?.color
    }));
    setConnectedUsers(users);
  };

  provider.awareness.on("change", updateUsers);
  return () => provider.awareness.off("change", updateUsers);
}, [provider]);
```

This fires when anyone joins, leaves, or updates their cursor. The avatar list stays in sync automatically.

---

## ─────────────────────────────────────
## PHASE 7 — Undo/Redo
## ─────────────────────────────────────

---

**Interviewer:**

Undo is tricky in collaborative editing. How does it work?

---

**Candidate:**

You're right that it's tricky. Let me show the wrong approach first, then the correct one.

**The wrong approach — shared undo stack:**

```
Shared history:
  [Alice types "Hello"] ← operation 1
  [Bob types "World"]   ← operation 2
  [Alice types "!"]     ← operation 3

Alice presses Cmd+Z:
  → undoes "!" ← correct ✅

Alice presses Cmd+Z again:
  → undoes Bob's "World" ← WRONG ❌
    Bob didn't press undo. Alice deleted Bob's work.
```

**The correct approach — per-user undo stack:**

Each user only undoes their own operations:

```
Alice's history:   [insert "Hello", insert "!"]
Bob's history:     [insert "World"]

Alice presses Cmd+Z:
  → undoes Alice's last op: removes "!" ✅
  → Bob's "World" is untouched ✅

Alice presses Cmd+Z again:
  → undoes Alice's next op: removes "Hello" ✅
  → But what if Bob's "World" is now orphaned?
    The CRDT handles this — characters that had no adjacent context
    just stay in the document at their last known position.
```

Yjs's `Y.UndoManager` implements this correctly:

```javascript
import { UndoManager } from "yjs";

// Track only Alice's operations in this manager
const undoManager = new UndoManager(ydoc.getText("content"), {
  trackedOrigins: new Set([provider.awareness.clientID])
});

// Cmd+Z
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
    undoManager.undo();
  }
  if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
    undoManager.redo();
  }
});
```

TipTap's Collaboration extension wires this up automatically — you get per-user undo out of the box.

---

**Interviewer:**

What if Alice undoes something that Bob has since built on top of?

---

**Candidate:**

This is the deep philosophical problem with collaborative undo. Let me show it:

```
Alice types "Hello" → document is "Hello"
Bob types " World" after "Hello" → document is "Hello World"
Alice presses Cmd+Z to undo her "Hello"

What should happen?
  Option A: Remove "Hello" → document becomes " World"
            Bob's text still exists, just lost its context.
  Option B: Block the undo because Bob built on top of it.
  Option C: Show a warning: "Undoing will affect Bob's text"
```

Google Docs chooses **Option A** — the undo always goes through, even if it affects context for others. This can produce odd results but is predictable. The key reason is that a blocked undo would be extremely frustrating to the user trying to undo.

Yjs does the same — undo always succeeds. The document state simply reflects the history of all decisions made.

In practice, this is rare because users tend to type in different parts of the document, not on top of each other.

---

## ─────────────────────────────────────
## PHASE 8 — Offline Support
## ─────────────────────────────────────

---

**Interviewer:**

The user loses internet. They keep typing. What happens?

---

**Candidate:**

This is one of CRDT's biggest advantages. Let me walk through it:

**While offline:**

```
Provider detects WebSocket disconnect
  → setConnectionStatus("offline")
  → Show banner: "You're working offline. Changes will sync when reconnected."

User keeps typing:
  → Yjs still accepts changes locally
  → Operations stored in local Y.Doc
  → Editor works completely normally
  → Auto-save to backend fails silently (set status to "offline")
```

**When connection restores:**

```
WebSocket reconnects
  → Provider sends Alice's offline changes to server (encoded Uint8Array)
  → Server merges Alice's CRDT state with any changes from Bob
  → Server sends merged state back
  → Alice's editor applies the merge
  → Both documents converge ✅

Why this works: CRDT merge is deterministic.
Alice's changes and Bob's changes can be merged in any order
and always produce the same result. No coordination needed.
```

For persistence while offline, Yjs can use IndexedDB as a local persistence layer:

```javascript
import { IndexeddbPersistence } from "y-indexeddb";

// Persist Yjs document to browser storage
const persistence = new IndexeddbPersistence(docId, ydoc);

persistence.whenSynced.then(() => {
  console.log("Loaded document from IndexedDB cache");
});
```

Now the user can close the tab, reopen it offline, and see their last known document state. When they reconnect, the sync happens automatically.

---

**Interviewer:**

What if Bob also edited while Alice was offline? How does the merge work?

---

**Candidate:**

```
Alice offline edits:
  "Hello" → "Hello Alice"

Bob online edits (same period):
  "Hello" → "Hello Bob"

When Alice reconnects:
  Alice's Y.Doc has state: { "Hello Alice" operations }
  Bob's Y.Doc has state:   { "Hello Bob" operations }

Yjs merges by character IDs:
  'H' 'e' 'l' 'l' 'o' — shared, no conflict
  ' ' 'A' 'l' 'i' 'c' 'e' — Alice's characters (IDs: alice:1–6)
  ' ' 'B' 'o' 'b' — Bob's characters (IDs: bob:1–4)

Merge result:
  "Hello Alice Bob" or "Hello Bob Alice"
  (order of concurrent insertions at same position determined by client ID comparison)

Neither loses their text. Both names appear.
The document converges to the same state on both clients.
```

This might not be what the users *wanted* — they both tried to replace "Hello" with their name. But it's the correct behavior: both intentions are preserved, no data lost. Users can manually fix it.

---

## ─────────────────────────────────────
## PHASE 9 — Version History
## ─────────────────────────────────────

---

**Interviewer:**

How would you add version history?

---

**Candidate:**

Version history means users can see what the document looked like at past points in time and optionally restore to a previous version.

Two implementation models:

**Model 1 — Snapshot-based:**

```
Every 30 minutes or every 100 operations:
  → Save full document HTML to database with timestamp
  → { docId, content: "<p>Hello World</p>", savedAt: timestamp }

Version history UI:
  → List all snapshots: "Today 2:30pm", "Today 2:00pm", "Yesterday 5:00pm"
  → User clicks one → load that snapshot into a read-only preview
  → "Restore this version" → PATCH current doc with old content

Simple. Storage is the main cost.
```

**Model 2 — Operation log replay:**

```
Store every Yjs update (Uint8Array) with timestamp.
To restore to t=2:30pm:
  → Start from empty Y.Doc
  → Replay all operations up to 2:30pm timestamp
  → Document reconstructed at that exact moment

Fine-grained (any point in time), expensive on replay.
```

For an interview context, the **snapshot model is the practical answer**. You can describe both, recommend snapshots for simplicity, and mention operation log replay as a production-grade enhancement.

```javascript
// Save snapshot on a schedule
const saveVersionSnapshot = async () => {
  await fetch(`/api/docs/${docId}/versions`, {
    method: "POST",
    body: JSON.stringify({
      content: editor.getHTML(),
      title: documentTitle,
      savedAt: Date.now()
    })
  });
};

// Also save when user explicitly clicks "Save version"
// Also auto-save every 30 minutes via setInterval
```

Version history UI:

```
┌─────────────────────────────────────────┐
│  VERSION HISTORY                    ✕  │
│  ─────────────────────────────────────  │
│  ▶ Today, 3:45pm  (current)             │
│    Today, 2:30pm                        │
│    Today, 2:00pm  "Added intro section" │
│    Yesterday, 5pm                       │
│    Jan 15, 10am                         │
│  ─────────────────────────────────────  │
│  [Restore this version]                 │
└─────────────────────────────────────────┘
```

---

## ─────────────────────────────────────
## PHASE 10 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

A document has 500 pages of content. Loading it all at once — what happens?

---

**Candidate:**

A 500-page document might be 1–2MB of Yjs state. Loading that as a single blob would:
- Take 2–5 seconds on a slow connection
- Force TipTap to parse and render all 500 pages at once
- Make the initial editor interaction feel sluggish

Three strategies:

**1. Lazy-load document sections**

```
Load first 3 pages immediately (above the fold)
Load remaining sections as user scrolls

Requires the document to be stored in sections:
  { docId, sections: [{ id, content, order }] }
Rather than one monolithic content blob.
```

**2. Progressive loading indicator**

While the full document loads, show the first page content immediately and a progress bar for the rest. Users can start reading and typing at the top while the rest loads.

**3. Yjs lazy sync**

Yjs supports loading only a portion of the document state initially. For very large documents this is the production approach — you don't sync the entire Yjs state, you sync the visible portion.

For the interview scope: mention the problem, describe lazy section loading, and acknowledge this is a deep engineering challenge where real products (Google Docs, Notion) have invested significant effort.

---

**Interviewer:**

The toolbar re-renders every time the cursor moves. How do you prevent that?

---

**Candidate:**

The toolbar buttons need to know the current selection state — whether "Bold" should appear active because the cursor is in bold text. TipTap fires an `update` event on every cursor move, which re-renders the toolbar.

Solution: memoize the toolbar's active states:

```javascript
// Compute toolbar state only when selection changes
const toolbarState = useMemo(() => ({
  isBold: editor?.isActive("bold"),
  isItalic: editor?.isActive("italic"),
  isH1: editor?.isActive("heading", { level: 1 }),
  isH2: editor?.isActive("heading", { level: 2 }),
}), [editor?.state.selection]); // depend on selection, not every update

// Memoize toolbar component
const Toolbar = React.memo(({ state, editor }) => {
  return (
    <div>
      <button className={state.isBold ? "active" : ""} onClick={() => editor.chain().toggleBold().run()}>B</button>
      {/* ... */}
    </div>
  );
});
```

---

## ─────────────────────────────────────
## PHASE 11 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

We're almost at time. Summarize the key decisions.

---

**Candidate:**

```
┌──────────────────────────────────────────────────────────────────┐
│              GOOGLE DOCS ARCHITECTURE SUMMARY                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Conflict resolution:  CRDT via Yjs                             │
│    Why: OT is a minefield. Yjs is production-grade,             │
│    offline-first, and has first-class editor integrations.       │
│                                                                  │
│  Editor library:       TipTap (built on ProseMirror)             │
│    Why: React-native, TipTap Collaboration extension             │
│    handles Yjs wiring. Remote cursors included.                  │
│                                                                  │
│  Transport:            WebSocket via y-websocket                 │
│    Yjs encodes changes as Uint8Array and syncs via WS.           │
│    Awareness (cursors/presence) uses a separate lightweight      │
│    ephemeral channel over the same connection.                   │
│                                                                  │
│  Document content:     Lives in Yjs, not React state             │
│    React state is only for UI metadata (title, save status,     │
│    connected users, connection health).                          │
│                                                                  │
│  Auto-save:            Debounced 2s → PATCH to backend           │
│    Two layers: Yjs real-time sync (between clients) and          │
│    backend HTTP save (for durability).                           │
│                                                                  │
│  Undo/redo:            Per-user via Y.UndoManager                │
│    Users only undo their own operations.                         │
│                                                                  │
│  Offline:              Yjs queues changes, CRDT merges on sync   │
│    IndexedDB persistence for tab-close and reopen.              │
│                                                                  │
│  Cursor presence:      Yjs Awareness API                         │
│    Ephemeral, not persisted. Removed on disconnect.              │
│                                                                  │
│  Version history:      Snapshot every 30min or N ops             │
│    Bonus: operation log for fine-grained restore.                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

In priority order:

1. **Comments system** — anchor comments to text ranges, update anchor positions as the document changes. This is the next most valuable feature after the core editor.

2. **Suggestions mode** — tracked changes that can be accepted or rejected by the document owner. Stored as a separate layer of CRDT state.

3. **Access control enforcement on the frontend** — view-only editors where TipTap is read-only, comment-only mode where only the comment extension is active.

4. **Document templates** — a library of starter documents (meeting notes, project brief, etc.)

5. **@mentions in document** — type '@' to mention a user, which sends them a notification and creates an anchor link to that position.

---

**Interviewer:**

Excellent. You clearly understand this problem deeply.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked about concurrent editors before designing (changes the entire approach)
✅  Explained the conflict problem with a concrete character-level example
✅  Showed WHY last-write-wins fails (data loss scenario)
✅  Explained OT clearly with a transformation example
✅  Explained CRDT clearly with character IDs and tombstones
✅  Made a clear, justified library choice (Yjs) rather than vague handwaving
✅  Knew the relevant libraries (TipTap, ProseMirror, y-websocket, y-indexeddb)
✅  Distinguished two layers of persistence (Yjs sync vs backend save)
✅  Explained per-user undo correctly — did NOT say "just undo last op"
✅  Described offline merge behavior (CRDT convergence)
✅  Described version history models with tradeoffs
✅  Mentioned toolbar memoization as a performance concern
```

---

## What Would Have Hurt the Score

```
❌  Not knowing about the conflict problem at all
❌  Saying "just use WebSocket and send the document on each change"
    (classic wrong answer — two users overwrite each other)
❌  Saying "last write wins" without explaining why it destroys data
❌  Not knowing OT or CRDT by name
❌  Claiming to implement OT from scratch (unrealistic)
❌  Not knowing Yjs or any CRDT library
❌  Saying "auto-save on every change" without addressing the request rate problem
❌  Describing global undo (undoes other users' work)
❌  Not separating Yjs sync (ephemeral) from backend persistence (durable)
```

---

## The 11 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Conflict problem | "What makes concurrent editing hard?" |
| 2 | Why last-write-wins fails | "Why not just let the last change win?" |
| 3 | Operational Transformation | "What is OT and how does it work?" |
| 4 | CRDT (character IDs, tombstones) | "What is CRDT and how does it differ?" |
| 5 | Library choice (Yjs) | "Which would you use and why?" |
| 6 | Two persistence layers | "How does auto-save work?" |
| 7 | Debounce rate for auto-save | "Why 2 seconds, not every change?" |
| 8 | Per-user undo stack | "How does undo work collaboratively?" |
| 9 | Yjs Awareness for cursors | "How do you show remote cursors?" |
| 10 | CRDT offline merge | "User edits offline. What happens on reconnect?" |
| 11 | Version history models | "How would you implement version history?" |
