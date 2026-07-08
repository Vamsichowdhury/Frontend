import { useState, useEffect } from "react";

export default function Throttle() {
  const [search, setSearch] = useState("");

  useEffect(() => {
    let interval = setInterval(() => {
      console.log("Searching for:", search);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [search]);

  return (
    <div>
      <h1>Throttle</h1>
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
