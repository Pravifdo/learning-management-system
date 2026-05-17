import Lecturer from "../models/Lecturer.js";
import Upload from "../models/Upload.js";

// Admin upload lecture notes for a lecturer
export const adminUploadNotes = async (req, res) => {
  try {
    const { subject, topic, lecturerId } = req.body;

    // Validate required fields
    if (!subject || !topic || !lecturerId) {
      return res.status(400).json({
        message: "Please provide subject, topic, and lecturer ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    // Verify lecturer exists
    const lecturer = await Lecturer.findById(lecturerId);
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer not found",
      });
    }

    // Create upload record
    const upload = new Upload({
      lecturerId: lecturer._id,
      userId: lecturer.userId,
      type: "notes",
      subject,
      topic,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
    });

    await upload.save();

    res.status(201).json({
      message: "Lecture notes uploaded successfully",
      upload,
    });
  } catch (error) {
    console.error("Admin upload notes error:", error);
    res.status(500).json({
      message: "Error uploading lecture notes",
      error: error.message,
    });
  }
};

// Admin upload assignment for a lecturer
export const adminUploadAssignment = async (req, res) => {
  try {
    const { subject, topic, startDate, endDate, lecturerId } = req.body;

    // Validate required fields
    if (!subject || !topic || !lecturerId) {
      return res.status(400).json({
        message: "Please provide subject, topic, and lecturer ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    // Verify lecturer exists
    const lecturer = await Lecturer.findById(lecturerId);
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer not found",
      });
    }

    // Create upload record
    const upload = new Upload({
      lecturerId: lecturer._id,
      userId: lecturer.userId,
      type: "assignment",
      subject,
      topic,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      startDate,
      endDate,
    });

    await upload.save();

    res.status(201).json({
      message: "Assignment uploaded successfully",
      upload,
    });
  } catch (error) {
    console.error("Admin upload assignment error:", error);
    res.status(500).json({
      message: "Error uploading assignment",
      error: error.message,
    });
  }
};

// Admin delete upload
export const adminDeleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({
        message: "Upload not found",
      });
    }

    await Upload.findByIdAndDelete(uploadId);

    res.status(200).json({
      message: "Upload deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete upload error:", error);
    res.status(500).json({
      message: "Error deleting upload",
      error: error.message,
    });
  }
};

// Get all uploads (admin view)
export const adminGetAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find()
      .populate("lecturerId", "subject")
      .populate("userId", "fullName")
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({
      message: "All uploads retrieved successfully",
      count: uploads.length,
      uploads,
    });
  } catch (error) {
    console.error("Get all uploads error:", error);
    res.status(500).json({
      message: "Error fetching uploads",
      error: error.message,
    });
  }
};

// Get uploads by lecturer (admin view)
export const adminGetLecturerUploads = async (req, res) => {
  try {
    const { lecturerId } = req.params;

    const uploads = await Upload.find({ lecturerId })
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({
      message: "Lecturer uploads retrieved successfully",
      uploads,
    });
  } catch (error) {
    console.error("Get lecturer uploads error:", error);
    res.status(500).json({
      message: "Error fetching lecturer uploads",
      error: error.message,
    });
  }
};
