import mongoose, { Schema } from "mongoose";

// Declare the Schema of the Mongo model
const assignmentSchema = new Schema({
  id: {
    type: String,
  },
  title: {
    type: String,
  },
  course: {
    type: String,
  },
  dueDate: {
    type: String,
  },
  status: {
    type: String,
  },
  students: {
    type: [String],
  },
  grade: {
    type: Number,
  },
  submission: {
    url: {
      type: String,
    },
    fileName: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
  },
});

//Export the model
export default mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);
