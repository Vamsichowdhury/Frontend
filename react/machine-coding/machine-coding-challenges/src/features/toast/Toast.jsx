import { useState } from "react";
import styles from "./Toast.module.css";
export default function Toast() {
  const [toast, setToast] = useState([]);
  const showToast = (type) => {
    const uuid = Date.now();

    setToast((prev) => [
      ...prev,
      {
        id: uuid,
        type: type,
        message: `This is a ${type} toast message`,
      },
    ]);

    setTimeout(() => {
      setToast((prev) => prev.filter((t) => t.id !== uuid));
    }, 3000);
  };
  return (
    <div>
      <h1>Toast</h1>
      <button onClick={() => showToast("info")}>Info</button>
      <button onClick={() => showToast("success")}>Success</button>
      <button onClick={() => showToast("warning")}>Warning</button>
      <button onClick={() => showToast("error")}>Error</button>
      <div>
        {toast.map((t, index) => {
          return (
            <div
              style={{ top: `${index * 60}px` }} // Adjust the top position based on the index and height of the toast (50px) plus some margin (10px)
              className={`${styles.toast} ${styles[t.type]}`}
              key={t.id}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </div>
  );
}
