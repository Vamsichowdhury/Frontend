import { useState } from "react";
import styles from "./GridLights.module.css";

export default function GridLights() {
  const [grid, setGrid] = useState([
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ]);

  const toggleCells = (rowIndex, cellIndex) => {
    /*
            selected: 1,1
            i want row: 0,1  2,1
            i want col: 1,0  1,2
    */
    const newGrid = grid.map((row, rIndex) => {
      return row.map((cell, cIndex) => {
        if (
          (rowIndex === rIndex && cellIndex === cIndex) ||
          (rowIndex - 1 === rIndex && cellIndex === cIndex) ||
          (rowIndex + 1 === rIndex && cellIndex === cIndex) ||
          (rowIndex === rIndex && cellIndex - 1 === cIndex) ||
          (rowIndex === rIndex && cellIndex + 1 === cIndex)
        ) {
          return !cell;
        }
        return cell;
      });
    });
    setGrid(newGrid);
  };
  return (
    <div>
      <h2>Grid Lights</h2>
      <div className={styles.grid}>
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, cellIndex) => {
                return (
                  <div
                    key={cellIndex}
                    className={`${cell ? styles.cellOn : styles.cellOff} ${styles.cell}`}
                    onClick={() => toggleCells(rowIndex, cellIndex)}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
/*
selected: 1,1
i want row: 0,1 1,1 2,1
i want col: 1,0 1,1 1,2
*/
