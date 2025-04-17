"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Play } from "lucide-react";

export default function PageSelection() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const handleSelection = (type: string) => {
    setSelectedOption(type);

    if (type === "video") {
      router.push(`/course_create/multiple_choice?courseId=${courseId}`);
    } else if (type === "code") {
      router.push(`/course_create/text_choice?courseId=${courseId}`);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-[#2D1B47] p-4">
        <div className="w-full max-w-3xl bg-[#3A2154] rounded-3xl p-8 shadow-lg">
          <div className="flex items-center mb-8">
            <button 
            onClick={() =>
              courseId
                ? router.push(`/course_overview/${courseId}`)
                : router.back()
            }
            className="text-purple-200 hover:text-white hover:bg-purple-800/30 flex items-center px-3 py-1 rounded">
              <div className="h-4 w-4 mr-1" />
              Back
            </button>
            <h1 className="text-white text-center flex-1 pr-16">
              Select the type of Page that should be created!
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              data-cy="video-page-option"
              className={`bg-white rounded-lg p-4 cursor-pointer transition-transform ${
                selectedOption === "video"
                  ? "ring-2 ring-purple-400 scale-[1.02]"
                  : ""
              }`}
              onClick={() => handleSelection("video")}
            >
              <div className="bg-[#1A1A1A] aspect-video flex items-center justify-center rounded mb-4">
                <Play className="h-10 w-10 text-white" />
              </div>
              <p className="text-center font-medium text-black">Video Page</p>
            </div>

            <div
              data-cy="code-page-option"
              className={`bg-white rounded-lg p-4 cursor-pointer transition-transform ${
                selectedOption === "code"
                  ? "ring-2 ring-purple-400 scale-[1.02]"
                  : ""
              }`}
              onClick={() => handleSelection("code")}
            >
              <div className="bg-[#1A1A1A] aspect-video flex items-center justify-center rounded mb-4">
                <div className="text-white text-center">
                  <div>Code</div>
                  <div>Section</div>
                </div>
              </div>
              <p className="text-center font-medium text-black">Code Class</p>
            </div>
          </div>
        </div>
      </div>
  );
}
