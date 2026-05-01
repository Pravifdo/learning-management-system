import Exam from '../models/Exam.js';
import Result from '../models/Result.js';
import XLSX from 'xlsx';

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
    const { title, subject, code, date, startTime, endTime, totalMarks, duration, description, status, topic, year, semester } = req.body;

    if (!title || !subject || !code || !date || !startTime || !endTime || !totalMarks || !duration || !topic || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const exam = new Exam({
      title,
      subject,
      code,
      date,
      startTime,
      endTime,
      totalMarks,
      duration,
      description,
      topic,
      year,
      semester,
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
    const { title, subject, code, date, startTime, endTime, totalMarks, duration, description, status, topic, year, semester } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      id,
      {
        title,
        subject,
        code,
        date,
        startTime,
        endTime,
        totalMarks,
        duration,
        description,
        status,
        topic,
        year,
        semester,
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

// Upload exam results from Excel file (admin only)
export const uploadExamResults = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { examId } = req.body;

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID is required',
      });
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty',
      });
    }

    const uploadedResults = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Validate required fields
        if (!row['Student Email'] || row['Student Email'].trim() === '') {
          errors.push(`Row ${i + 2}: Student Email is required`);
          continue;
        }
        if (row['Marks Obtained'] === undefined || row['Marks Obtained'] === '') {
          errors.push(`Row ${i + 2}: Marks Obtained is required`);
          continue;
        }

        const marksObtained = parseFloat(row['Marks Obtained']);
        const totalMarks = exam.totalMarks;
        const percentage = (marksObtained / totalMarks) * 100;

        // Calculate grade based on percentage
        let grade;
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C+';
        else if (percentage >= 40) grade = 'C';
        else if (percentage >= 30) grade = 'D';
        else grade = 'F';

        // Check if result already exists for this student and exam
        const existingResult = await Result.findOne({
          examId,
          studentEmail: row['Student Email'].toLowerCase(),
        });

        let result;
        if (existingResult) {
          // Update existing result
          result = await Result.findByIdAndUpdate(
            existingResult._id,
            {
              marksObtained,
              totalMarks,
              percentage: Math.round(percentage * 100) / 100,
              grade,
              remarks: row['Remarks'] || '',
              uploadedAt: new Date(),
            },
            { new: true }
          );
        } else {
          // Create new result
          result = new Result({
            examId,
            studentEmail: row['Student Email'].toLowerCase(),
            studentName: row['Student Name'] || 'Unknown',
            marksObtained,
            totalMarks,
            percentage: Math.round(percentage * 100) / 100,
            grade,
            remarks: row['Remarks'] || '',
          });
          await result.save();
        }

        uploadedResults.push(result);
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Results uploaded successfully. ${uploadedResults.length} records processed.`,
      data: {
        uploadedCount: uploadedResults.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get results for an exam (admin can see all, others see their own)
export const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID is required',
      });
    }

    const results = await Result.find({ examId }).populate('examId', 'title subject');

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
