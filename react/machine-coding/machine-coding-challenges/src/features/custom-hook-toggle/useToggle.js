import { useState } from "react";

export default function useToggle() {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => {
    setIsOn((prev) => !prev);
  };

  return [isOn, toggle];
}
