# Collaborative Whiteboard — Interview Transcript

**Level:** Hard | **Duration:** 75-90 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Canvas vs SVG Decision | ⏹️ |
| 3 | Drawing Shapes & Hit Testing | ⏹️ |
| 4 | Pan, Zoom & Viewport | ⏹️ |
| 5 | Real-time Sync & Undo/Redo | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a collaborative whiteboard like Miro. What do you want to know first?"

**What candidate should ask:**
- [ ] What shapes? (rectangle, circle, line, freehand?)
- [ ] Real-time collaboration? How many users?
- [ ] Pan and zoom?
- [ ] Undo/Redo?
- [ ] Text labels on shapes?
- [ ] Export to PNG?
- [ ] Selection, move, resize?

**Interviewer answers:**
> "Rect, circle, line, freehand. Yes real-time up to 10 users. Yes pan/zoom. Yes undo/redo. Basic text. No export for now. Yes selection and move."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Canvas vs SVG Decision

**Interviewer:**
> "How would you render the shapes — Canvas, SVG, or CSS/DOM?"

**Expected comparison:**
```
SVG:
  ✅ Each shape is a DOM element → easy mouse events
  ✅ Built-in hit testing
  ❌ Slow with many shapes (100+ gets sluggish)

Canvas:
  ✅ Fast for many objects (1000+)
  ✅ Pixel-level drawing
  ❌ No built-in hit testing (must implement manually)
  ❌ Need to repaint entire canvas on any change

Decision: Canvas for performance + custom hit testing
```

**Expected canvas setup:**
```javascript
const canvasRef = useRef(null);

const render = () => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.zoom, viewport.zoom);

  shapes.forEach(shape => drawShape(ctx, shape));
  ctx.restore();
  requestAnimationFrame(render);
};
```

**Interviewer pushback:**
> "Why `requestAnimationFrame` in the render loop?"

**Expected:** rAF syncs with the browser's refresh rate (60fps), prevents over-rendering, and only fires when the tab is visible. Better than `setInterval`.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Drawing & Hit Testing

**Interviewer:**
> "How does the user draw a rectangle? Walk me through the mouse events."

**Expected:**
```javascript
// Drawing state machine
const [drawing, setDrawing] = useState(false);
const [startPoint, setStartPoint] = useState(null);
const [previewShape, setPreviewShape] = useState(null);

const onMouseDown = (e) => {
  const pt = screenToCanvas(e.clientX, e.clientY, viewport);
  setDrawing(true);
  setStartPoint(pt);
};

const onMouseMove = (e) => {
  if (!drawing) return;
  const pt = screenToCanvas(e.clientX, e.clientY, viewport);
  setPreviewShape({ type: "rect", x: startPoint.x, y: startPoint.y,
    width: pt.x - startPoint.x, height: pt.y - startPoint.y });
};

const onMouseUp = () => {
  if (previewShape) addShape(previewShape); // commit to shapes array
  setDrawing(false);
  setPreviewShape(null);
};
```

**Interviewer:**
> "How do you detect which shape was clicked for selection?"

**Expected hit testing:**
```javascript
const getShapeAt = (x, y) => {
  for (let i = shapes.length - 1; i >= 0; i--) { // top to bottom
    const s = shapes[i];
    if (s.type === "rect" &&
        x >= s.x && x <= s.x + s.width &&
        y >= s.y && y <= s.y + s.height) return s;
    if (s.type === "circle") {
      const dist = Math.hypot(x - s.cx, y - s.cy);
      if (dist <= s.r) return s;
    }
  }
  return null;
};
```

**Candidate response:** *(write your response here)*

---

# Phase 4 — Pan & Zoom

**Interviewer:**
> "How do you implement pan (drag to move canvas) and zoom (scroll wheel)?"

**Expected:**
```javascript
// Pan: space + drag
const onMouseMove = (e) => {
  if (isPanning) {
    setViewport(prev => ({
      ...prev,
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  }
};

// Zoom: wheel event around cursor position
const onWheel = (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1; // zoom in/out
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  setViewport(prev => ({
    zoom: prev.zoom * delta,
    // Adjust offset so zoom centers on cursor, not origin
    x: mouseX - (mouseX - prev.x) * delta,
    y: mouseY - (mouseY - prev.y) * delta
  }));
};
```

**Interviewer pushback:**
> "Why adjust x and y on zoom instead of just changing the scale?"

**Expected:** If you only scale, the canvas zooms toward the top-left (origin). Adjusting offset keeps the zoom centered on the cursor — natural behavior matching Figma/Miro.

**Candidate response:** *(write your response here)*

---

# Phase 5 — Real-time Sync & Undo/Redo

**Interviewer:**
> "How do you sync shapes between users in real-time?"

**Expected:**
```javascript
// Every shape operation is broadcast
const addShape = (shape) => {
  setShapes(prev => [...prev, shape]);
  ws.send(JSON.stringify({ type: "SHAPE_ADDED", shape }));
};

// Receive remote operations
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "SHAPE_ADDED") setShapes(prev => [...prev, data.shape]);
  if (data.type === "SHAPE_MOVED") updateShape(data.shapeId, data.newPos);
  if (data.type === "SHAPE_DELETED") removeShape(data.shapeId);
};
```

**Interviewer:**
> "User A undoes a shape that User B then connected a line to. What happens?"

**Expected honest answer:**
- This is the collaborative undo problem
- Simple approach: each user's undo only affects their own shapes
- Complex approach: CRDT-based undo (Yjs supports this)
- Figma's approach: undo is per-user, shown with user color attribution

**Interviewer final question:**
> "10 users are all drawing simultaneously. 60 WebSocket messages per second. How do you handle this?"

**Expected:** Throttle cursor updates (every 50ms is enough). Batch shape operations. Debounce rapid drag updates. Use CRDT for conflict-free merging.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
