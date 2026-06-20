# Real-time Chat Application — Interview Overview

---

## What Problem Are We Solving?

A **real-time chat application** lets users send and receive messages instantly — without refreshing the page. Messages appear on the recipient's screen the moment they're sent.

```
Alice types: "Hey, are you free?"
                                        Bob sees it immediately ─────▶ "Hey, are you free?"
                                                                        [typing indicator...]
Alice sees: "Bob is typing..."
                                        Bob sends: "Yes, what's up?"
Alice sees: "Yes, what's up?" ◀─────
```

You see this in:

| Product         | Chat Type                            |
|-----------------|--------------------------------------|
| Slack           | Channels + DMs + threads             |
| WhatsApp Web    | 1-to-1 + group, end-to-end encrypted |
| Discord         | Channels + DMs + voice               |
| Facebook Messenger | 1-to-1 + group                    |
| Intercom        | Support chat widget                  |

---

## What Makes This Problem Hard

Most UI problems are about rendering data. Chat is about **keeping multiple clients in sync in real time** — and doing it reliably when networks drop, users go offline, or two people send at the exact same millisecond.

```
EASY problem:   Fetch data → Render it
CHAT problem:   Keep N clients in sync, in order, in real time,
                even when connections drop and messages arrive out of order
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements     →  Scope the problem before designing     │
│  2. Transport layer  →  WebSocket vs Polling vs SSE            │
│  3. Architecture     →  Components, state, data structure      │
│  4. Sending          →  Optimistic update + server confirm     │
│  5. Receiving        →  WebSocket handler + state update       │
│  6. Typing indicator →  Debounced emit, timeout to clear       │
│  7. Read receipts    →  Seen/delivered status per message      │
│  8. Scroll behavior  →  Auto-scroll vs pinned reading position │
│  9. Reconnection     →  Exponential backoff + message sync     │
│  10. History         →  Reverse pagination (load older msgs)   │
│  11. Performance     →  Virtual scroll for long conversations  │
│  12. Scale           →  What breaks at 1M concurrent users     │
└────────────────────────────────────────────────────────────────┘
```

---

