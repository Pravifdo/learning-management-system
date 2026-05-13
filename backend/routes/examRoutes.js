import express from 'express';
import multer from 'multer';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamsBySubject,
  uploadExamResults,
  getExamResults,
  getAllResults,
  downloadAllResults,
  getMyResults,
} from '../controllers/examController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Public routes (accessible to all authenticated users - students, lecturers, admin)
router.get('/', protect, getAllExams);
router.get('/:id', protect, getExamById);
router.get('/subject/:subject', protect, getExamsBySubject);

// Admin only routes
router.post('/', protect, isAdmin, createExam); // Admin creates exam
router.put('/:id', protect, isAdmin, updateExam); // Admin updates exam
router.delete('/:id', protect, isAdmin, deleteExam); // Admin deletes exam

// Results routes
router.get('/my/results', protect, getMyResults); // Student gets their own results
router.get('/results/all', protect, isAdmin, getAllResults); // Get all results with filters
router.get('/results/download', protect, isAdmin, downloadAllResults); // Download results as Excel
router.post('/:examId/upload-results', protect, isAdmin, upload.single('file'), uploadExamResults); // Upload results from Excel
router.get('/:examId/results', protect, isAdmin, getExamResults); // Get results for an exam

export default router;
