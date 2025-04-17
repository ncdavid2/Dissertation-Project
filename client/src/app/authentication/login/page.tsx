"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import LoginImg from "../../../../images/LoginPage.jpg";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = `
        mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                token
                user {
                    id
                    email
                    username
                    bio
                    profileImage
                    role
                }
            }
        }
    `;

    const { email, password } = formData;

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { email, password },
        }),
      });

        const { data, errors } = await response.json();

        if (errors) {
            throw new Error(errors[0].message);
        }

        const token = data.login.token;
        const userData = data.login.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        router.push("/");
    } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    }
};

  const isFormValid = formData.email && formData.password;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#2A2438] p-4">
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 flex items-center text-white hover:text-gray-300"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Home
      </button>

      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-[#3A2F4A]">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-2/3">
            <Image
              src={LoginImg}
              alt=""
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex w-full flex-col justify-center p-8 md:w-1/3">
            <div className="mx-auto w-full max-w-md space-y-6">
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">Login with email</h1>
                <p className="text-sm text-gray-300">
                  Don't have an account?{" "}
                  <button
                    onClick={() => router.push("/authentication/register")}
                    className="text-[#B66EFC] hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full rounded-md bg-[#4A3E5A] px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#B66EFC]"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="password" className="text-white">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full rounded-md bg-[#4A3E5A] px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#B66EFC] pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-9 right-3 flex text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-red-400 text-sm text-center">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full rounded-md py-3 font-medium text-white transition-colors ${
                    isFormValid ? "bg-[#B66EFC] hover:bg-[#A15EEC]" : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
