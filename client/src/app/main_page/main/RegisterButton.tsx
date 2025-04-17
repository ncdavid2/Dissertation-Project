"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);
  

  return user ? null : (
    <button
      onClick={() => {
        router.push("/authentication/register");
      }}
      className="text-white p-2"
    >
      Register
    </button>
  );
}