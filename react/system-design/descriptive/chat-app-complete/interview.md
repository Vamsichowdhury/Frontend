# Real-time Chat Application — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Collaborative but probing — will push back and dig deeper on every answer

---

> **How to use this file:**
> Read it like a screenplay. The Interviewer speaks. The Candidate responds.
> Every clarifying question has an annotation explaining the intent behind it.
> After reading each phase, pause and ask yourself: "Could I have answered that?"

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Let's have you design a real-time chat application — something like Slack or WhatsApp Web. The focus today is on the frontend. Take it wherever you think is most important.

---

**Candidate:**

Great topic. I'd like to start with some clarifying questions before jumping into the design, if that's okay.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why candidates ask clarifying questions before designing
> Chat is a broad problem. "Design a chat app" could mean anything from a simple two-person text box to a full Slack clone with threads, reactions, and file uploads. Each variation has a completely different architecture. These questions narrow the scope so you don't design the wrong thing — or spend time on features that weren't asked for.

---

**Q1. Is this 1-to-1 messaging, group chat, or both?**

> **Why ask this:**
> The data model changes significantly.
> - *1-to-1*: A conversation has exactly 2 participants. Simple. `conversation.participants = [userA, userB]`
> - *Group chat*: A conversation can have N participants. You need member lists, admin roles, the ability to add/remove people, and delivery receipts become more complex (you need seen-by tracking per person, not just one recipient).
>
> Also affects the UI — group chat needs a member panel, group name, avatar generation for groups.
> Starting with 1-to-1 is cleaner; group can be added as a layer on top.

---

**Q2. Do we need typing indicators — "Bob is typing..."?**

> **Why ask this:**
> Typing indicators require a real-time side channel separate from message delivery. Every keystroke the user types, you need to emit a `TYPING_START` event via WebSocket, and a `TYPING_STOP` after they pause. This needs debouncing — you can't emit on every single character.
>
> If the answer is no, you skip an entire system. If yes, you need to discuss debounce strategy and timeout behavior.

---

**Q3. Do we need read receipts — the double checkmark showing when a message was seen?**

> **Why ask this:**
> Read receipts add state per message (sent → delivered → seen) and require an event when the recipient *opens* a conversation. This touches the message data model, the rendering logic (status icon per bubble), and requires an event back to the sender when the recipient views the chat.
>
> Some products deliberately don't have this (iMessage can disable it). It's not a default assumption.

---

**Q4. Do we need to load older message history — scroll up to see past messages?**

> **Why ask this:**
> Message history means reverse pagination. As the user scrolls *up*, you load *older* messages. This is conceptually the opposite of infinite scroll (which loads more as you scroll *down*). It's tricky because inserting messages at the top of the list shifts the scroll position — you need to preserve the user's reading position while prepending data.
>
> If history isn't needed, you only show the last N messages. Much simpler.

---

**Q5. What happens when the connection drops? Should queued messages send when reconnected?**

> **Why ask this:**
> This distinguishes a toy implementation from a production-grade one. If the answer is yes — messages should queue and send on reconnect — you need an offline queue, reconnection logic with exponential backoff, and a way to sync missed messages after reconnection.
>
> This also reveals whether the interviewer wants to go deep on reliability, which is a senior-level concern.

---

**Q6. Should the app show online/offline status per user?**

> **Why ask this:**
> Presence (online/offline status) requires the server to track WebSocket connection state and broadcast `USER_ONLINE` / `USER_OFFLINE` events to relevant clients. On the frontend, you need a presence map and need to update the UI (green dot, "last seen 5 minutes ago") without re-rendering the entire conversation list.
>
> Presence sounds simple but at scale it's one of the harder problems in chat systems.

---

**Q7. Roughly what scale are we designing for?**

> **Why ask this:**
> Scale determines the weight of performance decisions.
> - *Small (1K users)*: Polling every few seconds could work. No need for WebSocket.
> - *Medium (100K users)*: WebSocket is necessary. Caching matters. Virtual scroll for long chats.
> - *Large (1M+ users)*: Horizontal scaling, pub/sub architecture (Redis), message queue, CDN for media.
>
> Knowing the scale upfront prevents over-engineering for a small app or under-engineering for a large one. It also lets you credibly say "at this scale, X becomes a concern."

---

**Interviewer:**

Good questions. Here's the scope:

- Start with 1-to-1 messaging. Group chat is a bonus.
- Yes, typing indicators.
- Yes, read receipts — sent, delivered, seen.
- Yes, load older message history on scroll up.
- Yes, queue messages and send on reconnect.
- Yes, online/offline status.
- Let's say tens of thousands of concurrent users.

---

**Candidate:**

Got it. That's a solid scope — let me start with the transport layer decision since that shapes everything else.

---

## ─────────────────────────────────────
## PHASE 2 — Transport Layer Decision
## ─────────────────────────────────────

---

**Interviewer:**

How does the browser talk to the server in real time? What are the options?

---

**Candidate:**

