import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    topic: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      enum: ['1', '2', 'Special'],
      required: true,
    },
  },
  { timestamps: true }
);

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
