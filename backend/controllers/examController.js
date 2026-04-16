import Exam from '../models/Exam.js';

// Get all exams (for students and lecturers to view)
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get exam by ID
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }
    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create exam (admin only)
export const createExam = async (req, res) => {
  try {
    const { title, subject, date, startTime, endTime, totalMarks, duration, description, status } = req.body;

    if (!title || !subject || !date || !startTime || !endTime || !totalMarks || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const exam = new Exam({
      title,
      subject,
      date,
      startTime,
      endTime,
      totalMarks,
      duration,
      description,
      status: status || 'Scheduled',
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update exam (admin only)
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, date, startTime, endTime, totalMarks, duration, description, status } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      id,
      {
        title,
        subject,
        date,
        startTime,
        endTime,
        totalMarks,
        duration,
        description,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete exam (admin only)
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get exams by subject (for students)
export const getExamsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const exams = await Exam.find({ subject }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
