import { useState } from "react";
import TooltipPopup from "./TooltipPopup";
import styles from "./Tooltip.module.css";

export default function Tooltip({ text, children }) {
  const [showTolltip, setShowTooltip] = useState(false);
  return (
    <>
      <div>
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={styles["tooltip-container"]}
        >
          {children}
        </div>
        {showTolltip && <TooltipPopup text={text} />}
      </div>
    </>
  );
}
