import { useState, useRef } from "react";

export default function OtpComponent() {
  const [otpBox, setOtpBox] = useState(Array(4).fill(""));
  const inputRef = useRef([]);

  const handleOtpInput = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) return; // Prevent entering more than one character

    const isOnlyDigits = /^\d+$/.test(value);
    // why value !== "" because if the value is empty then we don't want to prevent the user from entering the value because if the user is doing backspace then the value will be empty and we don't want to prevent the user from entering the value while doing backspace
    if (!isOnlyDigits && value !== "") return; // Prevent entering non-digit characters

    const newOtpBox = [...otpBox];
    newOtpBox[index] = value;
    setOtpBox(newOtpBox);
    // here we are checking if the value is not empty because if the value is empty then we don't want to focus on the next input box
    // while doing backspace, current value will be empty and we don't want to focus on the next input box so we are checking if the value is not empty then only we are focusing on the next input box
    // we are also checking if the index is less than the length of the otpBox array - 1 because if the index is equal to the length of the otpBox array - 1 then we don't want to focus on the next input box because there is no next input box
    if (value && index < otpBox.length - 1) {
      inputRef.current[index + 1].focus(); // Focus on the current input box
    }
  };

  const handleBackspace = (e, index) => {
    console.log(e.key);
    // here we are checking if the current input box is empty(tpBox[index] === "") because if the current input box is empty then we want to focus on the previous input box while doing backspace
    if (e.key === "Backspace" && otpBox[index] === "") {
      inputRef.current[index - 1].focus(); // Focus on the previous input box
    }
  };

  const handlePaste = (e) => {
    e.preventDefault(); // Prevent the default paste behavior of pasting the entire string into the first input box
    const pastedData = e.clipboardData.getData("text"); // Get the pasted data from the clipboard
    const isOnlyDigits = /^\d+$/.test(pastedData);
    if (!isOnlyDigits) return; // Prevent pasting non-digit characters
    1234;
    const newOtpBox = [...otpBox];
    for (let i = 0; i < newOtpBox.length; i++) {
      newOtpBox[i] = pastedData[i] || ""; // Fill the otpBox with the pasted data or empty string if there is no data
    }
    setOtpBox(newOtpBox);
  };
  return (
    <div>
      <h1>OTP Component</h1>
      {otpBox.map((value, index) => {
        return (
          <input
            type="text"
            style={{ width: "25px", height: "30px", marginRight: "5px" }}
            value={value}
            onChange={(e) => handleOtpInput(e, index)}
            onKeyDown={(e) => handleBackspace(e, index)}
            ref={(el) => (inputRef.current[index] = el)}
            onPaste={handlePaste}
          />
        );
      })}
      <p>Entered OTP: {otpBox.join("")}</p>
    </div>
  );
}
