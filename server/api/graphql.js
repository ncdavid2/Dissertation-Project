import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import mongoose from "mongoose";
import typeDefs from "./typedefs.js";
import resolvers from "./resolvers.js";
import jwt from "jsonwebtoken";

if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
}

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

export default startServerAndCreateNextHandler(server, {
  context: async (req) => {
    const token = req.headers.authorization || "";
    const userId = getUserFromToken(token.replace("Bearer ", ""));
    return { userId };
  },
});
