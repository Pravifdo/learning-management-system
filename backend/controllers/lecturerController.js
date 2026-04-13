import Lecturer from "../models/Lecturer.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

// Create lecturer profile
export const createLecturerProfile = async (req, res) => {
  try {
    const { subject, department, officeLocation, officeHours, bio } = req.body;

    if (!subject) {
      return res.status(400).json({
        message: "Please provide a subject",
      });
    }

    // Check if lecturer already has a profile
    const existingLecturer = await Lecturer.findOne({ userId: req.user.id });
    if (existingLecturer) {
      return res.status(400).json({
        message: "Lecturer profile already exists",
      });
    }

    const lecturer = new Lecturer({
      userId: req.user.id,
      subject,
      department,
      officeLocation,
      officeHours,
      bio,
    });

    await lecturer.save();

    res.status(201).json({
      message: "Lecturer profile created successfully",
      lecturer,
    });
  } catch (error) {
    console.error("Create lecturer profile error:", error);
    res.status(500).json({
      message: "Error creating lecturer profile",
      error: error.message,
    });
  }
};

// Get lecturer profile
export const getLecturerProfile = async (req, res) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id }).populate(
      "userId",
      "fullName email"
    );

    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer profile not found",
      });
    }

    res.status(200).json({
      lecturer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching lecturer profile",
      error: error.message,
    });
  }
};

// Get all students (for lecturer to view)
export const getLecturerStudents = async (req, res) => {
  try {
    // Get all users with student role
    const students = await User.find({ role: "student" })
      .select("-password")
      .lean();

    // Get student details for each user
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const studentDetails = await Student.findOne({ userId: student._id });
        return {
          ...student,
          studentDetails: studentDetails || {},
        };
      })
    );

    res.status(200).json({
      message: "Students retrieved successfully",
      count: studentsWithDetails.length,
      students: studentsWithDetails,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// Get single student details (for lecturer)
export const getStudentDetail = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get user details
    const user = await User.findById(studentId).select("-password");

    if (!user || user.role !== "student") {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Get student additional details
    const studentDetails = await Student.findOne({ userId: studentId });

    res.status(200).json({
      user,
      studentDetails: studentDetails || {},
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student details",
      error: error.message,
    });
  }
};

// Update student grades (lecturer only)
export const updateStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { totalMarks } = req.body;

    if (!totalMarks && totalMarks !== 0) {
      return res.status(400).json({
        message: "Please provide marks",
      });
    }

    const student = await Student.findOne({ userId: studentId });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    student.totalMarks = totalMarks;
    await student.save();

    res.status(200).json({
      message: "Student marks updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating marks",
      error: error.message,
    });
  }
};

// Record student attendance (lecturer only)
export const recordAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { attendance } = req.body;

    if (attendance === undefined) {
      return res.status(400).json({
        message: "Please provide attendance",
      });
    }

    const student = await Student.findOne({ userId: studentId });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    student.attendance = attendance;
    await student.save();

    res.status(200).json({
      message: "Attendance recorded successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error recording attendance",
      error: error.message,
    });
  }
};
