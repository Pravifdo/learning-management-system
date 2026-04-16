import Lecturer from "../models/Lecturer.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Upload from "../models/Upload.js";

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

// Upload lecture notes or assignment
export const uploadContent = async (req, res) => {
  try {
    const { subject, topic, startDate, endDate } = req.body;

    // Validate required fields
    if (!subject || !topic) {
      return res.status(400).json({
        message: "Please provide subject and topic",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    // Determine type from request path
    const type = req.path.includes('/notes') ? 'notes' : 'assignment';

    // Get lecturer profile
    const lecturer = await Lecturer.findOne({ userId: req.user.id });
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer profile not found",
      });
    }

    // Create upload record
    const upload = new Upload({
      lecturerId: lecturer._id,
      userId: req.user.id,
      type,
      subject,
      topic,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      startDate: type === "assignment" ? startDate : undefined,
      endDate: type === "assignment" ? endDate : undefined,
    });

    await upload.save();

    res.status(201).json({
      message: `${type === "notes" ? "Lecture notes" : "Assignment"} uploaded successfully`,
      upload,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Error uploading content",
      error: error.message,
    });
  }
};

// Get all uploads for a lecturer
export const getUploads = async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({
      message: "Uploads retrieved successfully",
      uploads,
    });
  } catch (error) {
    console.error("Get uploads error:", error);
    res.status(500).json({
      message: "Error fetching uploads",
      error: error.message,
    });
  }
};

// Delete an upload
export const deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;

    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({
        message: "Upload not found",
      });
    }

    // Verify ownership
    if (upload.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this upload",
      });
    }

    await Upload.findByIdAndDelete(uploadId);

    res.status(200).json({
      message: "Upload deleted successfully",
    });
  } catch (error) {
    console.error("Delete upload error:", error);
    res.status(500).json({
      message: "Error deleting upload",
      error: error.message,
    });
  }
};

// Add a course (Lecturer)
export const addCourse = async (req, res) => {
  try {
    const { courseCode, courseName, description } = req.body;

    if (!courseCode || !courseName) {
      return res.status(400).json({
        message: "Please provide course code and course name",
      });
    }

    const lecturer = await Lecturer.findOne({ userId: req.user.id });
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer profile not found",
      });
    }

    // Check if course already exists
    const courseExists = lecturer.courses.some(c => c.courseCode === courseCode);
    if (courseExists) {
      return res.status(400).json({
        message: "Course code already exists for this lecturer",
      });
    }

    lecturer.courses.push({
      courseCode,
      courseName,
      description: description || "",
    });

    await lecturer.save();

    res.status(201).json({
      message: "Course added successfully",
      course: lecturer.courses[lecturer.courses.length - 1],
    });
  } catch (error) {
    console.error("Add course error:", error);
    res.status(500).json({
      message: "Error adding course",
      error: error.message,
    });
  }
};

// Get lecturer's courses
export const getLecturerCoursesProfile = async (req, res) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id });
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer profile not found",
      });
    }

    res.status(200).json({
      message: "Courses retrieved successfully",
      courses: lecturer.courses || [],
    });
  } catch (error) {
    console.error("Get lecturer courses error:", error);
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// Delete a course (Lecturer)
export const deleteCourse = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const lecturer = await Lecturer.findOne({ userId: req.user.id });
    if (!lecturer) {
      return res.status(404).json({
        message: "Lecturer profile not found",
      });
    }

    const courseIndex = lecturer.courses.findIndex(c => c.courseCode === courseCode);
    if (courseIndex === -1) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    lecturer.courses.splice(courseIndex, 1);
    await lecturer.save();

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      message: "Error deleting course",
      error: error.message,
    });
  }
};

// Get all lecturers with their information
export const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.find()
      .populate("userId", "fullName email phoneNumber")
      .lean();

    if (!lecturers || lecturers.length === 0) {
      return res.status(200).json({
        message: "No lecturers found",
        count: 0,
        lecturers: [],
      });
    }

    // Format lecturers with complete information
    const formattedLecturers = lecturers.map((lecturer) => ({
      id: lecturer._id,
      userId: lecturer.userId?._id,
      fullName: lecturer.userId?.fullName,
      email: lecturer.userId?.email,
      phoneNumber: lecturer.userId?.phoneNumber,
      subject: lecturer.subject,
      department: lecturer.department,
      officeLocation: lecturer.officeLocation,
      officeHours: lecturer.officeHours,
      bio: lecturer.bio,
      courses: lecturer.courses || [],
      createdAt: lecturer.createdAt,
      updatedAt: lecturer.updatedAt,
    }));

    res.status(200).json({
      message: "All lecturers retrieved successfully",
      count: formattedLecturers.length,
      lecturers: formattedLecturers,
    });
  } catch (error) {
    console.error("Get all lecturers error:", error);
    res.status(500).json({
      message: "Error fetching all lecturers",
      error: error.message,
    });
  }
};
