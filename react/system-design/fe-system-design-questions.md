# Frontend System Design Questions - Curated List

**Target:** Product-based companies (3-5 years experience)  
**Tech Stack:** React  
**Duration per question:** 45-60 minutes

---

## How to Use This Document

1. **Read through all questions** (easy to hard)
2. **Pick 1-2 questions** you want to practice with
3. **Tell me which question** and difficulty level
4. **I'll create a full interview** for that question
5. **Practice, learn, iterate**

**My Recommendation:** Start with Easy or Easy-Medium, then progress to harder ones.

---

# EASY Level Questions

## 1️⃣ Design a Todo App

### What It Tests
- Basic component hierarchy
- Simple state management
- Event handling (add, delete, mark complete)
- Local storage (persistence)

### What You'll Learn
- Component composition
- Props vs State
- Event handlers
- Browser localStorage API
- Controlled vs Uncontrolled components

### Why Companies Ask
- Foundation for more complex problems
- Tests basic React knowledge
- Real-world use case

### Key Concepts
- useState, useEffect
- Form handling
- Array manipulation (filter, map)
- localStorage persistence

### Time to Solve
30-45 minutes

### Real Example
- Todoist, Microsoft Todo, Apple Reminders

### Interview Flow
1. Requirements (what makes a "complete" todo?)
2. Component structure
3. Add/delete/edit functionality
4. Local storage integration
5. Simple styling

### Follow-ups
- Undo functionality?
- Categories/tags?
- Due dates?

---

## 2️⃣ Design an Image Carousel/Slider

### What It Tests
- DOM manipulation and positioning
- State management (current index)
- Event handling (prev/next buttons)
- Auto-play logic
- Responsive design

### What You'll Learn
- CSS positioning and transforms
- setInterval for auto-play
- Keyboard navigation
- Touch events (mobile)
- Performance with large image lists

### Why Companies Ask
- Very common UI pattern
- Tests UX thinking
- Animation knowledge

### Key Concepts
- Position tracking
- setInterval/clearInterval
- Touch vs Click events
- CSS transitions
- Responsive breakpoints

### Time to Solve
35-50 minutes

### Real Examples
- Instagram Stories, Amazon product images, Airbnb listings

### Interview Flow
1. Requirements (auto-play? keyboard nav? touch?)
2. Component structure
3. Navigation logic (prev/next)
4. Auto-play implementation
5. Keyboard and touch support

### Follow-ups
- Infinite loop vs stop at end?
- Dot indicators?
- Swipe detection?

---

## 3️⃣ Design a Search Box with Results

### What It Tests
- Input handling and state
- Basic API integration
- Rendering lists
- Simple error handling
- Loading states

### What You'll Learn
- API fetching patterns
- State management for async data
- Loading and error states
- Simple list rendering
- UX patterns

### Why Companies Ask
- Common feature in all apps
- Tests API thinking
- Simple but practical

### Key Concepts
- fetch() or axios
- useState for data
- useEffect for API calls
- Error boundary concepts
- Loading spinners

### Time to Solve
35-45 minutes

### Real Examples
- Google search, Amazon product search

### Interview Flow
1. Requirements (real-time or on-submit?)
2. API design
3. Fetch and render results
4. Error handling
5. Loading states

### Follow-ups
- What about no results?
- Network timeout?

---

# EASY-MEDIUM Level Questions

## 4️⃣ Design a Typeahead/Autocomplete (RECOMMENDED FOR YOU)

### What It Tests
- **Debouncing** (critical performance concept)
- **Caching** (avoid duplicate API calls)
- **State management** (suggestions, loading, errors)
- **Keyboard navigation** (arrow keys, enter, escape)
- **UX thinking** (loading states, error handling)

### What You'll Learn
- Debouncing patterns (when and why)
- Caching strategies
- Request deduplication
- Keyboard event handling
- Accessibility (ARIA)
- Real-time data handling

### Why Companies Ask
- Very common feature (Google, Twitter, Slack, Figma)
- Tests performance thinking
- Tests UX consideration
- Real-world complexity

### Key Concepts
- Debounce hook
- Cache implementation
- KeyDown event handling
- useEffect cleanup
- Request tracking

### Time to Solve
45-60 minutes

### Real Examples
- Google search, Twitter mentions, Slack user search, GitHub code search

### Interview Flow
1. Requirements clarification
2. High-level architecture
3. Debouncing implementation
4. Caching strategy
5. Keyboard navigation
6. Error handling and edge cases

### Follow-ups
- Cache invalidation?
- Mobile considerations?
- Fuzzy matching?

---

## 5️⃣ Design a Pagination Component

### What It Tests
- State management (current page, page size)
- API integration with query params
- Component composition
- Number range calculations
- Edge cases (first page, last page)

