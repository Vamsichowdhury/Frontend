import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
  };
  const handleDecrement = () => {
    setCount((prevCount) => prevCount - 1);
  };

  return (
    <>
      <h1>Counter</h1>
      <h2>Count:{count}</h2>
      <button onClick={handleIncrement}>+</button>
      <button onClick={handleDecrement}>-</button>
    </>
  );
}
