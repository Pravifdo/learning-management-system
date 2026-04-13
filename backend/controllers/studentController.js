import Student from "../models/Student.js";

// Create student profile after signup
export const createStudentProfile = async (req, res) => {
  try {
    const { regNo, indexNo, enrolledCourses, level, semester } = req.body;

    if (!regNo || !indexNo) {
      return res.status(400).json({
        message: "Please provide registration number and index number",
      });
    }

    // Check if student profile already exists
    const existingStudent = await Student.findOne({ userId: req.user.id });
    if (existingStudent) {
      return res.status(400).json({
        message: "Student profile already exists",
      });
    }

    const student = new Student({
      userId: req.user.id,
      regNo,
      indexNo,
      enrolledCourses: enrolledCourses || [],
      level: level || "100",
      semester: semester || "1",
    });

    await student.save();

    res.status(201).json({
      message: "Student profile created successfully",
      student,
    });
  } catch (error) {
    console.error("Create student profile error:", error);
    res.status(500).json({
      message: "Error creating student profile",
      error: error.message,
    });
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching student profile",
      error: error.message,
    });
  }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { enrolledCourses, level, semester } = req.body;

    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    if (enrolledCourses) student.enrolledCourses = enrolledCourses;
    if (level) student.level = level;
    if (semester) student.semester = semester;

    await student.save();

    res.status(200).json({
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating student profile",
      error: error.message,
    });
  }
};