There are three main options:

**Option 1 — HTTP Polling**

```
Client asks server: "Any new messages?" every N seconds
         ↕ (HTTP request)
Server responds: "Yes, here are 3 new messages" or "No, nothing new"

Timeline:
t=0s    Client requests
t=0.1s  Server: "nothing new"
t=2s    Client requests again
t=2.1s  Server: "nothing new"
t=4s    Client requests again
t=4.1s  Server: "1 new message!"
```

Problems:
- Latency: message arrives at `t=3.5s` but user doesn't see it until `t=4.1s`
- Wasteful: most requests return "nothing new"
- Server load: 10,000 users × 1 request/2s = 5,000 requests per second just for polling

**Option 2 — Server-Sent Events (SSE)**

```
Client opens a long-lived HTTP connection.
Server can PUSH events to the client at any time.
Client still uses HTTP POST to send messages.

Server → Client: ✅ (real-time push)
Client → Server: ❌ (separate HTTP request for each message sent)
```

Better than polling. But it's one-directional — the server pushes, the client can't push back on the same connection. For chat, the client needs to send messages too, so you'd have a hybrid: SSE for receiving + HTTP for sending. More complexity, two different connections to manage.

**Option 3 — WebSocket**

```
Client and server establish a single persistent TCP connection.
Both can send data at any time. Truly bidirectional.

Client → Server: ✅ (send messages)
Server → Client: ✅ (receive messages, typing, presence updates)
Single connection for everything.
```

**My choice: WebSocket.** For a chat app with typing indicators, presence, and read receipts, you need bidirectional real-time communication. WebSocket is the right tool.

---

**Interviewer:**

What's the downside of WebSocket?

---

**Candidate:**

A few real ones:

**1. Reconnection is manual.**
HTTP is stateless — each request is independent. If a request fails, the browser retries. WebSocket is a persistent connection — if it drops, nothing automatically reconnects. You have to write the reconnection logic yourself, including exponential backoff.

**2. Firewalls and proxies sometimes block WebSocket.**
Some corporate networks and older proxies don't support the WebSocket upgrade handshake. In those environments, you'd fall back to long polling. Libraries like Socket.IO handle this transparently — they try WebSocket first and fall back to polling if needed.

**3. Server maintains open connections.**
Each connected user holds an open connection on the server. At 100,000 concurrent users, that's 100,000 open sockets. Servers need to be tuned to handle this (file descriptor limits, memory per connection).

**4. No built-in request/response pattern.**
HTTP gives you request → response naturally. With WebSocket, both sides just emit events. If you send a message and want to know if the server received it, you have to implement your own acknowledgement system.

---

**Interviewer:**

Good. Go ahead with the architecture.

---

## ─────────────────────────────────────
## PHASE 3 — Component Architecture
## ─────────────────────────────────────

---

**Candidate:**

Here's the component structure:

```
<ChatApp />
│
├── <ConversationList />              (left sidebar)
│   └── <ConversationItem /> × N
│         ├── Avatar + name
│         ├── Last message snippet
│         ├── Timestamp
│         └── Unread count badge
│
└── <ChatWindow conversationId={id} />
    │
    ├── <ChatHeader />
    │     ├── Recipient avatar + name
    │     └── Online status dot ("Active now" / "Last seen 2h ago")
    │
    ├── <MessageList />               (the scrollable area)
    │   ├── <LoadMoreButton />        (at top — "Load older messages")
    │   ├── <DateSeparator />         ("Today", "Yesterday", "Jan 15")
    │   ├── <MessageBubble /> × N
    │   │     ├── Text content
    │   │     ├── Timestamp (shown on hover)
    │   │     └── StatusIcon (⏱ sending | ✓ sent | ✓✓ delivered | 🔵 seen | ⚠️ failed)
    │   └── <TypingIndicator />       (at bottom, only when recipient is typing)
    │
    └── <MessageInput />
          ├── <TextArea />
          └── <SendButton />
```

---

**Interviewer:**

Where does the WebSocket connection live? At the top-level App or inside the ChatWindow?

---

**Candidate:**

At the top-level `<ChatApp>`, not inside `<ChatWindow>`. Here's why:

The WebSocket connection isn't specific to one conversation. It handles events from *all* conversations simultaneously — a new message in conversation B should update the unread badge in the `<ConversationList>` even while the user is viewing conversation A.

```
WebSocket receives:
  { type: "MESSAGE_RECEIVED", conversationId: "conv_B", message: {...} }

This needs to:
  1. Update messages["conv_B"] in state         → ChatWindow re-renders if open
  2. Update conversations list unread count      → ConversationList re-renders
  3. Update last message preview in sidebar      → ConversationItem re-renders

All three are different parts of the tree. Only the top-level App
can coordinate updates across all of them.
```

I'd store the WebSocket reference in a `useRef` at the top level and expose an action dispatcher (send message, mark seen) through a Context so child components can use it without prop drilling.

---

**Interviewer:**

