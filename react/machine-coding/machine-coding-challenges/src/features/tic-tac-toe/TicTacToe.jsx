import { useState } from "react";
import styles from "./TicTacToe.module.css";

const INITIAL_BOARD = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export default function TicTacToe() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);

  const checkWinner = (board) => {
    const winningCombinations = [
      // Rows
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],

      // Columns
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],

      // Diagonals
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    for (const combination of winningCombinations) {
      const [[r1, c1], [r2, c2], [r3, c3]] = combination;

      const value = board[r1][c1];

      if (value && value === board[r2][c2] && value === board[r3][c3]) {
        return value;
      }
    }

    return null;
  };

  const handleClickCell = (rowIndex, colIndex) => {
    if (winner) return;

    if (board[rowIndex][colIndex] !== null) return;

    const newBoard = board.map((row, rIndex) =>
      row.map((cell, cIndex) => {
        if (rIndex === rowIndex && cIndex === colIndex) {
          return currentPlayer;
        }
        return cell;
      }),
    );

    setBoard(newBoard);

    const result = checkWinner(newBoard);

    if (result) {
      setWinner(result);
    } else {
      setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer("X");
    setWinner(null);
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>

      {winner ? (
        <h2>Player {winner} Wins! 🎉</h2>
      ) : (
        <h2>Current Player: {currentPlayer}</h2>
      )}

      <div className={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={styles.cell}
                onClick={() => handleClickCell(rowIndex, cellIndex)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={resetGame}>Reset</button>
    </div>
  );
}
