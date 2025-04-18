import mongoose from "mongoose";

const StepSchema = new mongoose.Schema({
  image: String,
  explanation: String
});

const PageSchema = new mongoose.Schema({
  type: { type: String, enum: ['video', 'text', 'image'], required: true },
  image: String,
  explanation: String,
  videoUrl: { type: String },
  questions: [
    {
      question: String,
      answers: [String],
      correctAnswerIndex: Number
    }
  ],
  steps: [StepSchema],
});

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    pages: [PageSchema],
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 }
      }
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
});

export default mongoose.model("Course", CourseSchema);
