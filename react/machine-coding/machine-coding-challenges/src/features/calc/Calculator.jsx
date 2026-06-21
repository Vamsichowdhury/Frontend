import { useState } from "react";
import styles from "./Calculator.module.css";
export default function Calculator() {
  const [displayValue, setDisplayValue] = useState("0");

  const buttons = [
    ["C", "(", ")", "AC"],
    ["1", "2", "3", "+"],
    ["4", "5", "6", "-"],
    ["7", "8", "9", "*"],
    ["0", ".", "=", "/"],
  ];

  const handleBtnClick = (btn) => {
    if (btn === "C") {
      setDisplayValue(displayValue.slice(0, -1) || "0");
    } else if (btn === "AC") {
      setDisplayValue("0");
    } else if (btn === "=") {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(displayValue);
        setDisplayValue(result.toString());
      } catch (error) {
        alert(error.message || "Invalid expression");
      }
    } else {
      setDisplayValue(displayValue === "0" ? btn : displayValue + btn);
    }
  };
  return (
    <>
      <h2>Calculator</h2>
      <div className={styles.calculator}>
        <div className={styles.display}>{displayValue}</div>
        {buttons.map((row, rowIndex) => {
          return (
            <div className={styles.row} key={rowIndex}>
              {row.map((btn) => {
                return (
                  <span
                    onClick={() => handleBtnClick(btn)}
                    className={styles.button}
                    key={btn}
                  >
                    {btn}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

/*

display     c
1   2   3   +
4   5   6   -
7   8   9   *
0   .   =   /

*/