What state does the App manage?

---

**Candidate:**

```javascript
// WebSocket connection
const wsRef = useRef(null);

// All conversations (sidebar list)
const [conversations, setConversations] = useState([]);

// Messages keyed by conversation ID
const [messages, setMessages] = useState({});
// { "conv_456": [msg1, msg2, msg3], "conv_789": [...] }

// Which conversation is currently open
const [activeConvId, setActiveConvId] = useState(null);

// Who is typing in each conversation
const [typingUsers, setTypingUsers] = useState({});
// { "conv_456": ["user_bob"] }

// Online status per user
const [onlineUsers, setOnlineUsers] = useState(new Set());

// WebSocket connection health
const [connectionStatus, setConnectionStatus] = useState("connected");
// "connected" | "disconnected" | "reconnecting"
```

The messages are an object (not an array) because you need O(1) access by conversationId. If it were an array of `[{ convId, messages: [] }]`, finding the right conversation on every incoming message would be O(n).

---

## ─────────────────────────────────────
## PHASE 4 — Sending Messages
## ─────────────────────────────────────

---

**Interviewer:**

User types "Hey, are you free?" and hits Send. Walk me through exactly what happens.

---

**Candidate:**

Here's the complete flow:

```
Step 1 — User clicks Send
          │
          ▼
Step 2 — Create a temporary message object
          {
            id: "temp_1699000000000",  ← generated locally (timestamp)
            text: "Hey, are you free?",
            senderId: currentUserId,
            status: "sending",         ← clock icon ⏱
            timestamp: Date.now()
          }

Step 3 — Add it to local messages state IMMEDIATELY
          setMessages(prev => ({
            ...prev,
            [activeConvId]: [...(prev[activeConvId] || []), tempMessage]
          }))
          → User sees their bubble appear instantly ⚡
          → No waiting for server

Step 4 — Send via WebSocket
          ws.send(JSON.stringify({
            type: "SEND_MESSAGE",
            tempId: "temp_1699000000000",
            conversationId: activeConvId,
            text: "Hey, are you free?"
          }))

Step 5 — Server processes and responds with ACK
          ws receives: {
            type: "MESSAGE_ACK",
            tempId: "temp_1699000000000",
            realId: "msg_abc123",
            timestamp: 1699000050,
            status: "sent"            ← single checkmark ✓
          }

Step 6 — Replace temp message with real one
          setMessages(prev => ({
            ...prev,
            [activeConvId]: prev[activeConvId].map(msg =>
              msg.id === "temp_1699000000000"
                ? { ...msg, id: "msg_abc123", status: "sent" }
                : msg
            )
          }))

Step 7 — Server delivers to Bob's WebSocket connection
          Bob's client receives: { type: "MESSAGE_RECEIVED", message: {...} }
          Server sends back to Alice: { type: "STATUS_UPDATE", messageId: "msg_abc123", status: "delivered" }

Step 8 — Alice's message bubble updates to ✓✓ (delivered)
```

This pattern is called **optimistic update**. The UI responds immediately to the user's action without waiting for server confirmation.

---

**Interviewer:**

Why optimistic update? Why not wait for the server before showing the bubble?

---

**Candidate:**

UX. If you wait for the server:

```
User hits Send
  → 200ms network round trip
  → Server processes
  → 200ms back
  → Bubble appears

Total delay before user sees their message: ~400ms
```

That half-second delay makes the app feel sluggish and broken. Users expect their own messages to appear immediately — that's how every major chat app (WhatsApp, iMessage, Slack) behaves.

With optimistic update:

```
User hits Send
  → Bubble appears instantly ← 0ms
  → Network call happens in background
```

The risk is: what if the server fails? You need to handle the failure case.

---

**Interviewer:**

Right — what happens if the server can't be reached?

---

**Candidate:**

The message stays in "sending" state indefinitely, which is a bad experience. I'd add a timeout:

```javascript
const sendMessage = async (text) => {
  const tempId = `temp_${Date.now()}`;

  // Optimistic update
  addMessageToState({ id: tempId, text, status: "sending" });

  // Set a failure timeout
  const failureTimer = setTimeout(() => {
    updateMessageStatus(tempId, "failed");
  }, 10000); // 10 seconds

  try {
    ws.current.send(JSON.stringify({
      type: "SEND_MESSAGE",
      tempId,
      text,
      conversationId: activeConvId
    }));
    // Timer cleared when ACK arrives in the WS handler
    pendingAcks.current[tempId] = failureTimer;
  } catch (err) {
    clearTimeout(failureTimer);
    updateMessageStatus(tempId, "failed");
  }
};
```

When the server ACK arrives:

```javascript
case "MESSAGE_ACK":
  clearTimeout(pendingAcks.current[data.tempId]);
  delete pendingAcks.current[data.tempId];
  replaceMessage(data.tempId, data.realId, "sent");
  break;
```

If it times out — the bubble shows a ⚠️ icon with a "Tap to retry" option. The original message text is preserved so the user doesn't have to retype.

