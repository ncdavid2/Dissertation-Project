"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

export default function PageViewer() {
  const { pageID } = useParams();
  const router = useRouter();

  const [page, setPage] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submittedQuestions, setSubmittedQuestions] = useState<boolean[]>([]);
  const [user, setUser] = useState<any>(null);
  const [completedPages, setCompletedPages] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    if (!user) return;
    const storedProgress = localStorage.getItem(`completedPages-${user.id}`);
    if (storedProgress) {
      setCompletedPages(JSON.parse(storedProgress));
    }
  }, [user]);

  useEffect(() => {
    if (page && page.type === "text") {
      markPageComplete(page.id);
    }
  }, [page, completedPages]);

  const markPageComplete = (pageId: string) => {
    if (!user) return;

    if (!completedPages.includes(pageId)) {
      const updated = [...completedPages, pageId];
      setCompletedPages(updated);
      localStorage.setItem(`completedPages-${user.id}`, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (!pageID) return;

    const fetchPage = async () => {
      try {
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetPage($pageID: ID!) {
                page(id: $pageID) {
                  id
                  type
                  title
                  videoUrl
                  questions {
                    question
                    answers
                    correctAnswerIndex
                  }
                  steps {
                    image
                    explanation
                  }
                  course {
                    id
                    pages {
                      id
                      title
                    }
                  }
                }
              }
            `,
            variables: { pageID },
          }),
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);

        setPage(result.data.page);
        setPages(result.data.page.course.pages);
      } catch (err: any) {
        console.error("Page fetch error:", err);
        setError(err.message || "Failed to load page.");
      }
    };

    fetchPage();
  }, [pageID]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getNextPageId = () => {
    if (!pages || !page) return null;
    const currentPageIndex = pages.findIndex((p: any) => p.id === page.id);
    const nextPageIndex = currentPageIndex + 1;

    if (nextPageIndex < pages.length) {
      return pages[nextPageIndex].id;
    } else {
      return null;
    }
  };

  const getPreviousPageId = () => {
    if (!pages || !page) return null;
    const currentPageIndex = pages.findIndex((p: any) => p.id === page.id);
    const previousPageIndex = currentPageIndex - 1;

    if (previousPageIndex >= 0) {
      return pages[previousPageIndex].id;
    } else {
      return null;
    }
  };

  const isLastPage = () => {
    if (!pages || !page) return false;
    const currentPageIndex = pages.findIndex((p) => p.id === page.id);
    return currentPageIndex === pages.length - 1;
  };

  const handleNextPage = () => {
    const nextPageId = getNextPageId();
    if (nextPageId) {
      router.push(`/course_pages/${nextPageId}`);
    }
  };

  const handlePreviousPage = () => {
    const prevPageId = getPreviousPageId();
    if (prevPageId) {
      router.push(`/course_pages/${prevPageId}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800">
        {error}
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#2A2438]">
        <p>Loading...</p>
      </div>
    );
  }

  const allQuestionsSubmitted = () => {
    if (!page?.questions?.length) return true;
    return page.questions.every((_: any, i: number) => submittedQuestions[i]);
  };  

  const nextPageId = getNextPageId();

  return (
    <div className="min-h-screen bg-[#2A2438] p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-purple-500/10 rounded-xl shadow-lg p-6 text-white relative">
        <button
          onClick={() =>
            router.push(courseId ? `/course_overview/${courseId}` : "/")
          }
          className="text-purple-300 text-lg font-medium mb-4"
        >
          Home
        </button>

        {user?.role === "teacher" && (
          <button
            data-cy="edit-Video-Page"
            onClick={() => {
              const cid = courseId || page.course?.id;
              if (!cid) {
                alert("Missing course ID");
                return;
              }
              const route =
                page.type === "video"
                  ? `/course_create/multiple_choice?courseId=${cid}&pageId=${page.id}`
                  : `/course_create/text_choice?courseId=${cid}&pageId=${page.id}`;
              router.push(route);
            }}
            className="absolute top-6 right-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-6"
          >
            Edit Page
          </button>
        )}

        {page.type === "video" && page.videoUrl && (
          <video src={page.videoUrl} controls className="w-full rounded-lg mb-6" />
        )}

        {page.type === "text" && page.steps?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-purple-300 mb-4">Code Explanation</h2>
            {page.steps.map((step: any, i: number) => (
              <div key={i} className="bg-purple-100/10 p-4 rounded-lg">
                <img
                  src={step.image}
                  alt=" "
                  className="rounded mb-3 max-h-120 w-full object-contain"
                />
                <p className="text-white whitespace-pre-wrap">{step.explanation}</p>
              </div>
            ))}
          </div>
        )}

        {page.questions?.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-xl font-bold text-purple-300 mb-4">Quiz</h2>
            {page.questions.map((q: any, i: number) => {
              const isSubmitted = submittedQuestions[i];
              const isCorrect = selectedAnswers[i] === q.correctAnswerIndex;

              return (
                <div
                  key={i}
                  className="mb-6 bg-purple-100 p-4 rounded-lg shadow text-black"
                  data-question-index={i}
                  data-testid={`question-${i}`}
                >
                  <p className="font-semibold mb-3 text-purple-900">
                    {i + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.answers.map((ans: string, idx: number) => (
                      <label key={idx} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          data-testid={`question-${i}-answer-${idx}`}
                          checked={selectedAnswers[i] === idx}
                          onChange={() => {
                            if (!isSubmitted) {
                              const newSelected = [...selectedAnswers];
                              newSelected[i] = idx;
                              setSelectedAnswers(newSelected);
                            }
                          }}
                          disabled={isSubmitted}
                          className="form-checkbox text-purple-600"
                        />
                        <span>{ans}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    data-testid={`submit-question-${i}`}
                    onClick={() => {
                      const newSubmitted = [...submittedQuestions];
                      newSubmitted[i] = true;
                      setSubmittedQuestions(newSubmitted);

                      if (isCorrect && page.id) {
                        markPageComplete(page.id);
                      }
                    }}
                    disabled={isSubmitted || selectedAnswers[i] == null}
                    className={`mt-4 px-4 py-2 rounded font-semibold text-white ${
                      isSubmitted
                        ? isCorrect
                          ? "bg-green-500"
                          : "bg-red-500"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {isSubmitted ? (isCorrect ? "Correct!" : "Wrong") : "Submit"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {getPreviousPageId() && (
            <button
              onClick={handlePreviousPage}
              className="px-4 py-2 rounded font-semibold text-white bg-purple-600 hover:bg-purple-700"
            >
              Back
            </button>
          )}
          {nextPageId && (
            <button
              onClick={handleNextPage}
              disabled={!allQuestionsSubmitted()}
              data-testid={`submit-question-submit`}
              className={`px-4 py-2 rounded font-semibold text-white ${
                allQuestionsSubmitted()
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-purple-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          )}
        </div>
        {isLastPage() && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/course_complete")}
              disabled={!allQuestionsSubmitted()}
              data-testid={`finish-course`}
              className={`px-4 py-2 rounded font-semibold text-white ${
                allQuestionsSubmitted()
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-purple-400 cursor-not-allowed"
              }`}
            >
              Finish Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