### What You'll Learn
- Query parameter handling
- Pagination math
- API contracts
- Reusable component design
- Edge case handling

### Why Companies Ask
- Foundation for listing pages
- Tests calculation thinking
- Real-world feature

### Key Concepts
- Math (total pages, current page)
- Query params (?page=2&limit=10)
- Previous/Next buttons logic
- Active state styling

### Time to Solve
35-50 minutes

### Real Examples
- E-commerce listing, GitHub PR list, Twitter timeline

### Interview Flow
1. Requirements (total items, page size)
2. Component structure
3. Page calculation logic
4. API integration
5. Edge cases

### Follow-ups
- Jump to page?
- URL persistence (?page=3)?

---

## 6️⃣ Design a Modal/Dialog Component

### What It Tests
- Portal rendering (ReactDOM.createPortal)
- Event handling (close on outside click)
- Keyboard handling (Escape to close)
- Z-index and stacking context
- Accessibility
- Animation

### What You'll Learn
- Portal pattern in React
- Event bubbling and stopping
- Focus management
- Modal accessibility (ARIA roles)
- Overlay handling

### Why Companies Ask
- Common component needed everywhere
- Tests accessibility thinking
- Tests event handling

### Key Concepts
- createPortal
- stopPropagation
- useRef for focus
- Backdrop click handling
- Keyboard events

### Time to Solve
40-50 minutes

### Real Examples
- Confirmation dialogs, alert modals, form modals

### Interview Flow
1. Requirements (backdrop? close button? animation?)
2. Portal concept explanation
3. Component structure
4. Close handlers (button, escape, backdrop)
5. Accessibility features

### Follow-ups
- Multiple modals?
- Animation on open/close?

---

# MEDIUM Level Questions

## 7️⃣ Design a Infinite Scroll / Virtual Scroll

### What It Tests
- Performance optimization (rendering large lists)
- Intersection Observer API
- Virtual scrolling concept
- Pagination with continuous loading
- Memory management

### What You'll Learn
- Intersection Observer API
- Virtual scrolling/windowing
- Performance profiling
- Memory optimization
- Pagination patterns

### Why Companies Ask
- Tests performance thinking
- Common pattern (Twitter, Facebook)
- Advanced browser API knowledge

### Key Concepts
- Intersection Observer
- Virtual list rendering
- Lazy loading
- useCallback optimization
- Memory considerations

### Time to Solve
50-60 minutes

### Real Examples
- Twitter feed, Facebook timeline, Instagram explore, Pinterest

### Interview Flow
1. Requirements (when to load more? scroll threshold?)
2. Architecture (pagination vs infinite scroll difference)
3. Intersection Observer implementation
4. Virtual scrolling for performance
5. Loading states and edge cases

### Follow-ups
- What if data is out of order?
- How to scroll back up?

---

## 8️⃣ Design a Photo Gallery with Filters and Sorting

### What It Tests
- Multiple state management (filters, sorting, search)
- Complex filtering logic
- State synchronization
- Component reusability
- Performance with filters applied

### What You'll Learn
- Complex state management patterns
- Filter and sort algorithms
- URL params (persist filters)
- Debouncing (when changing filters)
- Component composition

### Why Companies Ask
- Tests state management depth
- Real-world e-commerce pattern
- Multiple features interaction

### Key Concepts
- useState for multiple states
- useCallback for memoization
- Filter and sort functions
- Query params for persistence
- Re-render optimization

### Time to Solve
50-60 minutes

### Real Examples
- Pinterest, Unsplash, Amazon product filters

### Interview Flow
1. Requirements (which filters? how to combine?)
2. Data structure
3. Filter logic
4. Sort logic
5. Performance optimization
6. URL synchronization

### Follow-ups
- Save filter preferences?
- Faceted search?

---

## 9️⃣ Design a Shopping Cart

### What It Tests
- State management for cart data
- Quantity management
- Price calculations
- Persistence (localStorage, API)
- Optimistic updates
- Real-time inventory

### What You'll Learn
- Complex state mutations
- Calculation logic (subtotal, tax, total)
- State persistence patterns
- Optimistic UI updates
- Error recovery

### Why Companies Ask
- E-commerce is huge
- Tests real-world complexity
- Multiple interacting features

### Key Concepts
- Cart data structure
- Add/update/remove items
- Quantity validation
- Price calculations
- Error handling for out-of-stock

### Time to Solve
50-60 minutes

### Real Examples
- Amazon, Flipkart, Shopify

### Interview Flow
1. Requirements (persistence? sync across tabs?)
2. Data structure design
3. Add/remove/update functionality
4. Cart calculations
5. Persistence strategy
6. Edge cases (out of stock, price changes)

### Follow-ups
- Multi-currency?
- Abandoned cart?

---

# MEDIUM-HARD Level Questions