## High-Level System Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     ALICE'S BROWSER                            │
│                                                                │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                   React App                           │    │
│  │                                                       │    │
│  │  ┌─────────────┐    ┌─────────────────────────────┐  │    │
│  │  │ Conversation│    │        Chat Window          │  │    │
│  │  │    List     │    │  ┌───────────────────────┐  │  │    │
│  │  │             │    │  │    Message List       │  │  │    │
│  │  │  Alice & Bob│    │  │  (virtual scrolled)   │  │  │    │
│  │  │  > unread 2 │    │  └───────────────────────┘  │  │    │
│  │  │  Alice & Eve│    │  ┌───────────────────────┐  │  │    │
│  │  │             │    │  │  Typing Indicator     │  │  │    │
│  │  └─────────────┘    │  └───────────────────────┘  │  │    │
│  │                     │  ┌───────────────────────┐  │  │    │
│  │                     │  │   Message Input       │  │  │    │
│  │                     │  └───────────────────────┘  │  │    │
│  │                     └─────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────────┘    │
│                            │  ▲                                │
│                    send    │  │  receive                       │
└────────────────────────────┼──┼────────────────────────────────┘
                             │  │
                    WebSocket│  │WebSocket
                    (ws://)  │  │(persistent, bidirectional)
                             │  │
                    ┌────────▼──┴────────┐
                    │   WebSocket Server  │
                    │   (Node / Go / etc) │
                    └────────────────────┘
                             │  ▲
                             │  │
                    ┌────────▼──┴────────┐
                    │      BOB'S BROWSER  │
                    │  (receives instantly│
                    │   via his WS conn)  │
                    └────────────────────┘
```

---

## Transport Layer Decision

```
┌────────────────────────────────────────────────────────────────┐
│                 THREE OPTIONS COMPARED                         │
├──────────────────┬──────────────┬──────────────┬──────────────┤
│                  │  HTTP Polling │  Server-Sent │  WebSocket   │
│                  │              │  Events (SSE) │              │
├──────────────────┼──────────────┼──────────────┼──────────────┤
│ Direction        │ Client→Server│ Server→Client│ Bidirectional│
│ Latency          │ ~1-2 seconds │ ~milliseconds│ ~milliseconds│
│ Server load      │ High         │ Medium       │ Low          │
│ Complexity       │ Simple       │ Medium       │ Higher setup │
│ Reconnection     │ Automatic    │ Automatic    │ Manual       │
│ Good for chat?   │ ❌ No        │ ⚠️ Partial   │ ✅ Yes       │
└──────────────────┴──────────────┴──────────────┴──────────────┘

SSE is one-way (server → client only), so the client still needs
HTTP POST to send messages. WebSocket is truly bidirectional —
send and receive over the same connection.
```

---

## Component Hierarchy

```
<ChatApp />
│
├── <ConversationList />                 ← left sidebar
│   └── <ConversationItem /> × N
│         ├── Avatar + Name
│         ├── Last message preview
│         └── Unread badge count
│
└── <ChatWindow conversationId={id} />   ← main area
    ├── <ChatHeader />
    │     ├── Recipient name + avatar
    │     └── Online status indicator
    │
    ├── <MessageList />                  ← scrollable area
    │   ├── <LoadOlderMessages />        ← top: scroll up to load history
    │   ├── <DateSeparator />            ← "Today", "Yesterday"
    │   ├── <MessageBubble /> × N
    │   │     ├── Text content
    │   │     ├── Timestamp
    │   │     └── Status icon (✓ sent  ✓✓ delivered  🔵 seen)
    │   └── <TypingIndicator />          ← bottom: "Bob is typing..."
    │
    └── <MessageInput />
          ├── <TextArea />
          └── <SendButton />
```

---

## Message State Machine

Every message goes through these states:

```
                  ┌──────────────┐
User hits Send    │   SENDING    │  ← optimistic: shown immediately
─────────────────▶│  (temp ID)   │     with a clock icon ⏱
                  └──────┬───────┘
                         │ server confirms
                         ▼
                  ┌──────────────┐
                  │    SENT      │  ← server stored it, real ID assigned
                  │    (✓)       │     single grey checkmark
                  └──────┬───────┘
                         │ recipient's device received it
                         ▼
                  ┌──────────────┐
                  │  DELIVERED   │  ← recipient's WS connection got it
                  │    (✓✓)      │     double grey checkmark
                  └──────┬───────┘
                         │ recipient opens the conversation
                         ▼
                  ┌──────────────┐
                  │    SEEN      │  ← recipient viewed it
                  │    (🔵🔵)    │     double blue checkmark
                  └──────────────┘

         ┌──────────────┐
         │    FAILED    │  ← server unreachable, send failed
         │    (⚠️)      │     show retry button
         └──────────────┘
```

---

## Data Structures

```javascript
// Message shape
{
  id: "msg_abc123",              // server-assigned real ID
  tempId: "temp_1699000000000",  // client-assigned temp ID (before server confirms)
  conversationId: "conv_456",
  senderId: "user_789",
  text: "Hey, are you free?",
  timestamp: 1699000000000,      // unix ms
  status: "sending" | "sent" | "delivered" | "seen" | "failed",
  type: "text" | "image" | "file"
}

// Conversation shape
{
  id: "conv_456",
  participants: ["user_789", "user_012"],
  lastMessage: { text: "Hey, are you free?", timestamp: 1699000000 },
  unreadCount: 2,
  isTyping: []  // array of userIds currently typing
}

// App state
const [conversations, setConversations] = useState([]);
const [messages, setMessages] = useState({});
// messages is a map: { convId: [msg, msg, msg] }
// Using an object (not array) for O(1) lookup by conversation

const [typingUsers, setTypingUsers] = useState({});
// { convId: ["user_012"] }

const [connectionStatus, setConnectionStatus] = useState("connected");
// "connected" | "disconnected" | "reconnecting"
```

---

## WebSocket Event Types

```
Client → Server events:
  SEND_MESSAGE      { tempId, conversationId, text }
  TYPING_START      { conversationId }
  TYPING_STOP       { conversationId }
  MARK_SEEN         { conversationId, lastMessageId }
  JOIN_CONVERSATION { conversationId }

Server → Client events:
  MESSAGE_RECEIVED  { message }           ← new message from someone else
  MESSAGE_ACK       { tempId, realId, timestamp, status }  ← confirm our send
  TYPING_UPDATE     { conversationId, userId, isTyping }
  STATUS_UPDATE     { messageId, status } ← delivered/seen update
  USER_ONLINE       { userId }
  USER_OFFLINE      { userId }
```

---

## Optimistic Message Update Flow

```
User sends "Hey!"
     │
     ├─▶ 1. Create temp message:
     │      { id: "temp_123", text: "Hey!", status: "sending" }
     │
     ├─▶ 2. Add to local messages state IMMEDIATELY
     │      User sees bubble appear instantly ⚡
     │
     ├─▶ 3. Send via WebSocket:
     │      ws.send({ type: "SEND_MESSAGE", tempId: "temp_123", text: "Hey!" })
     │
     ├─▶ 4. Server processes and confirms:
     │      ws receives: { type: "MESSAGE_ACK", tempId: "temp_123",
     │                     realId: "msg_abc", status: "sent" }
     │
     └─▶ 5. Replace temp message with real one:
            setMessages: replace temp_123 with msg_abc (status: "sent") ✓


If server fails:
     └─▶ 5b. Mark message as "failed", show retry button ⚠️
```

---

## Scroll Behavior Logic

```
┌───────────────────────────────────────────────────────────────┐
│                    SCROLL DECISION TREE                       │
│                                                               │
│  New message arrives                                          │
│          │                                                    │
│          ▼                                                    │
│   Is it MY message?                                           │
│   ┌──Yes──┐    ┌──No──┐                                      │
│   ▼       │    ▼      │                                       │
│ Auto-     │  Is user  │                                       │
│ scroll    │  already  │                                       │
│ to bottom │  at bottom│                                       │
│           │  (< 100px │                                       │
│           │  from end)│                                       │
│           │  ┌─Yes─┐  │                                       │
│           │  ▼     │  ▼                                       │
│           │ Auto-  │ Show "↓ New message from Bob" badge      │
│           │ scroll │   User clicks badge → scroll to bottom   │
│           └────────┘                                          │
└───────────────────────────────────────────────────────────────┘
```

---

## Reconnection Strategy (Exponential Backoff)

```
Connection drops
     │
     ├─▶ Attempt 1 after 1 second
     │       └── Failed? ──▶
     ├─▶ Attempt 2 after 2 seconds
     │       └── Failed? ──▶
     ├─▶ Attempt 3 after 4 seconds
     │       └── Failed? ──▶
     ├─▶ Attempt 4 after 8 seconds
     │       └── Failed? ──▶
     └─▶ Attempt 5 after 16 seconds  (cap at 30s max)

On successful reconnect:
     └─▶ Fetch missed messages since last received timestamp
         GET /api/conversations/:id/messages?since=1699000000
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|---------------|
| WebSocket vs Polling vs SSE | Transport layer decision for real-time |
| Optimistic UI updates | Messages feel instant even before server confirms |
| Message state machine | sent → delivered → seen progression |
| Race conditions in chat | Two messages sent at same time, ordering |
| Typing indicator debounce | Don't spam server on every keystroke |
| Scroll management | Auto-scroll vs pinned reading |
| Exponential backoff reconnect | Handle unstable connections gracefully |
| Message deduplication | Server might resend on reconnect |
| Read receipts | Track seen status per message |
| Virtual scrolling | Long chat threads with 1000+ messages |

---

## Interview Evaluation Criteria

```
Level          What They Want to See
────────────────────────────────────────────────────────────────
Junior     →   Basic WebSocket setup. Send and receive messages.
Mid-level  →   Optimistic updates. Typing indicators. Scroll logic.
Senior     →   All above + reconnection logic + message ordering
               + read receipts + deduplication + performance.
Staff      →   All above + offline queue + conflict resolution
               + pub/sub architecture + horizontal scaling.
```
