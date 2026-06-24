import mongoose, { Schema } from "mongoose";

const discussionSchema = new Schema(
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
    createdBy: {
      type: String,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["Admin", "Faculty", "Student"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    visibleTo: {
      type: [String],
      default: [],
    },
    replies: [
      {
        author: String,
        authorRole: {
          type: String,
          enum: ["Admin", "Faculty", "Student"],
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Discussion ||
  mongoose.model("Discussion", discussionSchema);
