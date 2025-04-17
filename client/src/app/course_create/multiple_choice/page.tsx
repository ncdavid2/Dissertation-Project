"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, Plus } from "lucide-react";

export default function VideoPageCreation() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState([
    { question: "", answers: ["", "", "", ""], correctAnswerIndex: 0 },
  ]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const pageId = searchParams.get("pageId");

  const MAX_FILE_SIZE_MB = 100;

  useEffect(() => {
    if (pageId) {
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
                    videoUrl
                    questions {
                      question
                      answers
                      correctAnswerIndex
                    }
                  }
                }
              `,
              variables: { pageID: pageId },
            }),
          });

          const result = await response.json();
          if (result.errors) throw new Error(result.errors[0].message);

          const { questions } = result.data.page;
          setQuestions(questions || [
            { question: "", answers: ["", "", "", ""], correctAnswerIndex: 0 },
          ]);
        } catch (err) {
          console.error("Error fetching page:", err);
        }
      };

      fetchPage();
    }
  }, [pageId]);

  const convertMP4ToBase64 = (file: File): Promise<string> => {
    if (file.type !== "video/mp4") {
      return Promise.reject(new Error("File is not an MP4 video"));
    }
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };  

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
  
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`Max file size is ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_video_upload");
  
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dufhe1s2i/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      setVideoURL(data.secure_url);
      setVideoFile(file);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload video");
    }
  };  

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", answers: ["", "", "", ""], correctAnswerIndex: 0 },
    ]);
  };

  const handleSubmit = async () => {
    if (!courseId) {
      alert("Missing course ID");
      return;
    }
  
    try {
      let videoUrlToUse = "";
  
      videoUrlToUse = videoURL || "";
  
      const mutation = pageId
        ? `
          mutation UpdateVideoPage($pageId: ID!, $videoUrl: String!, $questions: [QuestionInput!]!) {
            updateVideoPage(pageId: $pageId, videoUrl: $videoUrl, questions: $questions) {
              id
            }
          }
        `
        : `
          mutation AddVideoPageToCourse($courseId: ID!, $videoUrl: String!, $questions: [QuestionInput!]!) {
            addVideoPageToCourse(courseId: $courseId, videoUrl: $videoUrl, questions: $questions) {
              id
            }
          }
        `;
  
      const variables = pageId
        ? { pageId, videoUrl: videoUrlToUse, questions }
        : { courseId, videoUrl: videoUrlToUse, questions };
  
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });
  
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
  
      alert("Page saved successfully!");
      router.push(`/course_overview/${courseId}`);
    } catch (error) {
      console.error("Page save error:", error);
      alert("Failed to save page");
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

        <h1 className="text-2xl font-bold mb-4">Create a Learning Page</h1>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">Optional Video Upload</label>
          <input
            type="file"
            accept="video/mp4"
            onChange={handleVideoUpload}
            className="bg-white text-black rounded p-2 w-full"
          />
          {videoFile && (
            <p className="mt-2 text-sm text-green-300">
              Selected: {videoFile.name}
            </p>
          )}

          {videoURL && (
            <video
            controls
            className="w-full mt-4 rounded-lg shadow-md"
            src={videoURL}
            />
          )}
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-[#452b64] p-4 rounded-xl mb-4">
            <label className="block mb-2 font-semibold">
              Question {qIndex + 1}
            </label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              className="w-full p-2 rounded bg-white text-black mb-3"
              placeholder="Enter your question"
            />

            {q.answers.map((ans, aIndex) => (
              <div key={aIndex} className="flex items-center space-x-3 mb-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctAnswerIndex === aIndex}
                  onChange={() => {
                    const updated = [...questions];
                    updated[qIndex].correctAnswerIndex = aIndex;
                    setQuestions(updated);
                  }}
                  className="accent-purple-500 cursor-pointer"
                />
                <input
                  type="text"
                  value={ans}
                  onChange={(e) =>
                    handleAnswerChange(qIndex, aIndex, e.target.value)
                  }
                  className="flex-1 p-2 rounded bg-white text-black"
                  placeholder={`Answer ${aIndex + 1}`}
                />
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full"
        >
          <Plus className="h-5 w-5" />
          Add Another Question
        </button>

        <div className="flex justify-end">
          <button
            data-cy="submit-video-page"
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