---

**Interviewer:**

What does the failed state look like in the UI?

---

**Candidate:**

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Hey, are you free?            ⚠️  │    │  ← red warning icon
│  │  Not delivered  · Tap to retry     │    │  ← subtitle text
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

Tapping "retry" re-sends the same temp message through the same `sendMessage` flow. The temp ID stays the same so if somehow the original send *did* go through (network was slow, not actually down), the ACK with the same `tempId` is still matched correctly.

---

## ─────────────────────────────────────
## PHASE 5 — Receiving Messages
## ─────────────────────────────────────

---

**Interviewer:**

How do you set up the WebSocket connection and handle incoming messages?

---

**Candidate:**

```javascript
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/ws");
  wsRef.current = ws;

  ws.onopen = () => {
    setConnectionStatus("connected");
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleIncomingEvent(data);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    setConnectionStatus("disconnected");
    scheduleReconnect();
  };

  return () => {
    ws.close(); // cleanup when component unmounts
  };
}, []); // run once on mount
```

The `handleIncomingEvent` function is the central router for all server events:

```javascript
const handleIncomingEvent = (data) => {
  switch (data.type) {

    case "MESSAGE_RECEIVED":
      // New message from someone else
      setMessages(prev => ({
        ...prev,
        [data.message.conversationId]: [
          ...(prev[data.message.conversationId] || []),
          data.message
        ]
      }));
      updateConversationLastMessage(data.message);
      // If this conversation is open → mark as seen
      if (data.message.conversationId === activeConvIdRef.current) {
        markAsSeen(data.message.conversationId, data.message.id);
      } else {
        incrementUnreadCount(data.message.conversationId);
      }
      break;

    case "MESSAGE_ACK":
      // Our sent message was confirmed by server
      clearTimeout(pendingAcks.current[data.tempId]);
      replaceMessage(data.tempId, data.realId, "sent");
      break;

    case "STATUS_UPDATE":
      // A message's status changed (delivered/seen)
      updateMessageStatus(data.messageId, data.status);
      break;

    case "TYPING_UPDATE":
      handleTypingUpdate(data.conversationId, data.userId, data.isTyping);
      break;

    case "USER_ONLINE":
      setOnlineUsers(prev => new Set([...prev, data.userId]));
      break;

    case "USER_OFFLINE":
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
      break;
  }
};
```

---

**Interviewer:**

You use `activeConvIdRef.current` instead of `activeConvId`. Why?

---

**Candidate:**

Because `handleIncomingEvent` is defined inside the `useEffect` that runs once on mount. At that point, `activeConvId` is captured as its initial value — which is `null`. Even when the user later opens a conversation and `activeConvId` state updates to `"conv_456"`, the closure inside the WebSocket handler still sees the old `null`.

A `useRef` solves this because refs are mutable and are not captured by closures:

```javascript
const activeConvIdRef = useRef(null);

// Keep ref in sync with state
useEffect(() => {
  activeConvIdRef.current = activeConvId;
}, [activeConvId]);

// Inside WS handler — reads the CURRENT value, not the captured one
if (data.message.conversationId === activeConvIdRef.current) { ... }
```

This is a subtle but important React pattern — using refs to "escape" stale closure values inside long-lived callbacks.

---

**Interviewer:**

That's a good catch. What about message ordering? Two messages sent at the same millisecond — how do you guarantee they display in the right order?

---

**Candidate:**

There are two ordering problems:

**Problem 1: Client-side ordering**

Messages are appended as they arrive. If two messages come through the WebSocket in the wrong order (network reordering), the list is wrong.

Solution: always sort by `timestamp` after inserting:

```javascript
const addMessage = (convId, message) => {
  setMessages(prev => ({
    ...prev,
    [convId]: [...(prev[convId] || []), message]
      .sort((a, b) => a.timestamp - b.timestamp)
  }));
};
```

**Problem 2: Deduplication on reconnect**

When the WebSocket reconnects and you fetch missed messages, the server might send a message you already have. Without deduplication, the same message appears twice.

Solution: check by message ID before inserting:

```javascript
const addMessage = (convId, message) => {
  setMessages(prev => {
    const existing = prev[convId] || [];
    const alreadyExists = existing.some(m => m.id === message.id);
    if (alreadyExists) return prev; // skip duplicate
    return {
      ...prev,
      [convId]: [...existing, message].sort((a, b) => a.timestamp - b.timestamp)
    };
  });
};
```

---

## ─────────────────────────────────────
## PHASE 6 — Typing Indicators
## ─────────────────────────────────────

---

**Interviewer:**

Show me how typing indicators work.

---

**Candidate:**

The goal: show "Bob is typing..." when Bob is actively typing, and remove it when he stops.

The problem without optimization:

```
Bob types: "H" → emit TYPING_START
           "e" → emit TYPING_START again
           "l" → emit TYPING_START again
           ...
           (200 events for a 200-character message)
```

