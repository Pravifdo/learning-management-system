import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getAssignmentNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread/count", getUnreadCount);

// Get assignment notifications only
router.get("/type/assignments", getAssignmentNotifications);

// Mark notification as read
router.put("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.put("/mark-all/read", markAllAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

export default router;
