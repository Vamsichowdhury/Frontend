import { useState } from "react";

export default function QuizCard({ questions }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [error, setError] = useState(""); // State to track error message

  const handleNextQuestion = () => {
    if (selectedAnswer === "") {
      setError("Please select an answer before proceeding.");
      return;
    }
    // check answer
    if (selectedAnswer === questions[currentQuestionIndex].answer) {
      setScore((prevScore) => prevScore + 1);
    }
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedAnswer("");
    setError(""); // Clear the error message when moving to the next question
  };

  return (
    <div>
      {questions[currentQuestionIndex] ? (
        <div>
          <h2>{questions[currentQuestionIndex].question}</h2>
          {questions[currentQuestionIndex].options.map((option, index) => (
            <div key={index}>
              <input
                type="radio"
                value={option} // shows list of names
                name={`question-${currentQuestionIndex}`} // required, otherwise user can select multiple options for the same question
                onChange={(e) => setSelectedAnswer(e.target.value)}
                checked={selectedAnswer === option} // required otherwise previous radio selection will be shown to next question
              />
              {option}
            </div>
          ))}
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button onClick={handleNextQuestion}>Next</button>
        </div>
      ) : (
        <div>
          <h2>Quiz Completed!</h2>
          <h2>
            score: {score}/{questions.length}
          </h2>
        </div>
      )}
    </div>
  );
}
