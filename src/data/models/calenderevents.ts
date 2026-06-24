import mongoose, { Schema } from "mongoose";

// Declare the Schema of the Mongo model
const eventSchema = new Schema({
  title: {
    type: String,
  },
  course: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  meatingLink: {
    type: [String],
  },
  color: {
    type: String,
  },
  assignedTo: {
    type: [String],
    default: [],
  },
});

//Export the model
export default mongoose.models.events || mongoose.model("events", eventSchema);
