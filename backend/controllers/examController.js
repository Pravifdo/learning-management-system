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
        const email = row['Student Email'] || row['Email'];
        const studentName = row['Student Name'] || row['Name'] || 'Unknown';
        const indexNo = row['Index Number'] || row['Index No'] || '';

        if (!email) {
          errors.push(`Row ${i + 2}: Student Email is required`);
          continue;
        }

        const existingResult = await Result.findOne({
          examId,
          studentEmail: email.toLowerCase(),
        });

        const resultData = {
          marksObtained,
          totalMarks,
          percentage: Math.round(percentage * 100) / 100,
          grade,
          remarks: row['Remarks'] || '',
          indexNo,
          year: exam.year,
          semester: exam.semester,
          studentName,
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
            studentEmail: email.toLowerCase(),
            ...resultData
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
