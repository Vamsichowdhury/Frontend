import styles from "./TooltipPopup.module.css";
export default function TooltipPopup({ text }) {
  return (
    <>
      <div className={styles["tooltip-popup"]}>{text}</div>
    </>
  );
}
