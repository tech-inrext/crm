import mongoose from "mongoose";
import validator from "validator";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, "en-IN");
        },
        message: "Invalid Indian phone number",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email Id is not valid");
        }
      },
    },
    altPhone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return value === "" || validator.isMobilePhone(value, "en-IN");
        },
        message: "Invalid alternate phone number",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [120, "Age cannot exceed 120"],
      set: (val) => (val === "" ? undefined : val),
    },
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
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
      },
    ],
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isPasswordReset: {
      type: Boolean,
      default: false,
    },
    passwordLastResetAt: {
      type: Date,
      default: Date.now,
    },
    resetOTP: String,
    resetOTPExpires: Date,
  },
  { timestamps: true }
);


// Virtual property to check if employee is a manager (has subordinates)
employeeSchema.virtual("isManager").get(function () {
  // You can enhance this logic as needed
  return !!this.designation && this.designation.toLowerCase().includes("manager");
});

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default Employee;
