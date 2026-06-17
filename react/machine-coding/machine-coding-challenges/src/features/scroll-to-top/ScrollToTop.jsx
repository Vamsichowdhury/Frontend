import { useEffect, useState } from "react";
// import styles from "./ScrollToTop.module.css";

export default function ScrollToTop() {
  const [showButton, setShowButton] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const handleScroll = () => {
      console.log(window.scrollY, window.scrollY > 1300);
      if (window.scrollY > 500) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div>
        {Array(50)
          .fill(0)
          .map((_, index) => (
            <p key={index}>Lorem ipsum dolor sit.{showButton.toString()}</p>
          ))}
        {showButton && <button onClick={scrollToTop}>scroll top</button>}
      </div>
    </>
  );
}
