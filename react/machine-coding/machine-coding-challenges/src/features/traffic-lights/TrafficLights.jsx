import { useState, useEffect } from "react";
import styles from "./TrafficLights.module.css";
export default function TrafficLights() {
  const [currentLight, setCurrentLight] = useState("red");
  const LIGHTS = {
    red: {
      next: "yellow",
      duration: 3000,
    },
    yellow: {
      next: "green",
      duration: 1000,
    },
    green: {
      next: "red",
      duration: 2000,
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLight(LIGHTS[currentLight].next);
    }, LIGHTS[currentLight].duration);

    return () => clearTimeout(timer);
  }, [currentLight]);

  return (
    <>
      <h2>Traffic Lights</h2>

      <div className={`${styles.lightsContainer}`}>
        <div className={styles.lights}>
          <div
            className={`${styles.circle} ${currentLight === "red" ? styles.red : ""}`}
          ></div>
          <div
            className={`${styles.circle} ${currentLight === "yellow" ? styles.yellow : ""}`}
          ></div>
          <div
            className={`${styles.circle} ${currentLight === "green" ? styles.green : ""}`}
          ></div>
        </div>
      </div>
    </>
  );
}
