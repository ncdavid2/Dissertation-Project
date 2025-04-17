"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateCoursePage() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  useEffect(() => {
    console.log({ comment, setComment });
  }, [comment, setComment]);

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          const response = await fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query GetCourse($id: ID!) {
                  course(id: $id) {
                    title
                    description
                    image
                  }
                }
              `,
              variables: { id: courseId },
            }),
          });

          const result = await response.json();
          const course = result.data.course;

          setCourseTitle(course.title);
          setCourseDescription(course.description);
          setCourseImage(course.image);
        } catch (error) {
          console.error("Error fetching course:", error);
        }
      };

      fetchCourse();
    }
  }, [courseId]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setCourseImage(reader.result as string);
      };
    }
  };  

  const handleSubmit = async () => {
    const isEditing = !!courseId;

    const query = isEditing
      ? `
        mutation UpdateCourse($id: ID!, $title: String!, $description: String!, $image: String) {
          updateCourse(id: $id, title: $title, description: $description, image: $image) {
            id
            title
          }
        }
      `
      : `
        mutation CreateCourse($title: String!, $description: String!, $image: String) {
          createCourse(title: $title, description: $description, image: $image) {
            id
            title
          }
        }
      `;

    const variables = isEditing
      ? { id: courseId, title: courseTitle, description: courseDescription, image: courseImage ?? "" }
      : { title: courseTitle, description: courseDescription, image: courseImage ?? "" };

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if (result.errors) throw new Error(result.errors[0].message);

      router.push("/");
    } catch (error) {
      console.error("Error submitting course:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#3b2e4a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#3b2e4a] rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push("/")}
            className="text-purple-400 text-lg font-medium"
          >
            Back
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">Create New Course</span>
            </div>
          </div>
          <div className="bg-white px-3 py-1 rounded">
            <span className="font-medium text-black">LearningPulse</span>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden mb-6">
          {/* Image Upload Section */}
          <div className="aspect-video w-full">
            {courseImage ? (
              <img
                src={courseImage}
                alt="Course Image Preview"
                className="object-cover w-full h-full rounded-md"
              />
            ) : (
              <div className="w-full h-full bg-purple-300/20 rounded-md flex items-center justify-center">
                <span className="text-black">No image selected</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-4 text-black"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-white text-xl mb-2">Course Title</h2>
          <input
            data-cy="Course-title"
            type="text"
            placeholder="Enter course title"
            className="w-full p-2 bg-white text-black rounded"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-white text-xl mb-2">Course Description</h2>
          <textarea
            data-cy="Course-Description"
            placeholder="Enter course description"
            className="w-full p-2 bg-white text-black rounded"
            rows={4}
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          </div>
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-2"
          >
            Create Course
          </button>
        </div>
    </div>
  );
}
