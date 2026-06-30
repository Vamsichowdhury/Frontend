import QuizCard from "./QuizCard";

export default function Quiz() {
  // question should be different category
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris",
    },
    {
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Jupiter", "Saturn", "Mars"],
      answer: "Jupiter",
    },
    {
      question: "What is the chemical symbol for gold?",
      options: ["Au", "Ag", "Fe", "Hg"],
      answer: "Au",
    },
    {
      question: "What is the smallest prime number?",
      options: ["0", "1", "2", "3"],
      answer: "2",
    },
  ];
  return (
    <div>
      <h1>Quiz App</h1>
      <QuizCard questions={questions} />
    </div>
  );
}
