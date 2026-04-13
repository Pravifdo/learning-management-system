import express from "express";
import {
  createLecturerProfile,
  getLecturerProfile,
  getLecturerStudents,
  getStudentDetail,
  updateStudentMarks,
  recordAttendance,
} from "../controllers/lecturerController.js";
import { protect, isLecturer } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lecturer profile routes
router.post("/profile", protect, isLecturer, createLecturerProfile);
router.get("/profile", protect, isLecturer, getLecturerProfile);

// View students routes
router.get("/students", protect, isLecturer, getLecturerStudents);
router.get("/student/:studentId", protect, isLecturer, getStudentDetail);

// Grade and attendance routes
router.put("/student/:studentId/marks", protect, isLecturer, updateStudentMarks);
router.put(
  "/student/:studentId/attendance",
  protect,
  isLecturer,
  recordAttendance
);

export default router;
