"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import config from "../../../../default/config";

type Step = {
  image: string | null;
  explanation: string;
};

export default function ScreenshotExplanationPage() {
  const [steps, setSteps] = useState<Step[]>([{ image: null, explanation: "" }]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const pageId = searchParams.get("pageId");

  useEffect(() => {
    if (!pageId) return;

    const fetchPage = async () => {
      try {
        const response = await fetch(config.BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetPage($pageID: ID!) {
                page(id: $pageID) {
                  steps {
                    image
                    explanation
                  }
                }
              }
            `,
            variables: { pageID: pageId },
          }),
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);

        const { steps } = result.data.page;
        const formattedSteps = steps.map((step: Step) => ({
          file: step.image,
          explanation: step.explanation,
        }));
        setSteps(formattedSteps);
      } catch (err) {
        console.error("Error loading page:", err);
      }
    };

    fetchPage();
  }, [pageId]);

  const handleImageUpload = (index: number, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const updated = [...steps];
      updated[index].image = reader.result as string;
      setSteps(updated);
    };
  };

  const handleExplanationChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index].explanation = value;
    setSteps(updated);
  };

  const addStep = () => {
    setSteps([...steps, { image: null, explanation: "" }]);
  };

  const handleSubmit = async () => {
    if (!courseId || courseId === "null") {
      alert("Missing or invalid course ID");
      return;
    }    

    try {
      for (const step of steps) {
        if (!step.explanation) {
          alert("Please provide an explanation for each step");
          return;
        }        

        const mutation = pageId
        ? `
            mutation UpdatePage($pageId: ID!, $image: String, $explanation: String!) {
              updatePage(pageId: $pageId, image: $image, explanation: $explanation) {
                id
              }
            }
          `
        : `mutation AddPageToCourse($courseId: ID!, $image: String, $explanation: String!) {
                addPageToCourse(courseId: $courseId, image: $image, explanation: $explanation) {
                  id
                }
              }
            `;

        const response = await fetch(config.BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            query: mutation,
            variables: pageId
          ? {
              pageId,
              image: step.image,
              explanation: step.explanation,
            }
          : {
              courseId,
              image: step.image,
              explanation: step.explanation,
            },
          }),
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
      }

      alert("Explanation Page Submitted!");
      router.push(`/course_overview/${courseId}`);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit page");
    }
  };

  return (
      <div className="min-h-screen bg-[#2D1B47] flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-[#3A2154] p-8 rounded-3xl shadow-lg space-y-6 text-white">
          <button
            onClick={() =>
              pageId ? router.push(`/course_pages/${pageId}`) : router.back()
            }
            className="text-purple-200 hover:text-white hover:bg-purple-800/30 flex items-center px-3 py-1 rounded"
          >
            Back
          </button>

          <h1 className="text-2xl font-bold mb-4">
            {pageId ? "Edit Screenshot Explanation Page" : "Create Screenshot Explanation Page"}
          </h1>

          {steps.map((step, index) => (
            <div key={index} className="bg-[#452b64] p-4 rounded-xl mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                className="w-full mb-3 p-2 rounded bg-white text-black"
              />

              {step.image && (
                <div className="mb-3">
                  <img
                    src={step.image}
                    alt={`Preview Step ${index + 1}`}
                    className="w-full max-h-60 object-contain rounded"
                  />
                </div>
              )}

              <textarea
                value={step.explanation}
                data-testid="text-editor"
                onChange={(e) => handleExplanationChange(index, e.target.value)}
                rows={4}
                placeholder="Write your text here"
                className="w-full p-2 rounded bg-white text-black"
              />
            </div>
          ))}

          <button
            onClick={addStep}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full"
          >
            <Plus className="h-5 w-5" />
            Add Another Step
          </button>

          <div className="flex justify-end">
            <button
              data-cy="submit-code-page"
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full font-semibold"
            >
              Submit Page
            </button>
          </div>
        </div>
      </div>
  );
}
