# Image Carousel/Slider - System Design Overview

**Level:** Easy  
**Time to Solve:** 35-50 minutes  
**Tech Stack:** React  

---

## Problem Statement

Build an image carousel/slider where:
- Multiple images slide horizontally
- Previous/Next buttons navigate images
- Auto-plays every N seconds
- Dots indicator shows current position
- Pauses auto-play on hover
- Wraps around (last → first, first → last)

---

## Real-World Examples

- Instagram Stories
- Amazon product images
- Airbnb listing photos
- Netflix content rows
- E-commerce hero banners

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| State for current index | Core navigation logic |
| CSS transforms | Smooth slide animation |
| setInterval/clearInterval | Auto-play logic |
| Event handling | prev/next/dot clicks |
| useRef | Holding interval ID |
| Touch events | Mobile swipe support |

---

## What You'll Learn

- CSS transform: translateX for sliding
- Why `useRef` is better than `useState` for storing interval IDs
- Auto-play with pause on hover
- Circular navigation (wrapping around)
- Dot indicator as interactive progress
- Touch/swipe detection for mobile
- Cleanup in `useEffect` (memory leaks)

---

## High-Level Architecture

```
<Carousel images={[...]} />
├── <SlideTrack /> (moves via CSS transform)
│   └── <Slide /> × N (each image)
├── <PrevButton />
├── <NextButton />
└── <DotIndicators />
    └── <Dot /> × N (clickable, active state)
```

---

## Data Structure

```javascript
// Props
{
  images: ["url1", "url2", "url3"],  // array of image URLs
  autoPlayInterval: 3000,             // ms between auto slides
  showDots: true,
  showArrows: true
}

// State
const [currentIndex, setCurrentIndex] = useState(0);
const intervalRef = useRef(null); // NOT useState — no re-render needed
```

---

## Data Flow

```
Initial render:
  → show image at index 0
  → start auto-play interval

User clicks Next:
  → currentIndex = (currentIndex + 1) % images.length
  → CSS translateX moves track left

User clicks Prev:
  → currentIndex = (currentIndex - 1 + images.length) % images.length
  → CSS translateX moves track right

User hovers:
  → clearInterval(intervalRef.current) — pause auto-play

User mouse leaves:
  → restart interval — resume auto-play

User clicks a dot:
  → setCurrentIndex(dotIndex)
  → slide jumps to that image

Component unmounts:
  → useEffect cleanup: clearInterval — prevent memory leak
```

---

## Key Concepts to Learn

### 1. CSS Slide Animation
```css
.slide-track {
  display: flex;
  transition: transform 0.4s ease;
  transform: translateX(-${currentIndex * 100}%);
}

.slide {
  min-width: 100%;
}
```

### 2. useRef for Interval (Critical!)
```javascript
const intervalRef = useRef(null);

// Start auto-play
const startAutoPlay = () => {
  intervalRef.current = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, autoPlayInterval);
};

// Stop auto-play
const stopAutoPlay = () => clearInterval(intervalRef.current);

useEffect(() => {
  startAutoPlay();
  return () => stopAutoPlay(); // cleanup on unmount!
}, []);
```

### 3. Circular Navigation
```javascript
const goNext = () =>
  setCurrentIndex(prev => (prev + 1) % images.length);

const goPrev = () =>
  setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
// +images.length prevents negative numbers
```

### 4. Touch Events (Swipe)
```javascript
const touchStartX = useRef(0);

const onTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
};

const onTouchEnd = (e) => {
  const diff = touchStartX.current - e.changedTouches[0].clientX;
  if (diff > 50) goNext();
  if (diff < -50) goPrev();
};
```

---

## Implementation Phases

### Phase 1 — Static Rendering
- Render all images in a flex row
- Show only the first image (overflow: hidden on container)

### Phase 2 — Navigation
- Prev/Next buttons
- Circular index logic
- CSS transition on transform

### Phase 3 — Auto-play
- setInterval in useEffect
- useRef to hold interval ID
- Cleanup on unmount

### Phase 4 — Dots + Hover Pause
- Dot indicators with active state
- Pause on mouse enter
- Resume on mouse leave

### Phase 5 — Touch Support
- onTouchStart / onTouchEnd
- Swipe threshold detection

---

## Performance Considerations

- Lazy load off-screen images (`loading="lazy"`)
- Preload next image for smoother transition
- Avoid re-creating interval on every render (use `useRef`)
- `will-change: transform` CSS hint for GPU acceleration

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Only 1 image | Hide arrows and dots |
| Images different sizes | Fixed height container, object-fit: cover |
| Fast clicking arrows | Don't reset interval mid-click |
| Component unmounts during interval | Cleanup in useEffect return |
| No images passed | Show placeholder/empty state |

---

## Interview Tips for This Question

- Immediately ask: "Is auto-play required?" and "Mobile swipe support?"
- Explain WHY useRef vs useState for interval (no re-render needed)
- Mention CSS transition vs JS animation (CSS is better, GPU accelerated)
- Talk about accessibility: aria-label on buttons, aria-live region

---

## What Differentiates a Good Answer

| Average Candidate | Strong Candidate |
|------------------|-----------------|
| useState for interval | useRef — knows the difference |
| No cleanup in useEffect | Properly clears interval on unmount |
| Ignores mobile | Discusses touch/swipe support |
| No dots | Adds interactive dot navigation |
| Ignores edge cases | Handles 1 image, different sizes |
