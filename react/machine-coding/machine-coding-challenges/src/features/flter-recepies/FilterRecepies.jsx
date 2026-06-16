import { useState } from "react";
import recepiesData from "./recepiesData";
import RecepieCard from "./RecepieCard";
export default function FilterRecepies() {
  const [recepies, setRecepies] = useState(recepiesData);
  const [selectedRating, setSelectedRating] = useState("4");

  const handleRatingSelection = (rating) => {
    const parsedRating = parseFloat(rating);
    setSelectedRating(rating);
    const filteredRecepies = recepies.filter(
      (recepie) => recepie.rating >= parsedRating,
    );
    setRecepies(filteredRecepies);
  };

  return (
    <>
      <h2>
        <div>Filter Recepies</div>
        <select
          name="rating"
          id="rating"
          onChange={(e) => handleRatingSelection(e.target.value)}
          value={selectedRating}
        >
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
          <option value="4.7">4.7+</option>
          <option value="4.9">4.9+</option>
        </select>
        {recepies.map((recepie) => {
          return <RecepieCard key={recepie.id} recepie={recepie} />;
        })}
      </h2>
    </>
  );
}
