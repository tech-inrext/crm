import mongoose from "mongoose";
import User from "./User.js"; // base model

const employeeSchema = new mongoose.Schema({
  joiningDate: {
    type: Date, // No validator, just a plain date
  },
  departmentId: {
    type: String,
    trim: true,
    minlength: [2, "Department ID must be at least 2 characters long"],
    required: [true, "Department ID is required"],
  },
  managerId: {
    type: String,
    trim: true,
    minlength: [2, "Manager ID must be at least 2 characters long"],
    required: [true, "Manager ID is required"],
  },
  designation: {
    type: String,
    trim: true,
    minlength: [2, "Designation must be at least 2 characters long"],
    maxlength: [50, "Designation must be at most 50 characters long"],
    required: [true, "Designation is required"],
  },
});

// Extend User using discriminator
const Employee =
  mongoose.models.Employee || User.discriminator("Employee", employeeSchema);

export default Employee;