That's way too many WebSocket events. I debounce it:

```javascript
// In Bob's client (the person typing)
const typingTimeoutRef = useRef(null);
const isTypingRef = useRef(false);

const handleInputChange = (e) => {
  setInputValue(e.target.value);

  // Only emit TYPING_START if not already in "typing" state
  if (!isTypingRef.current) {
    wsRef.current.send(JSON.stringify({
      type: "TYPING_START",
      conversationId: activeConvId
    }));
    isTypingRef.current = true;
  }

  // Reset the stop timer on every keystroke
  clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    wsRef.current.send(JSON.stringify({
      type: "TYPING_STOP",
      conversationId: activeConvId
    }));
    isTypingRef.current = false;
  }, 1500); // 1.5s after last keystroke → stop
};
```

The flow:

```
Bob types first character:
  → TYPING_START emitted (only once)
  → 1.5s timer starts

Bob types more characters:
  → Timer resets each time
  → No more events emitted

Bob stops typing for 1.5s:
  → TYPING_STOP emitted
  → isTyping reset to false

If Bob types again after stopping:
  → TYPING_START emitted again (because isTyping was reset)
```

On Alice's side — the receiver:

```javascript
case "TYPING_UPDATE":
  if (data.isTyping) {
    setTypingUsers(prev => ({
      ...prev,
      [data.conversationId]: [...(prev[data.conversationId] || []), data.userId]
    }));
  } else {
    setTypingUsers(prev => ({
      ...prev,
      [data.conversationId]: (prev[data.conversationId] || [])
        .filter(id => id !== data.userId)
    }));
  }
  break;
```

Rendering the indicator:

```jsx
{typingUsers[activeConvId]?.length > 0 && (
  <TypingIndicator>
    {getTypingText(typingUsers[activeConvId])}
    {/* "Bob is typing..." or "Bob and Alice are typing..." */}
  </TypingIndicator>
)}
```

---

**Interviewer:**

What if Bob closes the tab mid-message without finishing? TYPING_STOP never fires. Alice sees "Bob is typing..." forever.

---

**Candidate:**

Two safety nets:

**Safety net 1 — Server-side timeout**

The server tracks typing state per user. If no `TYPING_STOP` arrives within 5 seconds of the last `TYPING_START`, the server automatically broadcasts `TYPING_STOP` to all recipients. This is the most reliable fix — the frontend can't be trusted to always fire cleanup events.

**Safety net 2 — Client-side auto-clear**

On Alice's side, when a `TYPING_UPDATE` with `isTyping: true` arrives, start a local 5-second timer. If no update arrives within 5 seconds, assume the user stopped:

```javascript
case "TYPING_UPDATE":
  if (data.isTyping) {
    addTypingUser(data.conversationId, data.userId);

    // Auto-clear in 5s if no further update
    clearTimeout(typingTimeouts.current[data.userId]);
    typingTimeouts.current[data.userId] = setTimeout(() => {
      removeTypingUser(data.conversationId, data.userId);
    }, 5000);
  }
  break;
```

Defense in depth: both server-side and client-side guards.

---

**Interviewer:**

Good. That answer shows you've thought about failure modes, not just the happy path.

---

## ─────────────────────────────────────
## PHASE 7 — Read Receipts
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through read receipts — how does Alice know Bob has seen her message?

---

**Candidate:**

The trigger for "seen" is simple: Bob opens the conversation.

```
Bob opens the chat with Alice:
  → Mark all messages in this conversation as seen
  → Emit: { type: "MARK_SEEN", conversationId, lastMessageId }

Server receives MARK_SEEN:
  → Updates message status in DB
  → Emits to Alice: { type: "STATUS_UPDATE", messageId, status: "seen" }

Alice's client receives STATUS_UPDATE:
  → Finds that message in state
  → Updates status from "delivered" → "seen"
  → Checkmark goes from ✓✓ grey → 🔵🔵 blue
```

The "seen" event only needs to be sent for the *last* message, not every message:

```javascript
// When user opens a conversation or scrolls to see new messages
const markConversationAsSeen = (convId) => {
  const msgs = messages[convId] || [];
  if (msgs.length === 0) return;

  const lastMsg = msgs[msgs.length - 1];
  if (lastMsg.status !== "seen") {
    wsRef.current.send(JSON.stringify({
      type: "MARK_SEEN",
      conversationId: convId,
      lastMessageId: lastMsg.id
    }));

    // Update local state — all messages up to lastMsg become "seen"
    setMessages(prev => ({
      ...prev,
      [convId]: prev[convId].map(msg =>
        msg.timestamp <= lastMsg.timestamp
          ? { ...msg, status: "seen" }
          : msg
      )
    }));
  }
};
```

---

**Interviewer:**

How do you know when to call `markConversationAsSeen`?

---

**Candidate:**

Three triggers:

**1. User opens the conversation**

```javascript
const handleConversationSelect = (convId) => {
  setActiveConvId(convId);
  markConversationAsSeen(convId);
};
```

