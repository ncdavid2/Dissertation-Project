"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Book, Pencil, FileText } from "lucide-react";
import LoginImg from "../../../../images/LoginPage.jpg";
import RegisterButton from "./RegisterButton";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string; description: string; image: string }[]>([]);
  const [activeView, setActiveView] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const COURSES_PER_PAGE = 6;
  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);

  const paginatedCourses =
    activeView === "courses"
      ? courses
      : courses.slice(currentPage * COURSES_PER_PAGE, currentPage * COURSES_PER_PAGE + COURSES_PER_PAGE);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `{ getCourses { id title description image } }` }),
    })
      .then((res) => res.json())
      .then((data) => setCourses(data.data.getCourses))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    router.push("/");
  };

  const handleCreateCourse = () => {
    router.push("course_create/create_course");
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-[#2A2438]">
      {/* Header */}
      <header className="w-full bg-purple-700 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-white font-medium cursor-pointer">{user.username}</span>
              <div className="relative">
                <button
                  data-testid="dropdown-toggle"
                  className="text-white"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  &#9662;
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-purple-600 rounded-lg shadow-lg z-50">
                    <ul className="text-white">
                      <li>
                        <button
                          onClick={() => router.push("/settings")}
                          className="w-full px-4 py-2 text-sm hover:bg-purple-500"
                        >
                          Settings
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-sm hover:bg-red-500"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <RegisterButton />
          )}
        </div>

        {user?.role === "teacher" && (
          <button
            onClick={handleCreateCourse}
            className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-6 rounded-lg"
          >
            Create Course Overview
          </button>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Hero Section */}
        {!user?.username && !activeView && (
          <section className="relative overflow-hidden">
            <div className="relative aspect-[16/9] w-full max-w-4xl mx-auto p-6">
              <Image
                src={LoginImg}
                alt="Student studying"
                fill
                className="rounded-2xl object-cover"
                priority
              />
              <div className="absolute inset-0 flex flex-col items-start justify-center p-8 bg-gradient-to-r from-black/50">
                <h1 className="text-3xl font-bold mb-2">Get started with learning!</h1>
                <p className="text-lg mb-4">Register now!</p>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {!activeView && (
          <section className="mx-auto max-w-4xl px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Book, title: "Courses", desc: "Browse all courses", view: "courses" },
                { icon: Pencil, title: "Quiz", desc: "Test your skills", view: "practice" },
                { icon: FileText, title: "Notes", desc: "Take Notes", view: "notes" },
              ].map(({ icon: Icon, title, desc, view }, i) => (
                <button
                  key={i}
                  className="text-left w-full p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-transparent transition hover:border-purple-300 hover:bg-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onClick={() => {
                    if (view === "courses") setActiveView(view);
                    if (view === "notes") {
                      if (user) {
                        router.push("main_page/notes");
                      }
                    }
                    if (view === "practice") router.push("main_page/practice");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-purple-300" />
                    <div>
                      <h3 className="font-medium text-white">{title}</h3>
                      <p className="text-sm text-gray-300">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Back Button */}
        {activeView === "courses" && (
          <div className="max-w-4xl mx-auto px-4 pt-6">
            <button
              onClick={() => setActiveView(null)}
              className="mb-4 text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg"
            >
              ← Back to Home
            </button>
          </div>
        )}

        {/* Course Grid */}
        {(!activeView || activeView === "courses") && (
          <section className="mx-auto max-w-4xl px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedCourses.map((course, i) => (
                <div
                  key={i}
                  onClick={() => router.push(`/course_overview/${course.id}`)}
                  className="p-4 bg-purple-500/10 border-0 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer"
                >
                  <div className="h-32 rounded-md overflow-hidden mb-3">
                    {course.image && course.image !== "" ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-30 w-80 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600">No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-300">{course.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pagination Dots */}
        {!activeView && totalPages > 1 && (
          <div className="flex justify-center gap-2 py-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentPage ? "bg-purple-500" : "bg-purple-500/20"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-4 text-center mt-auto">
        <div>About Us</div>
        <div className="text-xs">All Rights Reserved</div>
      </footer>
    </div>
  );
}
