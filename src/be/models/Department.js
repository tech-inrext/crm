// models/Department.js

import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description can't exceed 250 characters"],
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false, // Optional, assignable later
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Department || mongoose.model("Department", departmentSchema);
