# Real-time Chat App — Interview Transcript

**Level:** Medium-Hard | **Duration:** 50-70 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Architecture & Transport Layer | ⏹️ |
| 3 | Sending & Receiving Messages | ⏹️ |
| 4 | Typing Indicators & Read Receipts | ⏹️ |
| 5 | Reliability & Edge Cases | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a real-time chat application. What do you need to know?"

**What candidate should ask:**
- [ ] 1-to-1 or group chat or both?
- [ ] Do we need typing indicators?
- [ ] Read receipts (sent/delivered/seen)?
- [ ] Online/offline status?
- [ ] Message history — how far back?
- [ ] Do we handle file/image attachments?
- [ ] What scale? (100 users or 1M?)

**Interviewer answers:**
> "1-to-1 and group. Yes typing indicators. Yes read receipts. Yes online status. Last 100 messages. No attachments for now. Assume ~10k concurrent users."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Architecture & Transport Layer

**Interviewer:**
> "How would messages travel between users — HTTP or WebSocket? Why?"

**Expected comparison:**
```
HTTP Polling: client asks "any new messages?" every N seconds
  → Latency: 1-2 seconds
  → Server load: high (constant requests even when idle)
  → Simple to implement

Long Polling: client asks, server holds response until new message
  → Better latency
  → Easier than WebSocket
  → Doesn't scale well

WebSocket: persistent two-way connection
  → ~10ms latency
  → Push model (server pushes immediately)
  → Best for real-time chat
  → More complex connection management
```

**Expected component layout:**
```
<ChatApp>
├── <ConversationList>    (left panel)
└── <ChatWindow>
    ├── <MessageList>
    ├── <TypingIndicator>
    └── <MessageInput>
```

**Interviewer pushback:**
> "What's the WebSocket connection lifecycle?"

**Expected:** open → exchange messages (bidirectional) → close. Also: handle error, handle unexpected close, reconnect logic.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Sending & Receiving Messages

**Interviewer:**
> "Walk me through what happens when a user sends a message."

**Expected optimistic update:**
```javascript
const sendMessage = (text) => {
  const tempId = `temp_${Date.now()}`;
  // 1. Add to local state immediately (optimistic)
  setMessages(prev => [...prev, {
    id: tempId, text, senderId: myId,
    status: "sending", timestamp: Date.now()
  }]);

  // 2. Send via WebSocket
  ws.current.send(JSON.stringify({ type: "SEND", tempId, text, convId }));
};

// 3. Server ACK → replace tempId with real ID
const handleAck = ({ tempId, realId }) => {
  setMessages(prev => prev.map(m =>
    m.id === tempId ? { ...m, id: realId, status: "delivered" } : m
  ));
};
```

**Interviewer pushback:**
> "Why optimistic update instead of waiting for server confirmation?"

**Expected:** UX — user sees their message instantly. Feels responsive. If server fails, we revert and show an error. Apps like iMessage and WhatsApp do this.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Typing Indicators & Read Receipts

**Interviewer:**
> "Implement typing indicators without spamming the server."

**Expected debounced typing:**
```javascript
const typingTimeout = useRef(null);

const handleTyping = () => {
  ws.current.send(JSON.stringify({ type: "TYPING_START" }));
  clearTimeout(typingTimeout.current);
  typingTimeout.current = setTimeout(() => {
    ws.current.send(JSON.stringify({ type: "TYPING_STOP" }));
  }, 1500);
};
```

**Interviewer:**
> "How do you show 'seen' under messages?"

**Expected:**
- When user opens a conversation, emit `MARK_SEEN` event
- Server broadcasts to sender: "User B saw your message at 2:34pm"
- Sender updates message status to "seen"

**Interviewer pushback:**
> "What if both users are typing at the same time?"

**Expected:** Each user's typing state is tracked separately. Show "Alice and Bob are typing..." — could list all typing users.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Reliability & Edge Cases

**Interviewer:**
> "Connection drops. User sends a message. What happens?"

**Expected:**
1. Catch WebSocket send error
2. Mark message as "failed" with retry button
3. On reconnect, flush pending messages queue
4. Or: Background Sync API queues the send for later

**Interviewer:**
> "Auto-scroll to bottom. But what if user is reading old messages?"

**Expected:**
- Track `isAtBottom` scroll state
- Only auto-scroll if user is at bottom
- Show "↓ New message from Alice" badge when not at bottom
- User can click badge to jump to bottom

**Interviewer final question:**
> "How do you handle messages arriving out of order?"

**Expected:** Sort messages by timestamp after inserting. Also deduplicate by message ID — server might resend on reconnect.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
