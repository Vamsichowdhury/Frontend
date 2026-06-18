import { useState } from "react";
export default function TogglePassword() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <h1>Toggle Password</h1>
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
      />
      <button onClick={() => setShowPassword((prev) => !prev)}>
        {showPassword ? "Hide" : "Show"}
      </button>
    </>
  );
}
