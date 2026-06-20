# Collaborative Whiteboard - System Design Overview

**Level:** Hard  
**Time to Solve:** 75-90 minutes  
**Tech Stack:** React + Canvas/SVG + WebSocket  

---

## Problem Statement

Build a collaborative whiteboard (Figma/Miro style) where:
- Users can draw shapes (rectangle, circle, line, freehand)
- Multiple users see each other's drawing in real-time
- Pan and zoom the canvas
- Select, move, and resize shapes
- Undo/Redo
- Layers panel
- Export as PNG

---

## Real-World Examples

- Figma (design tool)
- Miro (whiteboard)
- Excalidraw (open source)
- Microsoft Whiteboard
- FigJam

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Canvas or SVG rendering | Core drawing technology decision |
| Shape data model | How to represent geometric objects |
| Real-time sync | WebSocket for multi-user drawing |
| Viewport management | Pan and zoom transformations |
| Hit testing | Detecting which shape was clicked |
| Undo/Redo stack | Command pattern implementation |

---

## What You'll Learn

- Canvas 2D API vs SVG — when to use each
- Scene graph data model (shapes as JSON objects)
- Transformation matrix for pan/zoom
- Hit testing (point-in-shape detection)
- Command pattern for undo/redo
- Collaborative undo (per-user history stack)
- requestAnimationFrame render loop

---

## Canvas vs SVG Decision

```
Canvas (2D Context):
  ✅ Fast for many objects (1000+)
  ✅ Pixel manipulation possible
  ❌ No built-in hit testing
  ❌ No DOM elements per shape
  Use when: many objects, high performance needed

SVG:
  ✅ Each shape is a DOM element (easy events)
  ✅ Built-in hit testing
  ✅ Accessibility
  ❌ Slow for many objects (100+ shapes)
  Use when: fewer objects, need interactivity
```

---

## High-Level Architecture

```
<WhiteboardApp />
├── <Toolbar />                 (select, rect, circle, line, pen)
├── <LayersPanel />             (list of shapes, reorder)
├── <CanvasContainer />
│   ├── <CanvasElement />       (main drawing surface)
│   └── <SelectionHandles />    (resize handles overlay)
├── <CollaboratorCursors />     (other users' cursors on canvas)
└── <StatusBar />               (zoom level, online count)
```

---

## Data Structure

```javascript
// Shape data model
{
  id: "shape_abc",
  type: "rect" | "circle" | "line" | "text" | "freehand",
  x: 100, y: 150,          // position
  width: 200, height: 100,  // dimensions
  rotation: 0,              // degrees
  style: {
    fill: "#FF5733",
    stroke: "#000",
    strokeWidth: 2,
    opacity: 1
  },
  createdBy: "user_123",
  version: 5                // for conflict resolution
}

// Scene state
const [shapes, setShapes] = useState([]);       // ordered array (bottom to top)
const [selectedIds, setSelectedIds] = useState(new Set());

// Viewport (pan + zoom)
const [viewport, setViewport] = useState({
  x: 0, y: 0,     // pan offset
  zoom: 1          // scale factor
});

// History for undo/redo
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

---

## Data Flow

```
User selects "Rectangle" tool and draws:
  → onMouseDown: record start point (in canvas coords)
  → onMouseMove: compute width/height, re-render preview
  → onMouseUp: finalize shape, add to shapes array
  → emit via WebSocket: { type: "SHAPE_ADDED", shape: {...} }

Other users receive shape:
  → add to their local shapes array
  → re-render canvas

User selects a shape:
  → hit test: which shape is at clicked point?
  → show selection handles around shape

User drags a shape:
  → update shape x/y on mousemove
  → broadcast SHAPE_MOVED to other users

User pans canvas:
  → wheel event / space+drag
  → update viewport.x, viewport.y

User zooms:
  → wheel event + Ctrl
  → update viewport.zoom
  → zoom around cursor position

User presses Cmd+Z (undo):
  → pop last command from history stack
  → reverse the operation
  → broadcast undo to collaborators
```

---

## Key Concepts to Learn

### 1. Coordinate Transformation (Pan/Zoom)
```javascript
// Convert screen coords to canvas coords
const screenToCanvas = (screenX, screenY, viewport) => ({
  x: (screenX - viewport.x) / viewport.zoom,
  y: (screenY - viewport.y) / viewport.zoom
});

// Convert canvas coords to screen coords (for rendering)
const canvasToScreen = (canvasX, canvasY, viewport) => ({
  x: canvasX * viewport.zoom + viewport.x,
  y: canvasY * viewport.zoom + viewport.y
});
```

### 2. Canvas Rendering Loop
```javascript
const canvasRef = useRef(null);

const render = useCallback(() => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply viewport transform
  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.zoom, viewport.zoom);

  // Draw all shapes
  shapes.forEach(shape => drawShape(ctx, shape));

  ctx.restore();
}, [shapes, viewport]);

useEffect(() => {
  requestAnimationFrame(render);
}, [render]);
```

### 3. Hit Testing
```javascript
const getShapeAtPoint = (x, y) => {
  // Iterate shapes in reverse (top to bottom in z-order)
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isPointInShape(x, y, shape)) return shape;
  }
  return null;
};

const isPointInShape = (x, y, shape) => {
  if (shape.type === "rect") {
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  }
  if (shape.type === "circle") {
    const dx = x - (shape.x + shape.width / 2);
    const dy = y - (shape.y + shape.height / 2);
    return Math.sqrt(dx*dx + dy*dy) <= shape.width / 2;
  }
};
```

### 4. Command Pattern for Undo/Redo
```javascript
// Every action is a command with execute and undo
const commands = {
  addShape: (shape) => ({
    execute: () => setShapes(prev => [...prev, shape]),
    undo: () => setShapes(prev => prev.filter(s => s.id !== shape.id))
  }),
  moveShape: (id, from, to) => ({
    execute: () => updateShape(id, to),
    undo: () => updateShape(id, from)
  })
};

// Execute a command and push to history
const executeCommand = (command) => {
  command.execute();
  setHistory(prev => [...prev.slice(0, historyIndex + 1), command]);
  setHistoryIndex(prev => prev + 1);
};

// Undo
const undo = () => {
  history[historyIndex].undo();
  setHistoryIndex(prev => prev - 1);
};
```

---

## Implementation Phases

### Phase 1 — Static Canvas
- Canvas element setup
- Draw a rectangle programmatically

### Phase 2 — Drawing Shapes
- Tool selection (rect, circle, line)
- Mouse down/move/up to draw
- Add completed shapes to state

### Phase 3 — Selection & Movement
- Click to select shape
- Drag to move
- Selection handles UI

### Phase 4 — Viewport (Pan/Zoom)
- Mouse wheel to zoom
- Space + drag to pan
- Coordinate transformations

### Phase 5 — Real-time Sync
- WebSocket connection
- Broadcast shape operations
- Apply remote operations

### Phase 6 — Undo/Redo
- Command pattern
- Undo/redo per user
- Collaborative undo discussion

---

## Production Libraries

| Library | Purpose |
|---------|---------|
| **Konva.js** | React Canvas abstraction with hit testing |
| **Fabric.js** | Interactive canvas object model |
| **Rough.js** | Sketchy hand-drawn style shapes |
| **Perfect Freehand** | Smooth freehand strokes |
| **Yjs** | Real-time CRDT sync (used by Figma) |
