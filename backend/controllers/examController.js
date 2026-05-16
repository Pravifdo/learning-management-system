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

    // Validate required fields (topic is optional now)
    if (!title || !subject || !code || !date || !startTime || !endTime || !totalMarks || !duration || !year || !semester) {
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
      totalMarks: Number(totalMarks), // Convert to number
      duration: Number(duration),     // Convert to number
      description,
      topic: topic || 'General',      // Default to 'General' if empty
      year: Number(year),
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
        totalMarks: Number(totalMarks),  // Convert to number
        duration: Number(duration),      // Convert to number
        description,
        status,
        topic: topic || 'General',       // Default to 'General' if empty
        year: Number(year),
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
// New format: Index Number | Subject Code 1 | Subject Code 2 | etc.
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
    
    // Get all data including header row
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (allData.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Excel file must contain headers and at least one data row',
      });
    }

    const headers = allData[0];
    const subjectCodes = headers.slice(1); // All columns except first (Index Number)
    
    if (!headers[0] || !subjectCodes.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format: First column should be Index Number, followed by subject codes',
      });
    }

    const uploadedResults = [];
    const errors = [];
    const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'AB', 'W'];

    // Process each data row (skip header)
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      try {
        const indexNo = row[0];
        
        // Validate index number
        if (!indexNo || indexNo.toString().trim() === '') {
          errors.push(`Row ${i + 1}: Index Number is required`);
          continue;
        }

        // Process each subject in this row
        for (let j = 0; j < subjectCodes.length; j++) {
          const subjectCode = subjectCodes[j];
          const grade = row[j + 1];

          // Skip empty grades
          if (!grade || grade.toString().trim() === '') {
            continue;
          }

          const gradeStr = grade.toString().trim().toUpperCase();
          
          // Validate grade
          if (!validGrades.includes(gradeStr)) {
            errors.push(`Row ${i + 1}, Subject ${subjectCode}: Invalid grade "${grade}". Valid grades: A+, A, B+, B, C+, C, D, F, AB`);
            continue;
          }

          // Check if result already exists for this student and subject
          const existingResult = await Result.findOne({
            indexNo: indexNo.toString().trim(),
            subjectCode: subjectCode.toString().trim(),
            examId
          });

          const resultData = {
            marksObtained: 0, // Not used in new format
            totalMarks: 0, // Not used in new format
            percentage: 0, // Not used in new format
            grade: gradeStr,
            indexNo: indexNo.toString().trim(),
            subjectCode: subjectCode.toString().trim(),
            year: exam.year,
            semester: exam.semester,
            studentName: '', // Will be empty, can be added later
            studentEmail: '', // Will be empty for this format
            uploadedAt: new Date(),
          };

          let result;
          if (existingResult) {
            // Update existing result
            result = await Result.findByIdAndUpdate(
              existingResult._id,
              resultData,
              { new: true }
            );
          } else {
            // Create new result
            result = new Result({
              examId,
              ...resultData
            });
            await result.save();
          }

          uploadedResults.push(result);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Results uploaded successfully. ${uploadedResults.length} grades processed across ${allData.length - 1} students.`,
      data: {
        uploadedCount: uploadedResults.length,
        studentsProcessed: allData.length - 1,
        subjectsCount: subjectCodes.length,
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

    const results = await Result.find({ examId }).populate('examId', 'title subject code totalMarks');

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

// Get all results with optional filters (year, semester)
export const getAllResults = async (req, res) => {
  try {
    const { year, semester } = req.query;
    
    let examFilter = {};
    if (year) examFilter.year = Number(year);
    if (semester) examFilter.semester = semester;

    // Find exams that match the filters
    const exams = await Exam.find(examFilter);
    const examIds = exams.map(e => e._id);

    // Find results for those exams
    const results = await Result.find({ examId: { $in: examIds } })
      .populate('examId', 'title subject code year semester')
      .sort({ createdAt: -1 });

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

// Download all results for a specific year and semester as Excel
export const downloadAllResults = async (req, res) => {
  try {
    const { year, semester } = req.query;

    if (!year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Year and Semester are required',
      });
    }

    // Find exams for this year/semester
    const exams = await Exam.find({ year: Number(year), semester });
    const examIds = exams.map(e => e._id);

    // Find all results
    const results = await Result.find({ examId: { $in: examIds } })
      .populate('examId', 'title subject code');

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No results found for the selected year and semester',
      });
    }

    // Format data for Excel
    const excelData = results.map(res => ({
      'Year': res.year,
      'Semester': res.semester,
      'Student Name': res.studentName,
      'Index Number': res.indexNo,
      'Email': res.studentEmail,
      'Exam Code': res.examId?.code || 'N/A',
      'Subject': res.examId?.subject || 'N/A',
      'Exam Title': res.examId?.title || 'N/A',
      'Marks Obtained': res.marksObtained,
      'Total Marks': res.totalMarks,
      'Percentage (%)': res.percentage,
      'Grade': res.grade,
      'Remarks': res.remarks || '',
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const wscols = [
      { wch: 8 },  // Year
      { wch: 10 }, // Semester
      { wch: 25 }, // Student Name
      { wch: 15 }, // Index Number
      { wch: 30 }, // Email
      { wch: 15 }, // Exam Code
      { wch: 20 }, // Subject
      { wch: 30 }, // Exam Title
      { wch: 15 }, // Marks
      { wch: 15 }, // Total
      { wch: 15 }, // %
      { wch: 8 },  // Grade
      { wch: 30 }, // Remarks
    ];
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Report');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Send as attachment
    res.setHeader('Content-Disposition', `attachment; filename=Master_Results_${year}_Sem_${semester}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get student's own results
export const getMyResults = async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();
    
    const results = await Result.find({ studentEmail: email })
      .populate({
        path: 'examId',
        select: 'title subject code date totalMarks'
      })
      .sort({ uploadedAt: -1 });

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
// Add a single student result (manual entry)
export const addSingleResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const { indexNo, studentEmail, studentName, marksObtained, grade, remarks } = req.body;

    if (!examId || !indexNo) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and Index Number are required',
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

    const totalMarks = exam.totalMarks || 100;
    const marks = Number(marksObtained) || 0;
    const percentage = (marks / totalMarks) * 100;

    const resultData = {
      examId,
      indexNo: indexNo.toString().trim(),
      studentEmail: studentEmail ? studentEmail.toLowerCase().trim() : '',
      studentName: studentName || '',
      marksObtained: marks,
      totalMarks,
      percentage,
      grade: grade || '',
      remarks: remarks || '',
      year: exam.year,
      semester: exam.semester,
      uploadedAt: new Date(),
    };

    // Check if result already exists for this student and exam
    const existingResult = await Result.findOne({
      examId,
      indexNo: indexNo.toString().trim(),
    });

    let result;
    if (existingResult) {
      // Update existing result
      result = await Result.findByIdAndUpdate(existingResult._id, resultData, {
        new: true,
      });
    } else {
      // Create new result
      result = new Result(resultData);
      await result.save();
    }

    res.status(200).json({
      success: true,
      message: existingResult ? 'Result updated successfully' : 'Result added successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a specific result (admin only)
export const deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await Result.findByIdAndDelete(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
