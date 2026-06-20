import { useRef, useLayoutEffect } from "react";

export default function FocusInput() {
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <h1>Focus Input</h1>
      <input ref={inputRef} type="text" placeholder="first name" />
      <input type="text" placeholder="last name" />
    </>
  );
}
