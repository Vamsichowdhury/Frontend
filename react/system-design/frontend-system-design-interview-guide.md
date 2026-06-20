# Frontend System Design Interview Guide

## What's Expected

**Format varies by company, but typically:**

- ~45–60 minute round
- Primarily focused on **visual/architectural discussion**, but the balance depends on the problem size.
- For **smaller system design questions** (e.g., Typeahead/Autocomplete, Poll Widget, Pagination, Infinite Scroll, File Upload, Shopping Cart), interviewers often expect you to write code or implement key parts of the solution. In these cases, coding can be a significant portion of the discussion.
- For **larger system design questions** (e.g., YouTube, Google Docs, Netflix, Instagram, WhatsApp), the interview is usually **80% visual/architectural discussion** and **20% code**.
- You'll typically **draw/whiteboard** (or use a Figma, Excalidraw, or similar tool) to explain your design and thought process.
- When coding is required, it's usually focused on core components, APIs, data structures, or pseudocode rather than production-ready code.
- Interviewers care more about **how you think, make trade-offs, and communicate your decisions** than about pixel-perfect implementations.

## Common Frontend System Design Questions

### Beginner/Mid-level

- Design a URL shortener UI
- Design a photo gallery/carousel
- Design a todo app with offline support
- Design a shopping cart
- Design autocomplete/search suggestions
- Design a notification system

### Mid/Senior-level

- Design Netflix/YouTube video player
- Design Gmail/email client (virtualization, infinite scroll)
- Design a collaborative document editor (like Google Docs)
- Design a real-time chat application
- Design an analytics dashboard
- Design a file upload/download system
- Design a social media feed

### Senior-level

- Design a collaborative whiteboard
- Design a complex state management system
- Design a PWA with sync and offline capabilities
- Design high-performance data visualization

---

## What They're Actually Evaluating

1. **Architecture & Structure** — Do you think in components, layers, data flow?
2. **Trade-offs** — Can you discuss performance vs. complexity vs. user experience?
3. **Scalability** — How would this handle 1M users? 10M events/sec?
4. **Edge Cases** — Offline, poor network, browser limits, accessibility
5. **Communication** — Can you explain your thinking clearly?

---

## FAQs & Common Doubts

### Q: Do I need to write actual code?

**A:** Rarely. They want pseudocode/component structure. If they ask, show a React component skeleton or describe state management—not a full implementation.

### Q: Should I draw on paper or write?

**A:** Ask! Most companies use Figma, Excalidraw, or physical whiteboard. You'll have time to ask for clarification.

### Q: What should I draw?

**A:** Start with:

- High-level architecture diagram (client, server, DB, cache)
- Component hierarchy
- Data flow
- Then zoom into specific parts they ask about

### Q: How technical should I get?

**A:** Match their cues. If they ask about rendering performance, go deep. If they don't, stay at component level.

### Q: What if I don't know the perfect answer?

**A:** Say so. Interviewers want to see how you reason through unknowns—propose a solution, identify tradeoffs, ask clarifying questions.

### Q: Should I use specific frameworks (React, Vue)?

**A:** Mention your preferred framework but keep concepts framework-agnostic. The patterns matter more than syntax.

### Q: What about APIs/backend?

**A:** Interviewers expect you to discuss frontend-backend contracts (API shape, error handling, data structure), but implementation is secondary. You're not designing the backend.

### Q: How do I handle performance questions?

**A:** Know these terms:

- Virtualization/windowing (render only visible items)
- Code splitting & lazy loading
- Memoization (React.memo, useMemo)
- Debounce/throttle
- Progressive enhancement
- Caching strategies

---

## Strong Interview Strategy

1. **Clarify requirements first** — ask about scale, devices, offline needs, browser support
2. **Start simple** — draw basic architecture, then iterate
3. **Discuss tradeoffs explicitly** — "We could do X, but that trades Y for Z"
4. **Know your constraints** — browser memory, network latency, rendering budget
5. **Ask follow-ups** — "Want me to deep-dive into state management?" / "Should we optimize for mobile?"
6. **Use real examples** — "Like Gmail does with conversation threading..."

---

## Quick Prep Checklist

- [ ] Pick 3-4 real apps you use (Netflix, Gmail, Twitter) and mentally design them
- [ ] Draw component hierarchies on paper for those apps
- [ ] Practice explaining tradeoffs (client-side rendering vs. server-side, local state vs. global)
- [ ] Know basic performance optimization techniques
- [ ] Be ready to discuss API design (request/response shape, error handling)
- [ ] Know your framework's patterns (React hooks, Redux, Context, etc.) but keep it conceptual

---

## Key Takeaways

- **It's not about perfection** — it's about your reasoning process
- **Communication matters most** — you're working with someone else on the design
- **Ask clarifying questions** — don't assume scope
- **Start broad, then drill down** — architecture first, details second
- **Discuss tradeoffs** — every design choice has pros and cons
- **Know your fundamentals** — performance, scalability, user experience
