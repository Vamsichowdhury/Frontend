import { useRef, useState } from "react";

export default function Debounce() {
  const timer = useRef(null);
  const [searchValue, setSearchValue] = useState("");

  const callSearchApi = (value) => {
    console.log("Searching for:", value);
  };

  // debounce traditional/trailing
  const handleSearch = (e) => {
    // leading debounce
    if (timer.current === null) {
      callSearchApi(e.target.value);
    }
    setSearchValue(e.target.value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callSearchApi(e.target.value);
    }, 500);
  };

  // debounce clear
  const handleClear = () => {
    clearTimeout(timer.current);
    setSearchValue("");
    console.log("Cleared search");
  };

  // debounce flush
  const handleSearchClick = () => {
    clearTimeout(timer.current);
    callSearchApi(searchValue);
  };

  return (
    <div>
      <h1>Debounce</h1>
      <input
        type="text"
        placeholder="Type something..."
        onChange={handleSearch}
        value={searchValue}
      />
      <button onClick={handleClear}>clear</button>
      <button onClick={handleSearchClick}>search</button>
    </div>
  );
}
