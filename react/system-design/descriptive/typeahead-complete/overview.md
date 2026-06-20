# Typeahead / Autocomplete — Interview Overview

---

## What Problem Are We Solving?

A **typeahead** (also called autocomplete) is a search input that shows suggestions as the user types — before they press Enter.

```
User types: "rea"
                  ┌─────────────────────┐
                  │  react              │
                  │  react native       │
                  │  react hooks        │
                  │  react router       │
                  │  reading list       │
                  └─────────────────────┘
```

You see this everywhere:

| Product | Where |
|---------|-------|
| Google | Search bar |
| Twitter/X | Search users, hashtags |
| Slack | @mention someone |
| Figma | Asset / component search |
| GitHub | File search (Cmd+P) |
| VS Code | Command palette |

---

## What the Interview Will Cover

This is a 45–60 minute interview. Here is the full arc:

```
┌─────────────────────────────────────────────────────────────┐
│                   INTERVIEW ARC                             │
│                                                             │
│  1. Requirements    →   What are we actually building?      │
│  2. High-level      →   Input → Debounce → API → Render     │
│  3. Components      →   Break UI into React components      │
│  4. Debouncing      →   Why 5 calls is bad. How to fix.     │
│  5. Caching         →   Don't re-fetch same query           │
│  6. Race conditions →   Old response overwriting new one    │
│  7. Keyboard nav    →   Arrow keys, Enter, Escape           │
│  8. Accessibility   →   ARIA, screen readers                │
│  9. Performance     →   Large lists, virtual scroll         │
│  10. Scale          →   Millions of users. What changes?    │
└─────────────────────────────────────────────────────────────┘
```

---

## High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT)                      │
│                                                              │
│   ┌────────────┐    ┌──────────┐    ┌────────────────────┐  │
│   │  Input Box │───▶│ Debounce │───▶│    Cache Check     │  │
│   │            │    │  300ms   │    │  (Map / useRef)    │  │
│   └────────────┘    └──────────┘    └────────┬───────────┘  │
│                                              │               │
│                                   ┌──────────┴──────────┐   │
│                                   │                     │   │
│                              Cache Hit?             Cache Miss│
│                                   │                     │   │
│                              ┌────▼────┐         ┌──────▼──┐│
│                              │ Return  │         │   API   ││
│                              │ Cached  │         │  Call   ││
│                              └────┬────┘         └──────┬──┘│
│                                   │                     │   │
│                                   └──────────┬──────────┘   │
│                                              │               │
│                                    ┌─────────▼──────────┐   │
│                                    │  Suggestions List  │   │
│                                    │  (Dropdown UI)     │   │
│                                    └────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP GET /search?q=react
                                ▼
                      ┌─────────────────┐
                      │   BACKEND API   │
                      │  (Search Index) │
                      └─────────────────┘
```

---

## Component Hierarchy

```
<Typeahead onSelect={fn}>
│
├── <InputField>
│     value={inputValue}
│     onChange={handleChange}
│     onKeyDown={handleKeyDown}
│
└── <SuggestionsDropdown>  (only rendered when open)
      │
      ├── <LoadingSpinner>      ← while fetching
      │
      ├── <SuggestionItem>      ← result 1  (highlighted if active)
      ├── <SuggestionItem>      ← result 2
      ├── <SuggestionItem>      ← result 3
      │
      └── <EmptyState>          ← "No results for X"
