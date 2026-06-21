import { useState } from "react";
import styles from "./DragDrop.module.css";
export default function DragDrop() {
  const [draggedItem, setDraggedItem] = useState(null);

  const [itemsA, setItemsA] = useState([
    { id: 1, label: "Apple" },
    { id: 2, label: "Banana" },
    { id: 3, label: "Cherry" },
  ]);

  const [itemsB, setItemsB] = useState([
    { id: 4, label: "Date" },
    { id: 5, label: "Elderberry" },
    { id: 6, label: "Fig" },
  ]);

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDrop = (section) => {
    if (draggedItem) {
      if (section === "A") {
        // check if the item is already in section A
        const isInSectionA = itemsA.find((item) => item.id === draggedItem.id);

        // If not, add it to section A and remove from section B
        if (!isInSectionA) {
          setItemsA((prevItems) => [...prevItems, draggedItem]);
        } else {
          alert("Item already exists in Section A");
          return;
        }

        // Remove from section B
        const indexInB = itemsB.findIndex((item) => item.id === draggedItem.id);
        if (indexInB >= -1) {
          itemsB.splice(indexInB, 1);
        }
      }
    }
    if (section === "B") {
      // check if the item is already in section B
      const isInSectionB = itemsB.find((item) => item.id === draggedItem.id);

      // If not, add it to section B and remove from section A
      if (!isInSectionB) {
        setItemsB((prevItems) => [...prevItems, draggedItem]);
      } else {
        alert("Item already exists in Section B");
        return;
      }

      // Remove from section A
      const indexInA = itemsA.findIndex((item) => item.id === draggedItem.id);
      if (indexInA >= -1) {
        itemsA.splice(indexInA, 1);
      }
    }
    setDraggedItem(null); // Reset the dragged item after dropping
  };
  return (
    <>
      <h2>Drag & Drop</h2>
      <div
        onDragOver={(e) => e.preventDefault()} // Allow dropping by preventing default behavior
        className={styles.sectionContainer}
      >
        <div onDrop={() => handleDrop("A")} className={` ${styles.section}`}>
          <h4>Section A</h4>
          <div className={`${styles.items} `}>
            {itemsA.map((item) => (
              <div
                draggable
                onDragStart={() => handleDragStart(item)}
                key={item.id}
                className={styles.item}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div onDrop={() => handleDrop("B")} className={` ${styles.section}`}>
          <h4>Section B</h4>
          <div className={`${styles.items} `}>
            {itemsB.map((item) => {
              return (
                <div
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  key={item.id}
                  className={styles.item}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/*

    draggable           Makes element draggable
    onDragStart         Triggered when dragging starts
    onDragOver          Triggered when an element is being dragged over a valid drop target (use event.preventDefault() to allow dropping)
    onDrop              Triggered when an element is dropped on a valid drop target
    onDragEnd           Triggered when dragging ends, used for Cleanup

*/
