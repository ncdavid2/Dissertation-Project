import connectDB from "../../server/server.js";
import User from "../../server/models/User.js"; 

connectDB();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const newUser = new User({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        password,
      });

      await newUser.save();
      res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
