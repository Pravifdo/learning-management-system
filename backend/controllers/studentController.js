import Student from "../models/Student.js";
import Upload from "../models/Upload.js";
import Lecturer from "../models/Lecturer.js";

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

// Get student's courses with lecturer information
export const getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // Handle empty or undefined enrolledCourses
    if (!student.enrolledCourses || student.enrolledCourses.length === 0) {
      return res.status(200).json({
        message: "No courses enrolled",
        courses: [],
      });
    }

    // Get lecturer information for each enrolled course
    const coursesWithLecturerInfo = await Promise.all(
      student.enrolledCourses.map(async (courseName) => {
        // Find the lecturer who teaches this course
        const lecturer = await Lecturer.findOne({
          "courses.courseName": courseName,
        });

        if (lecturer) {
          // Find the specific course in the lecturer's courses array
          const course = lecturer.courses.find(
            (c) => c.courseName === courseName
          );

          return {
            _id: course?._id || Math.random(),
            courseName: courseName,
            courseCode: course?.courseCode || courseName,
            description: course?.description || "",
            lecturer: lecturer.userId,
            lecturerName: lecturer.userId?.name || "Unknown",
            subject: lecturer.subject,
            department: lecturer.department,
            officeLocation: lecturer.officeLocation,
            officeHours: lecturer.officeHours,
            bio: lecturer.bio,
          };
        } else {
          // Course found but no lecturer assigned yet
          return {
            _id: Math.random(),
            courseName: courseName,
            courseCode: courseName,
            description: "",
            lecturer: null,
            lecturerName: "TBA",
            subject: "Maths",
            department: "N/A",
            officeLocation: "N/A",
            officeHours: "N/A",
            bio: "",
          };
        }
      })
    );

    res.status(200).json({
      message: "Courses retrieved successfully",
      courses: coursesWithLecturerInfo,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
};

// Get uploads for a specific course/subject
export const getCourseUploads = async (req, res) => {
  try {
    const { subject } = req.params;
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    // Check if student is enrolled in this course
    if (!student.enrolledCourses.includes(subject)) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    // Get all uploads for this subject
    const uploads = await Upload.find({ subject })
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({
      message: "Course uploads retrieved successfully",
      subject,
      uploads,
    });
  } catch (error) {
    console.error("Get course uploads error:", error);
    res.status(500).json({
      message: "Error fetching course uploads",
      error: error.message,
    });
  }
};

// Auto-create or ensure student profile exists
export const ensureStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      // Create a basic student profile
      student = new Student({
        userId: req.user.id,
        regNo: req.user.regNo || `STU${Date.now()}`,
        indexNo: req.user.indexNo || `IDX${Date.now()}`,
        enrolledCourses: [],
      });
      await student.save();
      return res.status(201).json({
        message: "Student profile created successfully",
        student,
        created: true,
      });
    }

    res.status(200).json({
      message: "Student profile already exists",
      student,
      created: false,
    });
  } catch (error) {
    console.error("Ensure student profile error:", error);
    res.status(500).json({
      message: "Error ensuring student profile",
      error: error.message,
    });
  }
};

// Get all available lecturer courses (for students to browse)
export const getAllLecturerCourses = async (req, res) => {
  try {
    const lecturers = await Lecturer.find()
      .populate("userId", "fullName email")
      .select("courses subject department userId");

    // Flatten courses and add lecturer info
    const allCourses = [];
    lecturers.forEach((lecturer) => {
      if (lecturer.courses && lecturer.courses.length > 0) {
        lecturer.courses.forEach((course) => {
          allCourses.push({
            ...course.toObject ? course.toObject() : course,
            lecturerName: lecturer.userId?.fullName || "Unknown",
            lecturerEmail: lecturer.userId?.email || "",
            lecturerSubject: lecturer.subject,
            lecturerDepartment: lecturer.department,
          });
        });
      }
    });

    res.status(200).json({
      message: "All lecturer courses retrieved successfully",
      count: allCourses.length,
      courses: allCourses,
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({
      message: "Error fetching courses",
      error: error.message,
    });
  }
};