**2. A new message arrives while the conversation is already open**

```javascript
case "MESSAGE_RECEIVED":
  if (data.message.conversationId === activeConvIdRef.current) {
    markConversationAsSeen(data.message.conversationId);
  }
  break;
```

**3. The page becomes visible after being in the background**

```javascript
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && activeConvIdRef.current) {
    markConversationAsSeen(activeConvIdRef.current);
  }
});
```

This third one is important — if Bob has the tab open but it's not the active window, messages show as "delivered" not "seen". When he tabs back in, `visibilitychange` fires and we mark them seen.

---

## ─────────────────────────────────────
## PHASE 8 — Scroll Behavior
## ─────────────────────────────────────

---

**Interviewer:**

Scroll behavior in chat is tricky. Walk me through how you handle it.

---

**Candidate:**

There are three scenarios:

**Scenario 1: New message arrives — user is at the bottom**

Auto-scroll to keep them at the bottom. They're actively reading the conversation.

**Scenario 2: New message arrives — user has scrolled up to read history**

Do NOT auto-scroll. That would yank them away from what they're reading. Instead, show a badge: "↓ 1 new message from Bob"

**Scenario 3: User sends a message**

Always auto-scroll. It's their own message — they want to see it.

Implementation:

```javascript
const messageListRef = useRef(null);
const bottomRef = useRef(null);
const [isAtBottom, setIsAtBottom] = useState(true);
const [newMessageBadge, setNewMessageBadge] = useState(null);

// Track if user is at bottom
const handleScroll = () => {
  const el = messageListRef.current;
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  setIsAtBottom(distanceFromBottom < 100); // within 100px of bottom
};

// When messages list changes
useEffect(() => {
  const lastMsg = messages[activeConvId]?.at(-1);
  if (!lastMsg) return;

  if (lastMsg.senderId === currentUserId) {
    // My own message — always scroll
    scrollToBottom("smooth");
  } else if (isAtBottom) {
    // Their message, I'm at bottom — scroll
    scrollToBottom("smooth");
  } else {
    // Their message, I'm reading history — show badge
    setNewMessageBadge(`↓ New message from ${lastMsg.senderName}`);
  }
}, [messages[activeConvId]?.length]);

const scrollToBottom = (behavior = "instant") => {
  bottomRef.current?.scrollIntoView({ behavior });
};
```

The badge:

```jsx
{newMessageBadge && (
  <NewMessageBadge
    onClick={() => { scrollToBottom("smooth"); setNewMessageBadge(null); }}
  >
    {newMessageBadge}
  </NewMessageBadge>
)}
```

---

**Interviewer:**

Now — loading older message history. User scrolls to the top. What happens?

---

**Candidate:**

This is reverse pagination. As the user scrolls up, we load older messages and prepend them to the top of the list.

The challenge: inserting messages at the top shifts the scroll position down visually. If you scroll to the very top and 20 new messages load above you, your viewport snaps down — very jarring.

Solution: **preserve scroll position** before inserting:

```javascript
const loadOlderMessages = async () => {
  if (loadingHistory || !hasMoreHistory) return;
  setLoadingHistory(true);

  const el = messageListRef.current;
  const scrollHeightBefore = el.scrollHeight; // measure BEFORE insert

  const oldestMessage = messages[activeConvId][0];
  const olderMessages = await fetchMessages({
    conversationId: activeConvId,
    before: oldestMessage.timestamp,
    limit: 20
  });

  // Prepend messages
  setMessages(prev => ({
    ...prev,
    [activeConvId]: [...olderMessages, ...prev[activeConvId]]
  }));

  // After React re-renders, restore scroll position
  requestAnimationFrame(() => {
    const scrollHeightAfter = el.scrollHeight;
    const addedHeight = scrollHeightAfter - scrollHeightBefore;
    el.scrollTop += addedHeight; // maintain visual position
  });

  setHasMoreHistory(olderMessages.length === 20);
  setLoadingHistory(false);
};
```

Trigger using IntersectionObserver on the top sentinel:

```javascript
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) loadOlderMessages(); },
    { threshold: 0.1 }
  );
  if (topSentinelRef.current) observer.observe(topSentinelRef.current);
  return () => observer.disconnect();
}, [activeConvId, hasMoreHistory]);
```

---

## ─────────────────────────────────────
## PHASE 9 — Reconnection
## ─────────────────────────────────────

---

**Interviewer:**

The WebSocket drops. What do you do?

---

**Candidate:**

Three things need to happen: detect the drop, reconnect automatically, and sync missed messages.

**Step 1 — Detect and show status**

```javascript
ws.onclose = () => {
  setConnectionStatus("disconnected");
  scheduleReconnect();
};
```

Show a banner:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠  Reconnecting... Your messages will send when connected  │
└─────────────────────────────────────────────────────────────┘
```

**Step 2 — Exponential backoff reconnection**

```javascript
const reconnectAttempt = useRef(0);
const reconnectTimerRef = useRef(null);

