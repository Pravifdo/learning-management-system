import express from "express";
import multer from "multer";
import {
  createLecturerProfile,
  getLecturerProfile,
  getLecturerStudents,
  getStudentDetail,
  updateStudentMarks,
  recordAttendance,
  uploadContent,
  getUploads,
  deleteUpload,
  addCourse,
  getLecturerCoursesProfile,
  deleteCourse,
  getAllLecturers,
} from "../controllers/lecturerController.js";
import { protect, isLecturer } from "../middleware/authMiddleware.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();

// Get all lecturers (public route)
router.get("/all", getAllLecturers);

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

// Upload routes
router.post("/notes", protect, isLecturer, upload.single("file"), uploadContent);
router.post("/assignment", protect, isLecturer, upload.single("file"), uploadContent);
router.get("/uploads", protect, isLecturer, getUploads);
router.delete("/uploads/:uploadId", protect, isLecturer, deleteUpload);

// Course routes
router.post("/courses", protect, isLecturer, addCourse);
router.get("/courses", protect, isLecturer, getLecturerCoursesProfile);
router.delete("/courses/:courseCode", protect, isLecturer, deleteCourse);

export default router;
