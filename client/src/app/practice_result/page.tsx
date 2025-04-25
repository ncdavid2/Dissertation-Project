"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const score = searchParams.get("score");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#2A2438] text-white flex flex-col items-center justify-center">
      <div className="bg-purple-900 p-6 rounded-xl shadow-lg text-center space-y-4">
        <h1 className="text-3xl font-bold">Your Score</h1>
        <p className="text-xl">You got {score} out of 3 correct!</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 w-full bg-green-600 hover:bg-green-500 py-2 px-4 rounded-lg"
        >
          Finish Quiz
        </button>
      </div>
    </div>
  );
}
