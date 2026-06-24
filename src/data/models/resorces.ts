import mongoose, { Schema } from "mongoose";

// Declare the Schema of the Mongo model
const resorcesSchema = new Schema({
  name: {
    type: String,
  },
  size: {
    type: String,
  },
  type: {
    type: String,
  },
  desc: {
    type: String,
  },
});

//Export the model
export default mongoose.models.Resorces ||
  mongoose.model("Resorces", resorcesSchema);
