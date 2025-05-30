// models/Employee.js
import mongoose from "mongoose";
import User from "./User.js"; // import base model

const employeeSchema = new mongoose.Schema({
  joiningDate: { type: Date  },
  departmentId: { type: String },
  managerId: { type: String },
  designation: { type: String },
});

// Extend User using discriminator
const Employee = mongoose.models.Employee || User.discriminator("Employee", employeeSchema);

export default Employee;
