import { useState } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");

  const getCleanedText = () => {
    const cleanedText = text.replace(/[^a-zA-Z]/g, " "); // Replace non-alphabetic characters with spaces
    const words = cleanedText.split(" ").filter((word) => word !== ""); // Split into words and filter out empty strings
    const freq = {};
    for (const word of words) {
      if (freq[word]) {
        freq[word] += 1;
      } else {
        freq[word] = 1;
      }
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
  };
  const result = getCleanedText();
  return (
    <div>
      <h1>Word Counter</h1>

      <textarea
        type="text"
        rows="10"
        cols="50"
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {result.length > 0 && (
        <div>
          <h4>Word Frequency:</h4>

          {result.map((word, index) => (
            <div key={index}>
              {word[0]}: {word[1]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
