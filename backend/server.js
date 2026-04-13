import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import lecturerRoutes from "./routes/lecturerRoutes.js";

const app = express();
const PORT = 4000;

// Connect to MongoDB
await connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer", lecturerRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// API route
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});