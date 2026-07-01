import { useState } from "react";

export default function JsonFormatterValidator() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const handleInput = (e) => {
    setInput(e.target.value);
  };
  const handleFormat = () => {
    try {
      const formattedJson = JSON.stringify(JSON.parse(input), null, 2);
      setInput(formattedJson);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div>
      <h1>Json Formatter and Validator</h1>
      <textarea
        rows={40}
        cols={50}
        onChange={handleInput}
        value={input}
        placeholder="Enter Json "
      ></textarea>
      <br />
      {error && <h4 style={{ color: "red" }}>{error}</h4>}
      <button onClick={handleFormat}>Format JSON</button>
      <button
        onClick={() => {
          setInput("");
          setError("");
        }}
      >
        Clear
      </button>
    </div>
  );
}

/*

some single line json

{"key1": "value1", "key2": "value2", "key3": "value3"}

*/