## 🔟 Design a Real-time Chat Application

### What It Tests
- WebSocket communication
- State management for messages
- Scroll to bottom on new messages
- Message ordering
- Typing indicators
- Seen/unseen states
- Performance with large chat history

### What You'll Learn
- WebSocket vs polling tradeoffs
- Message ordering in distributed systems
- Optimistic updates
- Real-time state synchronization
- Performance at scale

### Why Companies Ask
- Tests real-time thinking
- Complex state management
- Performance under load

### Key Concepts
- WebSocket connection
- Message queue
- Pagination of history
- Typing indicators
- Read receipts
- Connection loss handling

### Time to Solve
50-70 minutes

### Real Examples
- Slack, Discord, WhatsApp Web, Facebook Messenger

### Interview Flow
1. Requirements (group chat? typing indicators? seen status?)
2. Architecture (WebSocket vs long polling)
3. Connection management
4. Message handling and ordering
5. Scroll behavior
6. Reconnection logic
7. Edge cases

### Follow-ups
- What if user goes offline?
- Message delivery guarantee?

---

## 1️⃣1️⃣ Design a Video Player

### What It Tests
- Video streaming concepts
- Progressive download vs streaming
- Buffering logic
- Quality switching
- Performance with large videos
- State management (play, pause, seek, volume)
- Player controls and timeline

### What You'll Learn
- Video codec and containers
- Buffering strategies
- Adaptive bitrate streaming (HLS, DASH)
- Timeline interaction
- Keyboard shortcuts
- Fullscreen handling

### Why Companies Ask
- Netflix, YouTube, Vimeo all ask this
- Tests architecture at scale
- Multiple systems interaction

### Key Concepts
- HTML5 video element
- Play/pause state
- Seek to time functionality
- Volume control
- Quality selection
- Buffering state tracking
- Error handling

### Time to Solve
60-75 minutes

### Real Examples
- Netflix, YouTube, Vimeo, Twitch

### Interview Flow
1. Requirements (live vs recorded? adaptive bitrate?)
2. Architecture (streaming method)
3. Controls implementation (play, pause, seek, volume)
4. Buffering display
5. Quality switching
6. Error handling
7. Performance considerations

### Follow-ups
- Analytics tracking?
- Subtitle support?
- Offline viewing?

---

## 1️⃣2️⃣ Design a Collaborative Document Editor (Google Docs Style)

### What It Tests
- Real-time collaboration
- Conflict resolution
- Operational transformation or CRDT
- Multiple cursors
- Version history
- Undo/Redo
- Permissions and access control

### What You'll Learn
- Operational transformation concepts
- CRDT (Conflict-free Replicated Data Type)
- Real-time sync
- Undo/Redo implementation
- Collaborative editing challenges

### Why Companies Ask
- Tests advanced system thinking
- Real-time + state management + backend sync
- Complex problem solving

### Key Concepts
- State synchronization
- Conflict resolution
- Cursor positions
- Change tracking
- Version control
- User presence

### Time to Solve
70-90 minutes (very long)

### Real Examples
- Google Docs, Figma, Notion, Office 365

### Interview Flow
1. Requirements (real-time? offline support? version history?)
2. Conflict resolution strategy
3. Architecture (frontend + backend)
4. State management
5. Sync mechanism
6. Undo/Redo implementation
7. Edge cases (offline, network partition)

### Follow-ups
- Permissions?
- Performance with large documents?

---

# HARD Level Questions

## 1️⃣3️⃣ Design a Collaborative Whiteboard (Figma Style)

### What It Tests
- Canvas/SVG rendering
- Real-time shape collaboration
- Undo/Redo with multiple users
- Canvas optimization
- Zoom and pan
- Selection and transformation
- Layers panel

### What You'll Learn
- Canvas rendering performance
- Real-time multiplayer logic
- Complex state for geometric objects
- Rendering optimization
- Event handling in canvas

### Why Companies Ask
- Very complex system
- Tests architecture at scale
- Multiple systems: rendering + sync + state

### Key Concepts
- Canvas or SVG for rendering
- Shape data structure
- Transformation matrix
- Viewport management
- Real-time sync
- Conflict resolution

### Time to Solve
75-90+ minutes

### Real Examples
- Figma, Miro, Excalidraw

### Interview Flow
1. Requirements (which shapes? collaboration?)
2. Data model for shapes
3. Rendering strategy (Canvas vs SVG)
4. Zoom and pan
5. Drawing and selection
6. Real-time sync
7. Undo/Redo in collaborative context

### Follow-ups
- Performance with 10k shapes?
- Mobile support?

---

## 1️⃣4️⃣ Design an Analytics Dashboard

### What It Tests
- Large data visualization
- Real-time data updates
- Filtering and drilling down
- Performance with real-time data
- Chart library integration
- Data aggregation
- Caching strategies

