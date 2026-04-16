import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import lecturerRoutes from "./routes/lecturerRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = 4000;

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
await connectDB();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

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