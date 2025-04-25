"use client";

import { useSearchParams } from "next/navigation";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const score = searchParams.get("score");

  return (
    <div className="min-h-screen bg-[#2A2438] text-white flex flex-col items-center justify-center">
      <div className="bg-purple-900 p-6 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Your Score</h1>
        <p className="text-xl">You got {score} out of 3 correct!</p>
      </div>
    </div>
  );
}
