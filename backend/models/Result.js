import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      // Optional for flexibility in admin uploads
    },
    studentEmail: {
      type: String,
      default: '',
    },
    studentName: {
      type: String,
      default: '',
    },
    indexNo: {
      type: String,
    },
    subjectCode: {
      type: String,
      // For bulk uploads with subject codes
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'AB', 'W'],
    },
    remarks: {
      type: String,
    },
    year: {
      type: Number,
    },
    semester: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
// Removed unique constraint to allow multiple uploads if needed, 
// or I can handle updates in the controller
resultSchema.index({ examId: 1, studentEmail: 1 });

const Result = mongoose.model('Result', resultSchema);

export default Result;
