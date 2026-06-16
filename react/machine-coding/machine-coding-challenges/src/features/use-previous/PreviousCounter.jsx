import { useEffect, useRef, useState } from "react";

function usePrevious(value) {
  const ref = useRef(0);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // React does not track changes to refs. Updating ref.current does not trigger a re-render. Therefore, UI rendered from refs can become stale or inconsistent. However, hooks like usePrevious intentionally read a ref during render because the ref stores a snapshot from the previous render, making it a valid exception.

  // ignore the warning by adding the following comment above the line where you read the ref:
  // eslint-disable-next-line react-hooks/refs
  return ref.current;
}
export default function PreviousCounter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <h2>Previous Counter</h2>
      <h3>Current Count: {count}</h3>
      <h3>Previous Count: {prevCount}</h3>
      <button onClick={() => setCount((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCount((prev) => prev - 1)}>Decrement</button>
    </div>
  );
}
