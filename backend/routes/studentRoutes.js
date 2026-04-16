import express from "express";
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  getStudentCourses,
  getCourseUploads,
  ensureStudentProfile,
  getAllLecturerCourses,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student profile routes
router.post("/profile", protect, createStudentProfile);
router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);

// Ensure profile exists (auto-create if needed)
router.post("/ensure-profile", protect, ensureStudentProfile);

// Student courses routes
router.get("/courses", protect, getStudentCourses);
router.get("/courses/:subject/uploads", protect, getCourseUploads);

// View all available lecturer courses
router.get("/available-courses", getAllLecturerCourses);

export default router;
