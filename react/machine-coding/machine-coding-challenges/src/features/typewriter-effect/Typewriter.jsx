import { useState, useEffect } from "react";
export default function Typewriter() {
  const str = "Hello, welcome to the Typewriter Effect!";

  const [text, setText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prev) => {
        // belwo condition nmeans that we dont want to add any more characters if the length of the previous text is equal to the length of the original string.
        if (prev.length === str.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + str[prev.length];
      });
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <h1>Typewriter Effect</h1>
      <p>{text}</p>
      <button onClick={() => setText(str)}>skip</button>
    </div>
  );
}
