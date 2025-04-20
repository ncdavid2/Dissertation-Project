"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import RegisterImg from "../../../../images/RegisterPage.jpg";
import config from "../../../../default/config";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const TEACHER_ACCESS_PASSWORD = "teach2025";
  const [teacherPassword, setTeacherPassword] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.role === "teacher" && teacherPassword !== TEACHER_ACCESS_PASSWORD) {
      setErrorMessage("Invalid teacher access password.");
      return;
    }    

    try {
      const response = await fetch(config.BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CreateUser($first_name: String!, $last_name: String!, $username: String!, $email: String!, $password: String!, $role: String!) {
              createUser(
                first_name: $first_name
                last_name: $last_name
                username: $username
                email: $email
                password: $password
                role: $role
              ) {
                id
                username
              }
            }
          `,
          variables: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          },
        }),
      });
  
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
  
      alert("User registered successfully!");
      router.push("/authentication/login");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    }
  };  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2A2438] p-4 md:p-8 relative">
      {/* Back Button in Top Left Corner */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 flex items-center text-white hover:text-gray-300"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Home
      </button>

      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#352F44]">
        <div className="grid md:grid-cols-2">
          {/* Image Section */}
          <div className="relative hidden md:block">
            <Image
              src={RegisterImg}
              alt="Illustration"
              width={600}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Form Section */}
          <div className="p-6 md:p-8 lg:p-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Register with email
                </h1>
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/authentication/login")}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Login
                  </button>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-white">
                      First name
                    </label>
                    <input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-[#413A55] border-0 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-white">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-[#413A55] border-0 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-white">
                    Username
                  </label>
                  <input
                    id="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-[#413A55] border-0 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-white">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-[#413A55] border-0 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label htmlFor="role" className="text-white">Role</label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-[#413A55] border-0 text-white"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                </div>

                {/* Teacher Password */}
                {formData.role === "teacher" && (
                  <div className="space-y-2">
                    <label htmlFor="teacherPassword" className="text-white">
                      Teacher Access Password
                    </label>
                    <input
                      id="teacherPassword"
                      type="password"
                      placeholder="Enter teacher access password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full p-2 rounded bg-[#413A55] border-0 text-white placeholder:text-gray-400"
                      required
                    />
                  </div>
                )}

                {/* Password with Eye Icon */}
                <div className="space-y-2 relative">
                  <label htmlFor="password" className="text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-2 rounded bg-[#413A55] border-0 text-white placeholder:text-gray-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full p-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Register
                </button>
              </form>

              {/* Display error message */}
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
