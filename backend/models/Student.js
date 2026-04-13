import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    regNo: {
      type: String,
      required: true,
      unique: true,
    },
    indexNo: {
      type: String,
      required: true,
    },
    enrolledCourses: [
      {
        type: String,
        trim: true,
      },
    ],
    attendance: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    semester: {
      type: String,
      default: "1",
    },
    level: {
      type: String,
      default: "100",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
