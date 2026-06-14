import { useState, useEffect } from "react";
import "./ThemeChange.css";
export default function ThemeChange() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const handleLocalStorageTheme = async () => {
    document.body.className = theme === "light" ? "light-theme" : "dark-theme";
  };
  useEffect(() => {
    handleLocalStorageTheme();
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    document.body.className = theme === "light" ? "dark-theme" : "light-theme";
    localStorage.setItem("theme", theme === "light" ? "dark" : "light");
  };
  return (
    <>
      <div>
        <div>Theme Change</div>
        <button onClick={toggleTheme}> change theme</button>
      </div>
    </>
  );
}
