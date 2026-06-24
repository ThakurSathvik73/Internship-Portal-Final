import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    assignedTo: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", noteSchema);