### What You'll Learn
- Real-time data handling
- Chart library patterns
- Data aggregation and rollup
- Performance optimization for dashboards
- Caching at scale

### Why Companies Ask
- B2B SaaS heavily uses this
- Tests performance thinking
- Real-time data complexity

### Key Concepts
- Chart libraries (recharts, Chart.js)
- Real-time WebSocket data
- Data aggregation queries
- Caching for performance
- Filtering and drilling
- Date range selection

### Time to Solve
60-75 minutes

### Real Examples
- Mixpanel, Amplitude, Google Analytics, Datadog

### Interview Flow
1. Requirements (which metrics? real-time? historical data?)
2. Data structure
3. Chart selection and implementation
4. Real-time update handling
5. Filtering and date ranges
6. Performance optimization
7. Caching strategy

### Follow-ups
- Export data?
- Custom metrics?

---

## 1️⃣5️⃣ Design a PWA with Offline Support and Sync

### What It Tests
- Service Workers
- IndexedDB or LocalStorage
- Background sync
- Conflict resolution when offline
- Network state detection
- Update strategies

### What You'll Learn
- Service Worker lifecycle
- Offline-first architecture
- Storage strategies (IndexedDB)
- Background sync
- Conflict resolution
- Network-aware state management

### Why Companies Ask
- Tests advanced browser APIs
- Performance and offline thinking
- Real-world requirement for global apps

### Key Concepts
- Service Worker registration
- Cache strategies (network-first, cache-first, stale-while-revalidate)
- IndexedDB for offline storage
- Background Sync API
- Network detection

### Time to Solve
70-85 minutes

### Real Examples
- Google Maps offline, Slack offline, Notion

### Interview Flow
1. Requirements (what works offline? what syncs when online?)
2. Service Worker strategy
3. Offline storage (IndexedDB)
4. Network detection
5. Conflict resolution
6. Background sync
7. Update and versioning

### Follow-ups
- Storage limits?
- What if user makes conflicting changes?

---

# Question Comparison Table

| # | Question | Level | Time | Key Skill | Who Asks |
|---|----------|-------|------|-----------|----------|
| 1 | Todo App | Easy | 30-45 | Basics | Startups |
| 2 | Carousel | Easy | 35-50 | DOM + Events | E-commerce |
| 3 | Search | Easy-Mid | 35-45 | API + State | Most companies |
| 4 | **Typeahead** | **Easy-Mid** | **45-60** | **Debounce + Cache** | **Most companies** ⭐ |
| 5 | Pagination | Easy-Mid | 35-50 | State + API | E-commerce |
| 6 | Modal | Easy-Mid | 40-50 | Portal + A11y | Most companies |
| 7 | Infinite Scroll | Medium | 50-60 | Performance | Social media |
| 8 | Photo Gallery | Medium | 50-60 | State + Filters | E-commerce |
| 9 | Shopping Cart | Medium | 50-60 | State + Calc | E-commerce |
| 10 | Chat App | Medium-Hard | 50-70 | Real-time | Social/Chat |
| 11 | Video Player | Medium-Hard | 60-75 | Streaming | Video platforms |
| 12 | Doc Editor | Hard | 70-90 | Collab | Google/Meta/Figma |
| 13 | Whiteboard | Hard | 75-90 | Canvas + Sync | Figma/Miro |
| 14 | Dashboard | Hard | 60-75 | Real-time Data | Analytics SaaS |
| 15 | PWA Offline | Hard | 70-85 | Service Workers | Progressive companies |

---

# My Recommendation for You

Based on your level (3-5 years) and goal (product companies, not Google/Microsoft):

## Start Here 👇

### 🥇 First: **Typeahead/Autocomplete** (Easy-Medium)
- Most commonly asked
- Tests debouncing (critical concept)
- Real-world usage everywhere
- 45-60 min, manageable
- Foundation for harder questions

### 🥈 Then: **Shopping Cart** (Medium)
- Tests state management depth
- Real-world complexity
- E-commerce companies ask
- Multiple concepts together

### 🥉 Then: **Chat App** (Medium-Hard)
- Real-time thinking
- More complex state
- Tests scaling concepts

---

# What You Should Do Now

1. ✅ Read this document
2. ✅ Pick your first question (recommend: Typeahead)
3. ✅ Tell me: "I want to practice [Question Name]"
4. ✅ I'll create full interview with that question
5. ✅ We'll go through it together
6. ✅ After done, pick next question and repeat

---

## Next Steps

**Tell me:** Which question would you like to practice first? 

Examples:
- "Let's start with Typeahead"
- "I want to practice Shopping Cart"
- "Let's do Video Player"

Or tell me if you want more details on any question before deciding! 🎯
