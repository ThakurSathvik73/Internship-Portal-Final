import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    assignedTo: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    assignedStudents: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["created", "assigned", "in-progress", "completed"],
      default: "created",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
