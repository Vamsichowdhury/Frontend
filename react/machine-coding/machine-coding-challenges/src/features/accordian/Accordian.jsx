import { useState } from "react";

export default function Accordian() {
  const data = [
    {
      id: 1,
      title: "What is React?",
      content:
        "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage the state of their applications efficiently.",
      isOpened: false,
    },
    {
      id: 2,
      title: "What is a component in React?",
      content:
        "A component in React is a self-contained piece of code that represents a part of the user interface. It can be a function or a class that returns JSX, which describes how the UI should look.",
      isOpened: false,
    },
    {
      id: 3,
      title: "What is state in React?",
      content:
        "State in React is an object that holds data that may change over time. It allows components to manage and update their own data, and when the state changes, the component re-renders to reflect the new data.",
      isOpened: false,
    },
  ];
  const [accordianData, setAccordianData] = useState(data);
  const [multipleOpenAllowed, setMultipleOpenAllowed] = useState(false);

  const toggleSection = (id) => {
    const updatedData = accordianData.map((item) => {
      // Toggle the clicked section
      if (item.id === id) {
        return {
          ...item,
          isOpened: !item.isOpened,
        };
        // If multiple open is not allowed, close all other sections when one is opened
      } else if (!multipleOpenAllowed && item.isOpened) {
        return {
          ...item,
          isOpened: false,
        };
      }
      // For all other sections, return them as they are
      return item;
    });
    setAccordianData(updatedData);
  };

  return (
    <>
      <h1>Accordian</h1>
      <h4>
        Is multiple open accordian allowed ?{" "}
        <input
          type="checkbox"
          onChange={(e) => setMultipleOpenAllowed(e.target.checked)}
          checked={multipleOpenAllowed}
        />
        {multipleOpenAllowed ? "Yes" : "No"}
      </h4>
      {accordianData.map((item) => {
        return (
          <div
            key={item.id}
            style={{ border: "1px solid black", margin: "10px" }}
          >
            <div>
              {item.title}
              <span onClick={() => toggleSection(item.id)}>
                {item.isOpened ? "-" : "+"}
              </span>
            </div>

            {item.isOpened && <div>{item.content}</div>}
          </div>
        );
      })}
    </>
  );
}