const scheduleReconnect = () => {
  const attempt = reconnectAttempt.current;
  const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
  // 1s, 2s, 4s, 8s, 16s, 30s (capped)

  console.log(`Reconnecting in ${delay}ms (attempt ${attempt + 1})`);
  setConnectionStatus("reconnecting");

  reconnectTimerRef.current = setTimeout(() => {
    reconnectAttempt.current += 1;
    connect(); // re-run the WebSocket setup
  }, delay);
};

// On successful connect
ws.onopen = () => {
  setConnectionStatus("connected");
  reconnectAttempt.current = 0; // reset counter
  syncMissedMessages();          // fetch what we missed
};
```

**Step 3 — Sync missed messages after reconnect**

```javascript
const syncMissedMessages = async () => {
  const lastTimestamp = getLastReceivedTimestamp(); // from state
  const missed = await fetch(
    `/api/messages/since?timestamp=${lastTimestamp}`
  ).then(r => r.json());

  missed.forEach(msg => addMessage(msg.conversationId, msg));
  // addMessage already deduplicates by ID, so no double-messages
};
```

---

**Interviewer:**

User typed a message while offline. WebSocket is down. What happens to that message?

---

**Candidate:**

Without an offline queue — the send fails silently or shows the ⚠️ failed state. That's acceptable for a first version.

For a production-grade implementation, I'd add a queue:

```javascript
const offlineQueue = useRef([]);

const sendMessage = (text) => {
  const message = { tempId: `temp_${Date.now()}`, text, conversationId: activeConvId };

  // Always add to UI optimistically
  addMessageToState({ ...message, status: "sending" });

  if (wsRef.current?.readyState === WebSocket.OPEN) {
    ws.current.send(JSON.stringify({ type: "SEND_MESSAGE", ...message }));
  } else {
    // Queue for later
    offlineQueue.current.push(message);
    updateMessageStatus(message.tempId, "queued");
  }
};
```

When connection restores:

```javascript
ws.onopen = () => {
  // Flush queue
  const queue = [...offlineQueue.current];
  offlineQueue.current = [];
  queue.forEach(msg => {
    updateMessageStatus(msg.tempId, "sending");
    ws.current.send(JSON.stringify({ type: "SEND_MESSAGE", ...msg }));
  });
};
```

---

## ─────────────────────────────────────
## PHASE 10 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

A conversation has 5,000 messages. Rendering all of them at once — what happens?

---

**Candidate:**

The DOM becomes very expensive. 5,000 message bubbles means:
- 5,000 DOM nodes at minimum (likely 15,000+ with nested elements)
- Every new message causes the entire list to re-render
- Scrolling becomes janky — browser repaints the entire 5,000-node tree

The solution is **virtual scrolling** — render only the messages currently visible in the viewport:

```
Without virtual scroll:
  5,000 messages = 5,000 DOM nodes

With virtual scroll:
  5,000 messages = ~15 DOM nodes (only visible ones)
  Other 4,985 messages are mathematical positions, not DOM elements

As user scrolls:
  → Reuse existing DOM nodes, update their content
  → Never more than ~15 nodes in the DOM at once
```

Libraries that handle this: `react-window`, `@tanstack/virtual`, `react-virtuoso` (which handles variable-height items — important since messages have different lengths).

For message bubbles specifically, `react-virtuoso` is the best choice because it:
- Handles variable heights (short vs long messages)
- Supports "start from bottom" (like chat apps)
- Handles "scroll up to load more" built-in

---

**Interviewer:**

What about re-renders? When one message's status changes (delivered → seen), does the entire list re-render?

---

**Candidate:**

Without optimization — yes. Any state update in the parent triggers a full re-render of the list.

Two fixes:

**1. `React.memo` on `MessageBubble`**

```javascript
const MessageBubble = React.memo(({ message }) => {
  return (
    <div className={`bubble ${message.senderId === currentUserId ? "sent" : "received"}`}>
      <p>{message.text}</p>
      <StatusIcon status={message.status} />
    </div>
  );
});
```

Now `MessageBubble` only re-renders if its specific `message` prop changes. A status update on message 4,999 won't re-render messages 1 through 4,998.

**2. Normalize state structure**

Instead of storing all messages as an array (where updating one item creates a new array reference and re-renders everything), store them in a normalized map:

```javascript
// Normalized: keyed by ID
{
  "msg_abc": { id: "msg_abc", text: "Hey", status: "seen" },
  "msg_def": { id: "msg_def", text: "You free?", status: "delivered" }
}
```

With Redux Toolkit or Zustand, you can update a single message without creating a new reference for the entire collection.

---

## ─────────────────────────────────────
## PHASE 11 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

We're almost at time. Summarize the architecture and the most important decisions.

---

**Candidate:**

```
┌──────────────────────────────────────────────────────────────────┐
│                  CHAT APP ARCHITECTURE SUMMARY                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Transport:     WebSocket — bidirectional, persistent, low       │
│                 latency. Manual reconnection with exp. backoff.  │
│                                                                  │
│  Connection:    Lives at top-level App. useRef for WS instance.  │
│                 Central event handler routes all incoming events. │
│                                                                  │
│  Sending:       Optimistic update first, server ACK second.      │
│                 tempId → realId swap on ACK. Timeout → "failed". │
│                                                                  │
│  Receiving:     Sort by timestamp after insert.                  │
│                 Deduplicate by message ID (for reconnect sync).  │
│                                                                  │
│  Typing:        Emit TYPING_START once, TYPING_STOP after 1.5s   │
│                 idle. Server auto-clears after 5s (safety net).  │
│                                                                  │
│  Read receipts: MARK_SEEN on conversation open, new msg arrival, │
│                 and visibilitychange. Update status chain.        │
│                                                                  │
│  Scroll:        Auto-scroll only if at bottom or own message.    │
│                 Badge for new messages when reading history.      │
│                 Preserve scroll position when prepending history. │
│                                                                  │
│  Reconnect:     Exponential backoff (1s → 2s → 4s → max 30s).   │
│                 Sync missed messages via REST after reconnect.    │
│                                                                  │
│  Performance:   Virtual scroll for long threads.                 │
│                 React.memo on MessageBubble.                     │
│                 useRef to avoid stale closures in WS handler.    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Key decisions and why:**

