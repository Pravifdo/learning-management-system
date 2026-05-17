import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

// Get all notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, skip = 0 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const totalCount = await Notification.countDocuments({ userId });

    res.status(200).json({
      message: "Notifications retrieved successfully",
      notifications,
      totalCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    // Get assignment notifications specifically
    const unreadAssignments = await Notification.countDocuments({
      userId,
      isRead: false,
      type: "assignment",
    });

    res.status(200).json({
      message: "Unread count retrieved successfully",
      unreadCount,
      unreadAssignments,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Verify ownership
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this notification",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Verify ownership
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// Get assignment notifications only
export const getAssignmentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const notifications = await Notification.find({
      userId,
      type: "assignment",
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      message: "Assignment notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error("Get assignment notifications error:", error);
    res.status(500).json({
      message: "Error fetching assignment notifications",
      error: error.message,
    });
  }
};

// Create notification for students (called after assignment upload)
export const createAssignmentNotification = async (upload) => {
  try {
    // Get the lecturer info
    const lecturer = await User.findById(upload.userId).select("fullName").lean();
    if (!lecturer) return;

    // Get all students
    const allStudents = await User.find({ role: "student" }).select("_id").lean();

    // Create notification for each student
    const notifications = allStudents.map((student) => ({
      userId: student._id,
      type: "assignment",
      title: `New Assignment: ${upload.subject}`,
      message: `${lecturer.fullName} uploaded a new assignment "${upload.topic}"`,
      relatedId: upload._id,
      lecturerName: lecturer.fullName,
      subject: upload.subject,
      isRead: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Create assignment notification error:", error);
  }
};
