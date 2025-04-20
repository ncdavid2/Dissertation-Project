import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { typeDefs, resolvers } from "../graphql/schema.js";

dotenv.config();

let isConnected = false;

// Connect to MongoDB only once (important for serverless)
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log("MongoDB connected!");
};

// Get user ID from token
const getUserFromToken = (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    await connectDB(); // Ensure DB connection

    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");
    const userId = getUserFromToken(token);

    return { userId };
  },
});

export default handler;
