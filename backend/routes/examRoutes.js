import express from 'express';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getExamsBySubject,
} from '../controllers/examController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (accessible to all authenticated users - students, lecturers, admin)
router.get('/', protect, getAllExams);
router.get('/:id', protect, getExamById);
router.get('/subject/:subject', protect, getExamsBySubject);

// Admin only routes
router.post('/', protect, isAdmin, createExam); // Admin creates exam
router.put('/:id', protect, isAdmin, updateExam); // Admin updates exam
router.delete('/:id', protect, isAdmin, deleteExam); // Admin deletes exam

export default router;
