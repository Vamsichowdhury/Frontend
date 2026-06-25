import { useState } from "react";
import styles from "./TransferList.module.css";

export default function TransferList() {
  const [selectionsA, setSelectionsA] = useState([]);
  const [selectionsB, setSelectionsB] = useState([]);
  const [availableItems, setAvailableItems] = useState([
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
  ]);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemSelection = (id, list) => {
    if (list === "A") {
      setSelectionsA((prevSelections) => [...prevSelections, id]);
    } else {
      setSelectionsB((prevSelections) => [...prevSelections, id]);
    }
  };
  const moveSelectedItems = (list) => {
    if (list === "A") {
      const itemsToMove = availableItems.filter((item) =>
        selectionsA.includes(item.id),
      );
      if (itemsToMove.length === 0) return;
      setAvailableItems((prevAvailableItems) =>
        prevAvailableItems.filter((item) => !selectionsA.includes(item.id)),
      );
      setSelectedItems((prevSelectedItems) => [
        ...prevSelectedItems,
        ...itemsToMove,
      ]);
      setSelectionsA([]);
    } else {
      const itemsToMove = selectedItems.filter((item) =>
        selectionsB.includes(item.id),
      );
      if (itemsToMove.length === 0) return;
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.filter((item) => !selectionsB.includes(item.id)),
      );
      setAvailableItems((prevAvailableItems) => [
        ...prevAvailableItems,
        ...itemsToMove,
      ]);
      setSelectionsB([]);
    }
  };
  return (
    <div>
      <h1>Transfer List</h1>
      <div className={styles["itemsContainer"]}>
        <div>
          <h2>Available Items</h2>
          {availableItems.map((item) => {
            return (
              <div key={item.id}>
                <input
                  type="checkbox"
                  onChange={() => handleItemSelection(item.id, "A")}
                />
                {item.name}
              </div>
            );
          })}
        </div>
        <div>
          <h2>Selected Items</h2>
          {selectedItems.map((item) => {
            return (
              <div key={item.id}>
                <input
                  type="checkbox"
                  onChange={() => handleItemSelection(item.id, "B")}
                />
                {item.name}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={() => moveSelectedItems("A")}>{"➡️"}</button>
      <button onClick={() => moveSelectedItems("B")}>{"⬅️"}</button>
    </div>
  );
}
