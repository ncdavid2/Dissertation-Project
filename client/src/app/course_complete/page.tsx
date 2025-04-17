"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseComplete() {
  const [correctAnswers, setCorrectAnswers] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const params = new URLSearchParams(window.location.search);
      const cid = params.get("courseId") || localStorage.getItem("lastCompletedCourseId");
      setCourseId(cid);

      if (cid) {
        const correct = localStorage.getItem(`correctAnswers-${parsedUser.id}-${cid}`);
        const total = localStorage.getItem(`totalQuestions-${parsedUser.id}-${cid}`);
        if (correct) setCorrectAnswers(parseInt(correct));
        if (total) setTotalQuestions(parseInt(total));
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#2A2438] px-6">
      <h1 className="text-3xl font-bold mb-4">Course Complete!</h1>
      <p className="text-purple-300 mt-4">Great job finishing the course!</p>
      <button
        onClick={() => router.push("/")}
        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
      >
        Finish
      </button>
    </div>
  );
}
