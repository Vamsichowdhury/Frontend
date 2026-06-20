# Real-time Chat Application - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 50-70 minutes  
**Tech Stack:** React + WebSocket  

---

## Problem Statement

Build a real-time chat UI where:
- Users can send and receive messages instantly
- Multiple chat rooms/conversations
- Typing indicators ("John is typing...")
- Message read receipts (sent/delivered/seen)
- Online/offline status per user
- Message history loaded on scroll up (pagination)
- Connection drop and reconnection handled

---

## Real-World Examples

- Slack messaging
- WhatsApp Web
- Discord channels
- Facebook Messenger
- Intercom support chat

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| WebSocket integration | Core real-time communication |
| State management at scale | Messages, users, rooms all in sync |
| Optimistic updates | Message appears before server confirms |
| Message ordering | Handle out-of-order delivery |
| Scroll management | Auto-scroll, load older messages |
| Reconnection logic | Handle unstable connections |

---

## What You'll Learn

- WebSocket vs HTTP polling tradeoffs
- Real-time state synchronization patterns
- Optimistic UI for message sending
- Auto-scroll to bottom for new messages
- Scroll-up to load older messages (reverse infinite scroll)
- Typing indicator debounce
- Connection lifecycle (open, close, error, reconnect)
- Message deduplication

---

## High-Level Architecture

```
<ChatApp />
├── <ConversationList />          (left sidebar)
│   └── <ConversationItem /> × N  (preview + unread count)
│
└── <ChatWindow conversationId={id} />
    ├── <MessageHeader />          (avatar, name, status)
    ├── <MessageList />
    │   ├── <LoadOlderMessages />  (top — scroll trigger)
    │   ├── <MessageBubble /> × N
    │   └── <TypingIndicator />    (bottom when others type)
    └── <MessageInput />
        ├── <TextArea />
        └── <SendButton />
```

---

## Data Structure

```javascript
// Message shape
{
  id: "msg_abc123",
  conversationId: "conv_456",
  senderId: "user_789",
  text: "Hey! How are you?",
  timestamp: 1699000000000,
  status: "sent" | "delivered" | "seen",
  type: "text" | "image" | "file"
}

// Conversation shape
{
  id: "conv_456",
  participants: ["user_789", "user_012"],
  lastMessage: { text: "...", timestamp: ... },
  unreadCount: 3
}

// State
const [conversations, setConversations] = useState([]);
const [messages, setMessages] = useState({});  // { convId: [messages] }
const [typingUsers, setTypingUsers] = useState({}); // { convId: [userId] }
const [onlineUsers, setOnlineUsers] = useState(new Set());
```

---

## Data Flow

```
App mounts:
  → open WebSocket connection to server
  → server sends initial conversations list
  → server sends online user IDs

User opens conversation:
  → fetch message history (HTTP GET — paginated)
  → mark messages as "seen" (emit via WS)

User sends message:
  → create message object with temp ID
  → OPTIMISTICALLY add to local state (appears immediately)
  → emit via WebSocket: { type: "SEND_MESSAGE", ... }
  → server confirms with real ID and "delivered" status
  → update local message with real ID

Server sends new message to this client:
  → receive via WebSocket onmessage
  → append to messages[conversationId]
  → update conversation lastMessage + unreadCount
  → auto-scroll to bottom if user is at bottom

User is typing:
  → emit TYPING_START after first keystroke
  → debounce: emit TYPING_STOP after 1s idle
  → other clients see typing indicator

Connection drops:
  → WebSocket onclose fires
  → show "Reconnecting..." banner
  → exponential backoff: retry in 1s, 2s, 4s, 8s...
  → on reconnect, fetch missed messages
```

---

## Key Concepts to Learn

### 1. WebSocket Connection Management
```javascript
const wsRef = useRef(null);

const connect = () => {
  wsRef.current = new WebSocket("wss://api.example.com/ws");

  wsRef.current.onopen = () => {
    console.log("Connected");
    setConnectionStatus("connected");
  };

  wsRef.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleIncomingMessage(data);
  };

  wsRef.current.onerror = (error) => {
    console.error("WS Error", error);
  };

  wsRef.current.onclose = () => {
    setConnectionStatus("disconnected");
    scheduleReconnect(); // exponential backoff
  };
};

useEffect(() => {
  connect();
  return () => wsRef.current?.close(); // cleanup on unmount
}, []);
```

### 2. Optimistic Message Update
```javascript
const sendMessage = (text) => {
  const tempId = `temp_${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    text,
    senderId: currentUserId,
    timestamp: Date.now(),
    status: "sending"
  };

  // Show immediately (optimistic)
  setMessages(prev => ({
    ...prev,
    [activeConvId]: [...(prev[activeConvId] || []), optimisticMessage]
  }));

  // Send to server
  wsRef.current.send(JSON.stringify({
    type: "SEND_MESSAGE",
    tempId,
    text,
    conversationId: activeConvId
  }));
};

// On server ACK, replace tempId with real ID
const handleAck = ({ tempId, realId }) => {
  setMessages(prev => ({
    ...prev,
    [activeConvId]: prev[activeConvId].map(msg =>
      msg.id === tempId ? { ...msg, id: realId, status: "delivered" } : msg
    )
  }));
};
```

### 3. Auto-scroll to Bottom
```javascript
const bottomRef = useRef(null);
const [isAtBottom, setIsAtBottom] = useState(true);

// Auto-scroll only if user is already at bottom
useEffect(() => {
  if (isAtBottom) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);

// Track scroll position
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
};

return (
  <div onScroll={handleScroll}>
    {messages.map(msg => <MessageBubble key={msg.id} {...msg} />)}
    <div ref={bottomRef} />
  </div>
);
```

### 4. Typing Indicator
```javascript
const typingTimeoutRef = useRef(null);

const handleInput = () => {
  wsRef.current.send(JSON.stringify({ type: "TYPING_START" }));

  clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    wsRef.current.send(JSON.stringify({ type: "TYPING_STOP" }));
  }, 1000);
};
```

---

## Implementation Phases

### Phase 1 — Static Chat UI
- Conversation list + chat window layout
- Message bubbles (sent vs received styling)

### Phase 2 — WebSocket Connection
- Open connection on mount
- Receive and display messages
- Send messages

### Phase 3 — Optimistic Updates
- Message appears immediately on send
- Server confirms and updates

### Phase 4 — Advanced Features
- Typing indicators
- Read receipts
- Online status

### Phase 5 — Reliability
- Reconnection logic
- Load older messages on scroll up
- Message deduplication

---

## Performance Considerations

- Virtualize message list if 1000+ messages in thread
- Don't re-render entire message list on each new message
- Memoize MessageBubble with React.memo
- Batch state updates for rapid incoming messages

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Messages arrive out of order | Sort by timestamp after inserting |
| Duplicate messages | Dedup by message ID before inserting |
| Connection drops while sending | Retry queue; mark as "failed" if unreachable |
| Very long messages | Expand/collapse with "Read more" |
| Incoming message while scrolled up | "↓ New messages" badge at bottom |
| User sends same message twice fast | Debounce send button |

---

## WebSocket vs Polling Tradeoff

| Feature | WebSocket | HTTP Long Polling |
|---------|-----------|-------------------|
| Latency | ~milliseconds | ~1-2 seconds |
| Server load | Lower per message | Higher |
| Complexity | Higher setup | Simpler |
| Firewall issues | Sometimes | Rarely |
| Mobile battery | Better | Worse |
