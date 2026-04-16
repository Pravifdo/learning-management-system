import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
    },
    department: {
      type: String,
      trim: true,
    },
    officeLocation: {
      type: String,
      trim: true,
    },
    officeHours: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    courses: [
      {
        courseCode: {
          type: String,
          trim: true,
        },
        courseName: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecturer", lecturerSchema);
