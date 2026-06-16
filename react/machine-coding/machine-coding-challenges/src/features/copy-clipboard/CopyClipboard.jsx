import { useState } from "react";

export default function CopyClipboard() {
  const [text, setText] = useState("");

  const handleCopyBtnClick = () => {
    navigator.clipboard.writeText(text);
  };
  return (
    <>
      <h2>Copy to Clipboard</h2>
      <input type="text" onChange={(e) => setText(e.target.value)} />{" "}
      <button onClick={handleCopyBtnClick}>copy</button>
    </>
  );
}
