import { useState } from "react";
export default function PinItems() {
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", pinned: false, originalIndex: 0 },
    { id: 2, name: "Item 2", pinned: false, originalIndex: 1 },
    { id: 3, name: "Item 3", pinned: false, originalIndex: 2 },
    { id: 4, name: "Item 4", pinned: false, originalIndex: 3 },
    { id: 5, name: "Item 5", pinned: false, originalIndex: 4 },
    { id: 6, name: "Item 6", pinned: false, originalIndex: 5 },
    { id: 7, name: "Item 7", pinned: false, originalIndex: 6 },
    { id: 8, name: "Item 8", pinned: false, originalIndex: 7 },
  ]);

  const pinItems = (e, itemId) => {
    const status = e.target.checked;

    let updatedItems;

    // Update the pinned status of the item and maintain the original order for unpinned items
    if (status) {
      updatedItems = items.map((item) => {
        if (item.id === itemId) {
          return { ...item, pinned: true };
        }
        return item;
      });
    } else {
      // If unpinning, maintain the original order of unpinned items
      const updatedList = items.map((item) => {
        if (item.id === itemId) {
          return { ...item, pinned: false };
        }
        return item;
      });
      // Sort the updated list based on the original index to maintain the order of unpinned items
      updatedItems = updatedList.sort(
        (a, b) => a.originalIndex - b.originalIndex,
      );
    }

    const pinnedItems = updatedItems.filter((item) => item.pinned);
    const unpinnedItems = updatedItems.filter((item) => !item.pinned);
    // Combine pinned items at the top and unpinned items below
    setItems([...pinnedItems, ...unpinnedItems]);
  };

  return (
    <div>
      <h1>Pin Items</h1>
      <div>
        {items.map((item) => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={item.pinned}
              onChange={(e) => pinItems(e, item.id)}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
