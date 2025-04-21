"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/types";
import config from "../../../default/config";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = useState("/default-avatar.png");
  const [finishedCourses, setFinishedCourses] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    password: "",
    profileImage: "",
  });

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        username: parsedUser.username || "",
        bio: parsedUser.bio || "",
        password: "",
        profileImage: parsedUser.profileImage || "",
      });
      setPreviewImage(parsedUser.profileImage || "/default-avatar.png");
  
      const finished = localStorage.getItem(`finishedCourses-${parsedUser.id}`);
      if (finished) {
        setFinishedCourses(JSON.parse(finished));
      }
    }
  }, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    if (!user) return;

    if (!formData.password) {
      alert("Please enter a new password to save changes.");
      return;
    }

    try {
      const response = await fetch(config.BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($id: ID!, $username: String, $password: String, $bio: String, $profileImage: String) {
              updateUser(id: $id, username: $username, password: $password, bio: $bio, profileImage: $profileImage) {
                username
                bio
                profileImage
              }
            }
          `,
          variables: {
            id: user.id,
            username: formData.username,
            password: formData.password || undefined,
            bio: formData.bio,
            profileImage: formData.profileImage,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        alert("Error updating profile: " + data.errors[0].message);
        return;
      }

      const updatedUser = data.data.updateUser;
      const mergedUser = { ...user, ...updatedUser };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      setUser(mergedUser);
      alert("Profile updated successfully!");

      router.push("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#3b2d4b]">
      {/* Sidebar */}
      <div className="w-[180px] p-4 flex flex-col border-r border-[#4a3a5a]">
        <div className="mb-6">
          <h1 className="text-white font-semibold text-lg">LearningPulse</h1>
        </div>
        <nav className="flex flex-col space-y-2 text-sm">
          <h1 className="text-white font-semibold text-lg">Overview</h1>
          <button
            onClick={() => router.push("/")}
            className="text-[#a99bb4] hover:text-white flex items-center gap-2 text-left"
          >
            <span className="w-4 h-4 inline-block">□</span> Dashboard
          </button>
          <button
            onClick={() => router.push("/main_page/notes")}
            className="text-[#a99bb4] hover:text-white flex items-center gap-2 text-left"
          >
            <span className="w-4 h-4 inline-block">□</span> Notes
          </button>
        </nav>
        <div className="mt-auto">
          <div className="text-[#a99bb4] text-xs">&lt;</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-[#4a3a5a] rounded-3xl p-8">
          <h2 className="text-white text-xl mb-6 text-center">Settings</h2>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              {/* Account section */}
              <div className="mb-8">
                <h3 className="text-white mb-4">Account</h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-white mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="bg-white border-none rounded-md w-full p-2 text-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-white mb-2">
                      Change Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-white border-none rounded-md w-full p-2 pr-10 text-black"
                      />
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-white mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="bg-white border-none rounded-md w-full h-32 p-2 text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Finished Lessons section */}
            <div>
              <h3 className="text-white mb-4">Finished Lessons</h3>
              <div className="flex flex-wrap gap-2">
                {finishedCourses.length === 0 ? (
                  <span className="text-[#a99bb4] text-sm">No completed courses yet.</span>
                ) : (
                  finishedCourses.map((title, index) => (
                    <span
                      key={index}
                      className="bg-[#8a4bdb] text-white text-xs px-3 py-1 rounded-full"
                    >
                      {title}
                    </span>
                 ))
                )}
              </div>
            </div>

            </div>

            {/* Profile Picture Upload */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setPreviewImage(base64);
                    setFormData((prev) => ({ ...prev, profileImage: base64 }));
                  };
                }}
                className="hidden"
              />
              
              <label htmlFor="profileImageInput" className="cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white hover:opacity-80 transition">
                  <img
                    src={previewImage}
                    alt=""
                    className="object-cover w-32 h-32"
                  />
                </div>
              </label>

              <span className="mt-2 text-white text-xs">Press to change Profil</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSaveChanges}
              className="bg-[#8a4bdb] hover:bg-[#7a3bcb] text-white border-none rounded-md px-4 py-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
