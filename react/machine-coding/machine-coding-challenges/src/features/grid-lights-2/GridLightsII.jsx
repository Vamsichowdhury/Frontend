import { useState, useEffect } from "react";

export default function GridLightsII() {
  const [grid, setGrid] = useState([
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ]);

  // Stores the order in which cells were clicked.
  // Example:
  // [
  //   [0,0],
  //   [1,1],
  //   [2,2]
  // ]
  const [clickedOrder, setClickedOrder] = useState([]);

  const toggleCell = (row, col) => {
    // IMPORTANT:
    // Prevent clicking the same cell multiple times.
    //
    // Without this:
    // User clicks (0,0) three times
    //
    // clickedOrder becomes:
    // [[0,0], [0,0], [0,0]]
    //
    // Which breaks the turn-off sequence.
    if (grid[row][col]) return;

    // IMPORTANT:
    // Always use functional state updates when the next state
    // depends on the previous state.
    //
    // BAD:
    // setGrid(updatedGrid)
    //
    // GOOD:
    // setGrid(prev => ...)
    //
    // React guarantees 'prev' is the latest state.
    setGrid((prev) =>
      prev.map((r, rIndex) =>
        r.map((cell, cIndex) =>
          rIndex === row && cIndex === col ? true : cell,
        ),
      ),
    );

    // IMPORTANT:
    // Use functional update here as well.
    //
    // BAD:
    // setClickedOrder([...clickedOrder, [row,col]])
    //
    // Why?
    // Because clickedOrder might be stale if React batches updates.
    //
    // GOOD:
    // setClickedOrder(prev => [...prev, [row,col]])
    setClickedOrder((prev) => [...prev, [row, col]]);
  };

  // Check if every cell is ON.
  //
  // Example:
  //
  // true true true
  // true true true
  // true true true
  //
  // => allCellsOn = true
  const allCellsOn = grid.every((row) => row.every((cell) => cell));

  useEffect(() => {
    // Don't start the turn-off sequence until
    // every cell is ON.
    if (!allCellsOn) return;

    // clickedOrder example:
    //
    // [
    //   [0,0],
    //   [1,1],
    //   [2,2]
    // ]
    //
    // Schedule turn-offs:
    //
    // 500ms  -> turn off [0,0]
    // 1000ms -> turn off [1,1]
    // 1500ms -> turn off [2,2]
    //
    // This avoids the complexity of setInterval.
    clickedOrder.forEach(([row, col], index) => {
      setTimeout(
        () => {
          // IMPORTANT:
          // Use functional update.
          //
          // Very common interview mistake:
          //
          // const updatedGrid = grid.map(...)
          //
          // Inside async callbacks (setTimeout/setInterval),
          // 'grid' may be stale because the callback remembers
          // variables from an older render.
          //
          // Using prev guarantees latest state.
          setGrid((prev) =>
            prev.map((r, rIndex) =>
              r.map((cell, cIndex) =>
                rIndex === row && cIndex === col ? false : cell,
              ),
            ),
          );
        },
        (index + 1) * 500,
      );
    });
  }, [allCellsOn]);

  return (
    <div>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <button
              key={cellIndex}
              onClick={() => toggleCell(rowIndex, cellIndex)}
              style={{
                width: 50,
                height: 50,
                margin: 4,
                background: cell ? "green" : "gray",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
