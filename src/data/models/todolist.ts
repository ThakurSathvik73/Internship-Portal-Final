import mongoose, { Schema } from "mongoose";

// Declare the Schema of the Mongo model
const todoSchema = new Schema({
  task: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

//Export the model
export default mongoose.models.Todo || mongoose.model("Todo", todoSchema);
