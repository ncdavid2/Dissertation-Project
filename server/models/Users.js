import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: {type: String, required: false},
    notes: {type: String, required: false},
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ["student", "teacher"], default: "student" },
    progress: [
        {
          courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
          completedPages: [{ type: mongoose.Schema.Types.ObjectId }]
        }
    ]      
});

export default mongoose.model("User", UserSchema);
