# Image Carousel — Interview Transcript

**Level:** Easy | **Duration:** 35-50 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Architecture & Animation Strategy | ⏹️ |
| 3 | Navigation + Auto-play | ⏹️ |
| 4 | Dots & Touch Support | ⏹️ |
| 5 | Edge Cases & Follow-ups | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Build an image carousel. What do you need to know first?"

**What candidate should ask:**
- [ ] Auto-play required? If yes, what interval?
- [ ] Does it wrap around (last → first)?
- [ ] Dot indicators needed?
- [ ] Touch/swipe for mobile?
- [ ] Keyboard navigation?
- [ ] How many images max?
- [ ] Fixed height or dynamic?

**Interviewer answers:**
> "Yes auto-play at 3 seconds, yes wrap-around, dots and arrows, no keyboard needed, assume 5-10 images, fixed height."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Architecture & Animation Strategy

**Interviewer:**
> "How would you animate the slide transition? CSS or JavaScript?"

**Expected answer:**
- CSS `transform: translateX` with `transition` property
- GPU-accelerated, smoother than JS animation
- `will-change: transform` hint for browser

**Expected component structure:**
```
<Carousel>
├── <SlideTrack> (moves horizontally)
│   └── <Slide> × N
├── <PrevButton>
├── <NextButton>
└── <Dots>
```

**Interviewer pushback:**
> "Why CSS transitions over something like framer-motion?"

**Expected:** CSS transitions are simpler, no library needed, browser-native GPU acceleration.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Navigation + Auto-play

**Interviewer:**
> "Implement the prev/next logic and auto-play. Walk me through it."

**Expected circular logic:**
```javascript
const goNext = () =>
  setIndex(i => (i + 1) % images.length);

const goPrev = () =>
  setIndex(i => (i - 1 + images.length) % images.length);
```

**Expected auto-play:**
```javascript
const intervalRef = useRef(null);

useEffect(() => {
  intervalRef.current = setInterval(goNext, 3000);
  return () => clearInterval(intervalRef.current); // cleanup!
}, []);
```

**Interviewer pushback:**
> "Why `useRef` and not `useState` for the interval ID?"

**Expected:** useState would cause a re-render when interval ID is set. useRef stores mutable values without triggering re-renders.

**Candidate response:** *(write your response here)*

---

# Phase 4 — Dots + Hover Pause

**Interviewer:**
> "How do you pause auto-play on hover and implement the dot indicators?"

**Expected pause logic:**
```javascript
<div
  onMouseEnter={() => clearInterval(intervalRef.current)}
  onMouseLeave={() => { intervalRef.current = setInterval(goNext, 3000); }}
>
```

**Expected dots:**
```jsx
{images.map((_, i) => (
  <button
    key={i}
    onClick={() => setIndex(i)}
    className={i === index ? "active" : ""}
  />
))}
```

**Candidate response:** *(write your response here)*

---

# Phase 5 — Edge Cases & Follow-ups

**Interviewer:**
> "What if there's only 1 image? Or images have different sizes?"

**Expected:**
- 1 image: hide arrows and dots
- Different sizes: `object-fit: cover` + fixed height container

**Interviewer:**
> "How would you add touch/swipe support?"

**Expected:**
```javascript
const touchStartX = useRef(0);
const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
const onTouchEnd = (e) => {
  const diff = touchStartX.current - e.changedTouches[0].clientX;
  if (diff > 50) goNext();
  if (diff < -50) goPrev();
};
```

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
