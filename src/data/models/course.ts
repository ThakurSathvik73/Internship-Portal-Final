import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    instructor: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
    },
    credits: {
      type: Number,
    },
    enrolledStudents: {
      type: [String],
      default: [],
    },
    enrolledFaculty: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
