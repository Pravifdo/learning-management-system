import express from "express";
import { signup, login, getUser, getCurrentUser, getAllUsers } from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes - require authentication
router.get("/me", protect, getCurrentUser); // Get current logged-in user
router.get("/user/:id", protect, getUser); // Get user by ID (private)
router.get("/users", protect, isAdmin, getAllUsers); // Get all users (admin only)

export default router;