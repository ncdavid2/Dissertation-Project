"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/types";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<string>(""); 
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log({ user });
  }, [user]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserId(parsed.id);
      setUser(parsed);
      fetchUserNotes(parsed.id);
    }
  }, []);

  const fetchUserNotes = async (id: string) => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              getUserByID(id: "${id}") {
                notes
              }
            }
          `,
        }),
      });

      const result = await response.json();
      setNotes(result.data.getUserByID?.notes || "");
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          query: `
            mutation updateUser($id: ID!, $notes: String) {
              updateUser(id: $id, notes: $notes) {
                id
                notes
              }
            }
          `,
          variables: {
            id: userId,
            notes: notes,
          },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        console.error(result.errors);
        return;
      }

    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A2438] text-white px-10 py-8 mx-auto">
      <button
        onClick={() => router.push("/")}
        className="text-purple-400 text-lg font-medium"
      >
        Back
      </button>
      <h1 className="text-3xl font-bold mb-4">Your Notes</h1>
      <textarea
        className="w-full min-h-[300px] p-4 text-black rounded-lg resize-y bg-white"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}
