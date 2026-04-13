import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided. Please log in first.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
  next();
};

// Check if user is lecturer
export const isLecturer = (req, res, next) => {
  if (req.user?.role !== "lecturer") {
    return res.status(403).json({
      message: "Access denied. Lecturer only.",
    });
  }
  next();
};

// Check if user is student
export const isStudent = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({
      message: "Access denied. Student only.",
    });
  }
  next();
};

