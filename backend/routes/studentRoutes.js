import express from "express";
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student profile routes
router.post("/profile", protect, createStudentProfile);
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);

export default router;
