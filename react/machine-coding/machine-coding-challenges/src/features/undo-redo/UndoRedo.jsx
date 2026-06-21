import { useState } from "react";

export default function UndoRedo() {
  const [history, setHistory] = useState([]);
  const [currentPos, setCurrentPos] = useState(-1);

  const handleHistory = (e) => {
    // If user makes a change after undoing some changes, we need to discard the "undone" history and add the new change to the end of the history.
    const newHistory = history.slice(0, currentPos + 1);
    const updatedHistory = [...newHistory, e.target.value];
    setHistory(updatedHistory);
    // After adding a new change, we need to move the current position to the end of the history.
    setCurrentPos(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    setCurrentPos((prev) => prev - 1);
  };

  const handleRedo = () => {
    setCurrentPos((prev) => prev + 1);
  };

  return (
    <>
      <h2>Undo Redo {currentPos}</h2>
      <textarea
        rows="5"
        cols="30"
        placeholder="describe.."
        onChange={handleHistory}
        value={history[currentPos] || ""}
      ></textarea>
      <br />
      <button onClick={handleUndo} disabled={currentPos < 0}>
        Undo
      </button>
      <button onClick={handleRedo} disabled={currentPos >= history.length - 1}>
        Redo
      </button>
    </>
  );
}
