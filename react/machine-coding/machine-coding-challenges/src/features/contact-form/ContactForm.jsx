// show red color warning message if user tries to submit form without filling all the fields
// why email is not showing email validation that @ .com are required ?
//
import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  const handleSubmit = (e) => {
    setIsSubmitted(true);
    e.preventDefault();
    handleValidation();
  };
  const handleValidation = () => {
    const isValidForm = name && email && message;
    if (isValidForm) {
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(false);
      setShowThanks(true);
    }
  };
  return (
    <>
      <h1>Contact Form</h1>
      {showThanks ? (
        <div>Thank you for your message!</div>
      ) : (
        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label>
              <input
                type="text"
                placeholder="enter name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div style={{ color: "red" }}>
                {isSubmitted && !name && "Name is required"}
              </div>
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                placeholder="enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div style={{ color: "red" }}>
                {isSubmitted && !email && "Email is required"}
              </div>
            </div>
            <div>
              <label>Message:</label>
              <textarea
                placeholder="enter message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div style={{ color: "red" }}>
                {isSubmitted && !message && "Message is required"}
              </div>
            </div>
            {/* prevent default behaviouse of form submission */}
            <button type="submit">submit</button>
          </form>
        </div>
      )}
    </>
  );
}
