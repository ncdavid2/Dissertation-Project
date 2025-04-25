import { Suspense } from "react";
import ResultContent from "./ResultContent";

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-[#2A2438] text-white flex flex-col items-center justify-center">
      <Suspense fallback={<p className="text-white">Loading result...</p>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
