"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import config from "../../../../default/config";

type Question = {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
};

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      const promises = Array(3)
        .fill(null)
        .map(() =>
          fetch(config.BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `{ getRandomQuestion { question answers correctAnswerIndex } }`,
            }),
          }).then(res => res.json())
        );

      try {
        const results = await Promise.all(promises);
        const newQuestions = results
          .map(r => r.data?.getRandomQuestion)
          .filter(Boolean);
        setQuestions(newQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;

    if (isCorrect) setCorrectCount(prev => prev + 1);

    setResult(isCorrect ? "correct" : "wrong");
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setResult(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      router.push(`/practice_result?score=${correctCount}`);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#2A2438] text-white flex flex-col items-center justify-center px-4">
      {questions.length === 3 ? (
        <div className="max-w-xl w-full bg-purple-900 p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-bold">
            Question {currentIndex + 1} of 3
          </h2>
          <h3 className="text-2xl font-bold">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.answers.map((ans, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  selectedIndex === idx
                    ? "bg-purple-400"
                    : "bg-purple-700 hover:bg-purple-600"
                }`}
              >
                {ans}
              </button>
            ))}
          </div>

          {result === null ? (
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg"
            >
              Submit
            </button>
          ) : (
            <>
              <p
                className={`mt-4 font-medium text-lg ${
                  result === "correct" ? "text-green-400" : "text-red-400"
                }`}
              >
                {result === "correct" ? "Correct!" : "Wrong Answer"}
              </p>
              <button
                onClick={handleNext}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg"
              >
                {currentIndex === 2 ? "See Results" : "Next Question"}
              </button>
            </>
          )}
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}
