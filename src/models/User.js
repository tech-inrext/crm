import mongoose from "mongoose";
import validator from "validator";

const options = {
  discriminatorKey: "userType",
  collection: "users",
};

const userSchema = new mongoose.Schema(
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
  },
  { timestamps: true, ...options }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