| Decision | Why |
|----------|-----|
| WebSocket over SSE | Need bidirectional — typing and sending both need push |
| WS at App level, not ChatWindow | Events affect sidebar, multiple conversations |
| useRef for WS instance | Don't want re-render when WS reconnects |
| useRef for activeConvId in handler | Stale closure — state captured at mount time |
| Optimistic update | UX — messages appear instantly |
| tempId → realId swap | Reconcile optimistic with real server data |
| Sort + deduplicate on insert | Handle out-of-order delivery and reconnect resync |
| Exponential backoff | Avoid thundering herd on server restart |
| `scrollHeight` preservation on history load | Don't yank user's viewport when prepending |

---

**Interviewer:**

One last question — what would you add with another 30 minutes?

---

**Candidate:**

In priority order:

1. **Message search** — search within a conversation by keyword. This is a common feature and needs either client-side text search (fast, but only over loaded messages) or a search API call.

2. **Unread count badge** — show the total unread messages count across all conversations in the browser tab title or favicon badge. High value, low effort.

3. **Notification sound** — play a subtle sound when a new message arrives and the window isn't focused. `Audio` API, user can mute.

4. **Image/file preview** — when a message contains an image URL, render a thumbnail inline. Click to expand.

5. **Message reactions** — emoji reactions on individual messages. Requires a new event type and a small overlay UI per message.

---

**Interviewer:**

Excellent work. Very thorough.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Asked about 1-to-1 vs group before designing data model
✅  Compared WebSocket vs SSE vs Polling with clear tradeoffs
✅  Explained WHY WebSocket lives at App level (cross-conversation events)
✅  Identified stale closure problem with activeConvId in WS handler
✅  Described optimistic update AND the failure/retry case
✅  Explained typing indicator debounce with server-side safety net
✅  Described MARK_SEEN triggered by three events (open, new msg, visibilitychange)
✅  Explained scroll-position preservation when prepending history
✅  Described exponential backoff with actual delay formula
✅  Mentioned deduplication for reconnect sync
✅  Discussed virtual scroll for performance
✅  Mentioned React.memo with a correct explanation
```

---

## What Would Have Hurt the Score

```
❌  Assuming WebSocket without discussing alternatives
❌  Putting WebSocket connection inside ChatWindow (misses cross-conversation events)
❌  Not knowing about stale closures / not using useRef for WS callbacks
❌  No failure case for optimistic update ("what if server fails?")
❌  Typing indicator on every keystroke (not debounced)
❌  Not knowing about scroll-position preservation when prepending
❌  No reconnection logic or just "reload the page"
❌  No message deduplication (messages appear twice after reconnect)
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | WebSocket vs SSE vs Polling | "How does the browser talk to server in real time?" |
| 2 | Bidirectional communication | "Why not SSE?" |
| 3 | Stale closure / useRef | "Why activeConvIdRef instead of activeConvId?" |
| 4 | Optimistic UI update | "Walk me through sending a message" |
| 5 | tempId → realId reconciliation | "What is the ACK for?" |
| 6 | Failure state + retry | "What if the server can't be reached?" |
| 7 | Typing debounce | "Show me typing indicator implementation" |
| 8 | Server-side safety net | "What if Bob closes the tab mid-message?" |
| 9 | Read receipt triggers | "How do you know when to call markAsSeen?" |
| 10 | Scroll position preservation | "User scrolls to top and history loads — what happens?" |
| 11 | Exponential backoff | "WebSocket drops. What do you do?" |
| 12 | Virtual scrolling | "5,000 messages. What happens?" |
