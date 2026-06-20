import { useState } from "react";

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState(null);

  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    // why ? example : if today is 2024-06-15 and birthDate is 2000-08-20, then monthDiff will be -2, which means the person hasn't had their birthday yet this year, so we need to subtract 1 from the age. If monthDiff is 0, we also need to check the day to see if the birthday has passed or not.ŵw
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    setBirthDate(selectedDate);
    setAge(calculateAge(selectedDate));
  };

  return (
    <div>
      <h2>Age Calculator</h2>

      <label htmlFor="birthDate">Enter your birth date:</label>

      <br />
      <br />

      <input
        id="birthDate"
        type="date"
        value={birthDate}
        min="1900-01-01"
        max={new Date().toISOString().split("T")[0]}
        onChange={handleDateChange}
      />

      {age !== null && (
        <p>
          Your age is <strong>{age}</strong> years.
        </p>
      )}
    </div>
  );
}
