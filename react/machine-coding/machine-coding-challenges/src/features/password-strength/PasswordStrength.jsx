/*
Password Requirements

1. Length: At least 8 characters.
2. Uppercase Letters: At least one uppercase letter (A-Z).
3. Lowercase Letters: At least one lowercase letter (a-z).
4. Numbers: At least one digit (0-9).
5. Special Characters: At least one special character (e.g., @, #, $, %, etc.).

Strength Levels

* Weak: Password meets 1 of the 5 criteria.
* Good: Password meets 2 or 3 of the 5 criteria.
* Strong: Password meets 4 or 5 of the 5 criteria.
* Very Weak: If the password does not meet any criteria, it’s considered a Weak Password and the function returns “Weak Password”.
*/

import { useState } from "react";

export default function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");

  const colors = {
    "Very Weak": "red",
    Weak: "orange",
    Good: "blue",
    Strong: "green",
  };
  const lowercaseAlphabets = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",

    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",

    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  const uppercaseAlphabets = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",

    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",

    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const specialChars = ["@", "#", "$", "%", "&", "*", "!", "?"];

  const validatePassword = (value) => {
    // if entered password is not part of the criteria, then show alert message "Password does not meet the criteria"
    if (
      value[value.length - 1] &&
      !lowercaseAlphabets.includes(value[value.length - 1]) &&
      !uppercaseAlphabets.includes(value[value.length - 1]) &&
      !numbers.includes(value[value.length - 1]) &&
      !specialChars.includes(value[value.length - 1])
    ) {
      alert("Password does not meet the criteria");
      return;
    }

    const hasMinLength = value.length >= 8;
    const hasLowerCase = lowercaseAlphabets.some((char) =>
      value.includes(char),
    );
    const hasUpperCase = uppercaseAlphabets.some((char) =>
      value.includes(char),
    );
    const hasNumber = numbers.some((char) => value.includes(char));
    const hasSpecialChar = specialChars.some((char) => value.includes(char));

    const criteriaMet = [
      hasMinLength,
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
    ].filter((val) => val).length;

    if (criteriaMet === 0) {
      setStrength("Very Weak");
    } else if (criteriaMet === 1) {
      setStrength("Weak");
    } else if (criteriaMet === 2 || criteriaMet === 3) {
      setStrength("Good");
    } else if (criteriaMet === 4 || criteriaMet === 5) {
      setStrength("Strong");
    }

    setPassword(value);
  };
  return (
    <>
      <h2>Password Strength</h2>
      <input
        type="text"
        placeholder="password.."
        onChange={(e) => validatePassword(e.target.value)}
        value={password}
      />
      {password && (
        <p style={{ color: colors[strength] }}>Password Strength: {strength}</p>
      )}
    </>
  );
}
