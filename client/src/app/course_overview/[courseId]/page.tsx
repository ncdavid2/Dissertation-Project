"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Comment, Course, Page, User } from "@/types/types";

export default function CoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [comment, setComment] = useState("");
  const { courseId } = useParams();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [completedPageCount, setCompletedPageCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!user || !course) return;
    const stored = localStorage.getItem(`completedPages-${user.id}`);
    if (stored) {
      const completed = JSON.parse(stored);
      setCompletedPageCount(course.pages.filter((p: Page) => completed.includes(p.id)).length);
    }
  }, [user, course]);  

  useEffect(() => {
    if (user && course && completedPageCount === course.pages.length) {
      const finishedCoursesKey = `finishedCourses-${user.id}`;
      const existing = JSON.parse(localStorage.getItem(finishedCoursesKey) || "[]");
  
      if (!existing.includes(course.title)) {
        const updated = [...existing, course.title];
        localStorage.setItem(finishedCoursesKey, JSON.stringify(updated));
      }
    }
  }, [completedPageCount, course, user]);  
  
  const progressPercent =
    course?.pages?.length ? (completedPageCount / course.pages.length) * 100 : 0;

  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        try {
          const response = await fetch(`http://localhost:4000/graphql`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                query GetCourse($id: ID!) {
                  course(id: $id) {
                    id
                    title
                    description
                    image
                    averageRating
                    pages {
                      id
                      type
                    }
                    comments {
                      user {
                        username
                        profileImage
                      }
                      text
                      createdAt
                    }
                  }
                }
              `,
              variables: { id: courseId },
            }),
          });

          const result = await response.json();

          if (result.errors) {
            throw new Error(result.errors[0].message);
          }

          setCourse(result.data.course);
          setAverageRating(result.data.course.averageRating);
          setComments(result.data.course.comments);
        } catch (error) {
          console.error("Error fetching course:", error);
        }
      };

      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);  

  const handleRate = async (value: number) => {
    setUserRating(value);
  
    await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        query: `
          mutation RateCourse($courseId: ID!, $value: Int!) {
            rateCourse(courseId: $courseId, value: $value) {
              averageRating
            }
          }
        `,
        variables: {
          courseId: course?.id,
          value,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          console.error(data.errors[0].message);
        } else {
          setAverageRating(data.data.rateCourse.averageRating);
        }
      });
  };
  
  const handleAddComment = async () => {
    if (!comment.trim()) return;
  
    const res = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        query: `
          mutation AddComment($courseId: ID!, $text: String!) {
            addComment(courseId: $courseId, text: $text) {
              comments {
                user {
                  username
                  profileImage
                }
                text
                createdAt
              }
            }
          }
        `,
        variables: {
          courseId: course?.id,
          text: comment,
        },
      }),
    });
  
    const data = await res.json();
  
    if (data.errors) {
      console.error(data.errors[0].message);
    } else {
      setComments(data.data.addComment.comments);
      setComment("");
    }
  };
  

  if (!course) {
    return (
      <div className="min-h-screen bg-[#3b2e4a] flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleStart = () => {
    const firstPage = course.pages?.[0];
    if (firstPage) {
      router.push(`/course_pages/${firstPage.id}`);
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
              <span className="text-xl">{course.title}</span>
            </div>
          </div>
          <div className="bg-white px-3 py-1 rounded">
            <span className="font-medium text-black">LearningPulse</span>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden mb-6">
          <div
            className="aspect-video w-full bg-cover"
            style={{ backgroundImage: `url(${course.image || "/placeholder.svg"})` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mb-4">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 cursor-pointer ${
                (userRating ?? averageRating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-white"
              }`}
              onClick={() => handleRate(star)}
            />
          ))}
        </div>
        {user && (
          <div className="flex items-center gap-3">
              <span className="text-white">
                {completedPageCount}/{course.pages?.length || 0}
              </span>
            <div className="w-48 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

          {user?.role === "teacher" && (
          <div className="flex gap-3">
            <button
              data-cy="add-page-button"
              onClick={() => router.push(`/course_create/typ_select?courseId=${course.id}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2"
            >
              Add Page
            </button>
            <button
              data-cy="edit-course"
              onClick={() => router.push(`/course_create/create_course?courseId=${course.id}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2"
            >
              Edit Course
            </button>
          </div>
          )}
          <button
            data-cy="start-course"
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-2"
          >
            Start
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-white text-xl mb-2">Description</h2>
          <p className="text-white ml-6">{course.description}</p>
        </div>

        <div className="mt-4">
        <h2 className="text-white text-xl mb-4">Comments</h2>
          {comments.map((c, i) => (
            <div key={i} className="flex items-start gap-3 mb-3 bg-white p-3 rounded shadow">
              <img
                src={c.user.profileImage || "/default-avatar.png"}
                alt={c.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-purple-800">{c.user.username}</p>
                <p className="text-black">{c.text}</p>
                <p className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-3 mt-4">
            <input
              type="text"
              placeholder="Comment"
              className="bg-white border-none p-2 rounded w-full text-black"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={handleAddComment}
              className="bg-purple-500 text-white px-4 py-2 rounded"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
