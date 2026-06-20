import { useState } from "react";

export default function ReadMoreLess() {
  const [isExpanded, setIsExpanded] = useState(false);

  const text =
    "React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and efficiently update the DOM using a virtual DOM. React is widely used for building modern web applications because of its simplicity, flexibility, and strong ecosystem.";

  const previewLength = 100;

  const displayedText = isExpanded
    ? text
    : text.slice(0, previewLength) + "...";

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div>
      <p>{displayedText}</p>

      <button onClick={handleToggle}>
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </div>
  );
}
