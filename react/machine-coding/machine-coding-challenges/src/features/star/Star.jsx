import { useState } from "react";
import styles from "./Star.module.css";
export default function Star() {
  const [rating, setRating] = useState(0);
  return (
    <div>
      <h2>Star Rating</h2>
      {[1, 2, 3, 4, 5].map((star) => {
        return (
          <span
            className={`${styles.star} ${star <= rating ? styles.filled : ""}`}
            key={star}
            onClick={() => setRating(star)}
          >
            {star <= rating ? "★" : "☆"} {/* use fn key to get these stars */}
          </span>
        );
      })}
    </div>
  );
}
