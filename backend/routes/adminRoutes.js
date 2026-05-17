import express from "express";
import multer from "multer";
import {
  adminUploadNotes,
  adminUploadAssignment,
  adminDeleteUpload,
  adminGetAllUploads,
  adminGetLecturerUploads,
} from "../controllers/adminController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

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

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Upload management routes
router.post("/uploads/notes", upload.single("file"), adminUploadNotes);
router.post("/uploads/assignment", upload.single("file"), adminUploadAssignment);
router.delete("/uploads/:uploadId", adminDeleteUpload);
router.get("/uploads", adminGetAllUploads);
router.get("/uploads/lecturer/:lecturerId", adminGetLecturerUploads);

export default router;
