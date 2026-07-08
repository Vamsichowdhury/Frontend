import { useRef } from "react";

export default function Debounce() {
  const timer = useRef(null);

  const handleSearch = (e) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      console.log("Searching for:", e.target.value);
    }, 500);
  };

  return (
    <div>
      <h1>Debounce</h1>
      <input
        type="text"
        placeholder="Type something..."
        onChange={handleSearch}
      />
    </div>
  );
}
