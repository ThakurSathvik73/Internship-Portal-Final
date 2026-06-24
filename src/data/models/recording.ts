import mongoose, { Schema } from "mongoose";

const recordingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    course: {
      type: String,
      required: true,
    },
    recordingUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: Number,
    },
    recordedDate: {
      type: Date,
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

export default mongoose.models.Recording ||
  mongoose.model("Recording", recordingSchema);
