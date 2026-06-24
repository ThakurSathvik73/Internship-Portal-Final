import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["task", "meeting", "general"],
      default: "general",
    },
    targetRoles: {
      type: [String],
      default: [],
    },
    targetEmails: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      default: "",
    },
    sourceType: {
      type: String,
      default: "",
    },
    sourceId: {
      type: String,
      default: "",
      index: true,
    },
    important: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);