```

---

## State Machine for the Component

```
                     ┌──────────────┐
               ──────▶    IDLE      │
               │     │  (no input)  │
               │     └──────┬───────┘
               │            │ user types
               │            ▼
               │     ┌──────────────┐
               │     │   TYPING     │
               │     │  (debounce   │
               │     │   pending)   │
               │     └──────┬───────┘
               │            │ 300ms passed
               │            ▼
               │     ┌──────────────┐
               │     │   LOADING    │◀── API call in flight
               │     │              │
               │     └──────┬───────┘
               │            │
               │     ┌──────┴───────┐
               │     │             │
               │     ▼             ▼
               │  ┌───────┐   ┌─────────┐
               │  │SUCCESS│   │  ERROR  │
               │  │(show  │   │(show    │
               │  │results│   │ message)│
               │  └───┬───┘   └─────────┘
               │      │ Esc / blur / select
               └──────┘
```

---

## Debounce — Visual Explanation

```
WITHOUT DEBOUNCE:
─────────────────────────────────────────────────────────────
Time:    0ms  50ms 100ms 150ms 200ms
Input:    r    re   rea  reac  react
API:      ▲    ▲    ▲    ▲     ▲       ← 5 API calls

WITH DEBOUNCE (300ms):
─────────────────────────────────────────────────────────────
Time:    0ms  50ms 100ms 150ms 200ms  500ms
Input:    r    re   rea  reac  react
API:                                    ▲    ← 1 API call
                                  (300ms after last keystroke)
```

---

## Cache Strategy

```
First search:
  Query: "react"
  ┌──────────────────────────────────────┐
  │ Cache { }  ← miss                    │
  └──────────────────────────────────────┘
  → API call → response → store in cache
  ┌──────────────────────────────────────┐
  │ Cache { "react": [...results] }      │
  └──────────────────────────────────────┘

Second search (same query):
  Query: "react"
  ┌──────────────────────────────────────┐
  │ Cache { "react": [...results] }  HIT │
  └──────────────────────────────────────┘
  → return cached result instantly (0ms, 0 network)
```

---

## Race Condition Problem

```
PROBLEM:
─────────────────────────────────────────────────────────────
t=0ms   User types "re"     → Request A sent
t=100ms User types "react"  → Request B sent

t=300ms Request B responds  → UI shows "react" results  ✅
t=500ms Request A responds  → UI shows "re" results     ❌ WRONG!

Request A was slower (network lag) and arrived LAST,
overwriting the correct "react" results.

SOLUTION — AbortController:
─────────────────────────────────────────────────────────────
t=0ms   User types "re"     → Request A sent
t=100ms User types "react"  → Request A ABORTED ✋
                            → Request B sent
t=300ms Request B responds  → UI shows "react" results  ✅
        (Request A was cancelled, never responds)
```

---

## Keyboard Navigation State

```
selectedIndex = -1  (nothing selected, default)

User presses ArrowDown:
  selectedIndex = 0  → first item highlighted

User presses ArrowDown again:
  selectedIndex = 1  → second item highlighted

User presses ArrowUp:
  selectedIndex = 0  → back to first

User presses Enter:
  → select suggestions[selectedIndex]
  → close dropdown
  → call onSelect(selectedItem)

User presses Escape:
  selectedIndex = -1
  → close dropdown
```

---

## Accessibility (ARIA Combobox Pattern)

```html
<input
  role="combobox"
  aria-expanded="true"
  aria-autocomplete="list"
  aria-controls="suggestions-listbox"
  aria-activedescendant="suggestion-2"
/>

<ul
  id="suggestions-listbox"
  role="listbox"
>
  <li id="suggestion-0" role="option" aria-selected="false">React</li>
  <li id="suggestion-1" role="option" aria-selected="false">React Native</li>
  <li id="suggestion-2" role="option" aria-selected="true">React Hooks</li>
</ul>
```

Screen reader announces: *"React Hooks, option 3 of 5, selected"*

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|---------------|
| Debouncing | Reduces API calls by 80%+ |
| Caching with useRef | Instant repeat queries, no network |
| AbortController | Prevents stale result bugs |
| Race condition | Classic async bug — every senior dev must know this |
| Keyboard navigation | Required for accessibility |
| ARIA combobox pattern | Screen reader support |
| LRU Cache (bonus) | Bounding memory in production |
| Virtual scroll (bonus) | Handle 10,000+ suggestions |

---

## Interview Evaluation Criteria

```
Level          What They Want to See
─────────────────────────────────────────────────────────────
Junior     →   Builds it. Mentions debounce.
Mid-level  →   Debounce + caching + loading/error states.
Senior     →   All above + race conditions + accessibility
               + performance + scaling discussion.
Staff      →   All above + LRU cache + virtual scroll
               + backend caching layers + analytics.
```

---

## Before Reading the Interview

Keep these questions in your head as you read:

1. When does the candidate ask questions vs. start designing?
2. How does the candidate explain debouncing — do they show WHY first or HOW first?
3. How does the candidate handle the interviewer's pushback?
4. At what point does the candidate write code vs. draw diagrams?
5. What makes the interviewer satisfied vs. still probing?
