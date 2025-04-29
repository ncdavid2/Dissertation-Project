import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import mongoose from 'mongoose';
import User from '../models/Users.js';
import Course from '../models/Courses.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

const express = require("express");
const emailReminderRoute = require("../routes/emailReminder");

const app = express();
app.use(express.json());

app.use("/api/send-reminder", emailReminderRoute);

dotenv.config();
console.log("JWT_SECRET from env:", process.env.JWT_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

const typeDefs = `
  type Query {
    getUsers: [User]
    getUserByID(id: ID!): User
    getCourses: [Course]
    course(id: ID!): Course
    page(id: ID!): Page
    getRandomQuestion: Question
  }

  type Mutation {
    createUser(
      first_name: String!
      last_name: String!
      username: String!
      email: String!
      password: String!
      role: String!
    ): User

    login(email: String!, password: String!): AuthPayload

    updateUser(
      id: ID!
      username: String
      password: String
      bio: String
      notes: String
      profileImage: String
    ): User

    createCourse(
      title: String!
      description: String!
      image: String
    ): Course

    addVideoPageToCourse(
      courseId: ID!
      videoUrl: String!
      questions: [QuestionInput!]!
    ): Course

    addPageToCourse(
      courseId: ID!
      image: String
      explanation: String!
    ): Course

    updateCourse(
      id: ID!
      title: String
      description: String
      image: String
    ): Course
  }

  type AuthPayload {
    token: String
    user: User
  }

  type User {
    id: ID
    first_name: String
    last_name: String
    username: String
    email: String
    password: String
    bio: String
    notes: String
    profileImage: String
    role: String
  }

  type Course {
    id: ID
    title: String
    description: String
    image: String
    averageRating: Float
    pages: [Page]
  }

  type Question {
    question: String
    answers: [String]
    correctAnswerIndex: Int
  }

  type Page {
    id: ID
    title: String
    type: String
    videoUrl: String
    questions: [Question]
    steps: [Step]
    course: CourseRef
  }

  type CourseRef {
    id: ID
    title: String
    pages: [PageRef]
  }

  type PageRef {
    id: ID
    title: String
  }

  type Step {
    image: String
    explanation: String
  }

  input QuestionInput {
    question: String!
    answers: [String!]!
    correctAnswerIndex: Int!
  }

  type Mutation {
    rateCourse(courseId: ID!, value: Int!): Course
  }

  extend type Course {
    averageRating: Float
  }

  type Comment {
    user: User
    text: String
    createdAt: String
  }

  extend type Course {
    comments: [Comment]
  }

  extend type Mutation {
    addComment(courseId: ID!, text: String!): Course
  }

  extend type Mutation {
    updatePage(pageId: ID!, image: String, explanation: String!): Page
  }

  extend type Mutation {
    updateVideoPage(pageId: ID!, videoUrl: String, questions: [QuestionInput!]!): Page
  }

  extend type Query {
    getUserProgress(courseId: ID!): [ID!]
  }

  extend type Mutation {
    markPageComplete(courseId: ID!, pageId: ID!): Boolean
  }
    
  type Mutation {
    deleteCourse(id: ID!): Boolean!
  }`
;

const resolvers = {
  Query: {
    getUsers: async () => await User.find(),
    getUserByID: async (_, args) => await User.findById(args.id),
    getCourses: async () => await Course.find(),
    course: async (_, { id }) => await Course.findById(id),

    page: async (_, { id }) => {
      const objectId = new mongoose.Types.ObjectId(id);
    
      const course = await Course.findOne({ "pages._id": objectId });
      if (!course) throw new Error("Page not found");
    
      const page = course.pages.id(objectId); 
      if (!page) throw new Error("Page not found in course");
    
      return {
        ...page.toObject(),
        id: page._id.toString(),
        course: {
          id: course._id.toString(),
          title: course.title,
          pages: course.pages.map((p) => ({
            id: p._id.toString(),
            title: p.title || "Untitled"
          })),
        },
      };
    },
    getRandomQuestion: async () => {
      const courses = await Course.find({ "pages.questions.0": { $exists: true } });

      const allQuestions = courses.flatMap(course =>
        course.pages
          .filter(page => page.questions && page.questions.length)
          .flatMap(page => page.questions)
      );

      if (allQuestions.length === 0) throw new Error("No questions available");

      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      return allQuestions[randomIndex];
    },
    getUserProgress: async (_, { courseId }, { userId }) => {
      if (!userId) throw new Error("Authentication required");
    
      const user = await User.findById(userId);
      const progress = user.progress.find(
        (p) => p.courseId.toString() === courseId
      );
    
      return progress ? progress.completedPages.map(id => id.toString()) : [];
    },    
  },

  Course: {
    averageRating: (course) => {
      if (!course.ratings || course.ratings.length === 0) return 0;
      const sum = course.ratings.reduce((acc, r) => acc + r.value, 0);
      return sum / course.ratings.length;
    },
    comments: async (course) => {
      const populated = await course.populate("comments.userId");
      return populated.comments.map((comment) => ({
        user: comment.userId,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    createUser: async (_, { first_name, last_name, username, email, password, role }) => {
      if (!first_name || !last_name || !username || !email || !password || !role) {
        throw new Error("All fields are required");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
        role: role === "teacher" ? "teacher" : "student"
      });

      await newUser.save();
      await sendWelcomeEmail(newUser.email, newUser.username);
      return newUser;
    },

    login: async (_, { email, password }) => {
      console.log("Login attempt:", { email, password });
      const user = await User.findOne({ email });
      console.log("User found:", user);

      if (!user) {
        console.log("User not found for email:", email);
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isValidPassword);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      console.log("JWT payload:", { userId: user.id });
      console.log("JWT secret used:", process.env.JWT_SECRET);

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      console.log("Generated token:", token);

      return { token, user };
    },

    updateUser: async (_, { id, username, password, bio, notes, profileImage }, { userId }) => {
      console.log(id, username, password, bio, notes, userId);
      if (!userId) {
        throw new Error("Not authenticated");
      }
      
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
    
      if (userId !== user.id.toString()) {
        throw new Error("Unauthorized");
      }
    
      let updateFields = {};
      if (username) updateFields.username = username;
      if (password) updateFields.password = await bcrypt.hash(password, 10);
      if (bio) updateFields.bio = bio;
      if (notes) updateFields.notes = notes;
      if (profileImage) updateFields.profileImage = profileImage;
    
      return await User.findByIdAndUpdate(id, updateFields, { new: true });
    },

    createCourse: async (_, { title, description, image }) => {
      const newCourse = new Course({
        title,
        description,
        image,
      });
      await newCourse.save();
      return newCourse;
    },

    addVideoPageToCourse: async (_, { courseId, videoUrl, questions }) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
    
      const newPage = {
        type: "video",
        title: "Video Page",
        videoUrl,
        questions
      };
    
      course.pages.push(newPage);
      await course.save();
      return course;
    },

    updateVideoPage: async (_, { pageId, videoUrl, questions }) => {
      const objectId = new mongoose.Types.ObjectId(pageId);
      const course = await Course.findOne({ "pages._id": objectId });
      if (!course) throw new Error("Course not found");
    
      const page = course.pages.id(objectId);
      if (!page) throw new Error("Page not found");
    
      if (videoUrl) page.videoUrl = videoUrl;
      page.questions = questions;
    
      await course.save();
    
      return {
        ...page.toObject(),
        id: page._id.toString(),
      };
    },    

    addPageToCourse: async (_, { courseId, image, explanation }) => {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
    
      const newPage = {
        type: "text",
        title: "Step-by-Step",
        steps: [
          {
            image,
            explanation
          }
        ]
      };      
    
      course.pages.push(newPage);
      await course.save();
      return course;
    },

    updatePage: async (_, { pageId, image, explanation }) => {
      const objectId = new mongoose.Types.ObjectId(pageId);
    
      const course = await Course.findOne({ "pages._id": objectId });
      if (!course) throw new Error("Page not found");
    
      const page = course.pages.id(objectId);
      if (!page) throw new Error("Page not found in course");
    
      page.steps = [{ image, explanation }]; 
      await course.save();
    
      return {
        ...page.toObject(),
        id: page._id.toString(),
      };
    },

    updateCourse: async (_, { id, title, description, image }) => {
      const course = await Course.findById(id);
      if (!course) throw new Error("Course not found");
    
      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (image !== undefined) course.image = image;
    
      await course.save();
      return course;
    },    

    rateCourse: async (_, { courseId, value }, { userId }) => {
      if (!userId) throw new Error("Authentication required");

      const course = await Course.findById(courseId);
      if (!course) throw new Error("Course not found");

      const existing = course.ratings.find((r) => r.userId.toString() === userId);
      if (existing) {
        existing.value = value;
      } else {
        course.ratings.push({ userId, value });
      }

      await course.save();
      return course;
    },

    addComment: async (_, { courseId, text }, { userId }) => {
      if (!userId) throw new Error("Authentication required");
    
      const course = await Course.findById(courseId);
      if (!course) throw new Error("Course not found");
    
      course.comments.push({ userId, text });
      await course.save();
    
      return course;
    },    

    markPageComplete: async (_, { courseId, pageId }, { userId }) => {
      if (!userId) throw new Error("Authentication required");
    
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
    
      let courseProgress = user.progress.find(
        (p) => p.courseId.toString() === courseId
      );
    
      if (!courseProgress) {
        courseProgress = { courseId, completedPages: [pageId] };
        user.progress.push(courseProgress);
      } else if (!courseProgress.completedPages.includes(pageId)) {
        courseProgress.completedPages.push(pageId);
      }
    
      await user.save();
      return true;
    },  
    
    deleteCourse: async (_, { id }, { userId }) => {
      if (!userId) {
        throw new Error("Unauthorized");
      }
        
      const user = await User.findById(userId);
      if (!user || user.role !== "teacher") {
        throw new Error("Only teachers can delete courses");
      }
        
      const deletedCourse = await Course.findByIdAndDelete(id);
      if (!deletedCourse) {
        throw new Error("Course not found");
      }
        
      return true;
    },
  },
};

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or use a service like SendGrid, Outlook, Gmail etc.
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendWelcomeEmail = async (to, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to Our Platform!',
    html: `
      <h1>Welcome, ${username}!</h1>
      <p>We're excited to have you onboard.</p>
      <p>Feel free to explore our courses and start learning today.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const context = async ( req, res ) => {
  const authHeader = req.headers.authorization || '';
  console.log("Authorization header:", authHeader);

  const token = authHeader.replace('Bearer ', '');
  console.log("Extracted token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);
    console.log("JWT_SECRET inside context:", process.env.JWT_SECRET);
    return { userId: decoded.userId };
  } catch (err) {
    console.log("JWT verification error:", err);
    return {};
  }
}

const apolloHandler = startServerAndCreateNextHandler(server, { context });

export default async function handler(req, res) {
  console.log("Request received:", req.method, req.url);

  res.setHeader('Access-Control-Allow-Origin', process.env.PRODUCTION_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log(">>> Preflight request (OPTIONS)");
    res.status(200).end();
    return;
  }

  console.log("About to call Apollo handler");
  return apolloHandler(req, res);
}
