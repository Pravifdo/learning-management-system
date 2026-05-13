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
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    indexNo: {
      type: String,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
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
