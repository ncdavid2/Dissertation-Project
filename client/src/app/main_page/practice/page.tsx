"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
};

export default function PracticePage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ getRandomQuestion { question answers correctAnswerIndex } }`,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.errors) {
          console.error("GraphQL Error:", data.errors);
          return;
        }
        setQuestion(data.data.getRandomQuestion);
      })
      .catch(err => console.error("Network error:", err));
  }, []);
  

  const handleSubmit = () => {
    if (selectedIndex === null || question === null) return;
    setResult(selectedIndex === question.correctAnswerIndex ? "correct" : "wrong");
  };

  return (
    <div className="min-h-screen bg-[#2A2438] text-white flex flex-col items-center justify-center px-4">
      {question ? (
        <div className="max-w-xl w-full bg-purple-900 p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-2xl font-bold">{question.question}</h2>
          <div className="space-y-2">
            {question.answers.map((ans, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`block w-full text-left px-4 py-2 rounded-lg ${
                  selectedIndex === idx ? "bg-purple-400" : "bg-purple-700 hover:bg-purple-600"
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
              <p className={`mt-4 font-medium text-lg ${result === "correct" ? "text-green-400" : "text-red-400"}`}>
                {result === "correct" ? "Correct!" : "Wrong Answer"}
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg"
              >
                Done
              </button>
            </>
          )}
        </div>
      ) : (
        <p>Loading question...</p>
      )}
    </div>
  );
}
