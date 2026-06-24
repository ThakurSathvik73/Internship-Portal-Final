import mongoose, { Schema } from "mongoose";
import { hashPassword } from "@/utils/password";

// Declare the Schema of the Mongo model
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "faculty", "student"],
      default: "student",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", function hashPlainPassword(this: any, next) {
  if (this.isModified("password") && !String(this.password).startsWith("pbkdf2:")) {
    this.password = hashPassword(this.password);
  }

  next();
});

//Export the model
export default mongoose.models.User || mongoose.model("User", userSchema);
