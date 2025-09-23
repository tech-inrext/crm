import mongoose from "mongoose";
import validator from "validator";

/* 🔹 Atomic counter model for sequential IDs */
const CounterSchema = new mongoose.Schema(
  { _id: { type: String }, seq: { type: Number, default: 0 } },
  { versionKey: false }
);
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

/* 🔹 ID format config */
const EMP_ID_PREFIX = process.env.EMP_ID_PREFIX || "INX"; // change if needed
const EMP_ID_PAD = 5; // INX + 5 digits => INX00001
const EMP_ID_SCOPE = "EMPLOYEE_PROFILE_ID"; // counter key

const employeeSchema = new mongoose.Schema(
  {
    /* 🔹 New field: employeeProfileId (immutable, unique, required) */
    employeeProfileId: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
      required: true,
      match: new RegExp(`^${EMP_ID_PREFIX}\\d{${EMP_ID_PAD}}$`),
    },

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
    fatherName: {
      type: String,
      required: [true, "Father's Name is required"],
      trim: true,
      minlength: [2, "Father's Name must be at least 2 characters long"],
      maxlength: [50, "Father's Name must be at most 50 characters long"],
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
      minlength: [2, "Address must be at least 2 characters"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    mouStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
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
      // minlength: [2, "Department ID must be at least 2 characters long"],
      // required: [true, "Department ID is required"],
      default: null,
    },
    managerId: {
      type: String,
      trim: true,
      // minlength: [2, "Manager ID must be at least 2 characters long"],
      // required: [true, "Manager ID is required"],
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      minlength: [2, "Designation must be at least 2 characters long"],
      maxlength: [50, "Designation must be at most 50 characters long"],
      // required: [true, "Designation is required"],
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        // required: true,
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
    isCabVendor: {
      type: Boolean,
      default: false,
    },
    // Document URLs
    aadharUrl: {
      type: String,
      default: "",
    },
    mouPdfUrl: {
      type: String,
      default: "",
    },
    panUrl: {
      type: String,
      default: "",
    },
    bankProofUrl: {
      type: String,
      default: "",
    },
    signatureUrl: {
      type: String,
      default: "",
    },
    // Nominee subdocument (optional)
    nominee: {
      type: new mongoose.Schema(
        {
          name: { type: String, trim: true },
          phone: { type: String, trim: true },
          occupation: { type: String, trim: true },
          relation: { type: String, trim: true },
          gender: { type: String, enum: ["Male", "Female", "Other"] },
        },
        { _id: false }
      ),
      default: null,
    },
    // Freelancer fields
    slabPercentage: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

employeeSchema.index({ isCabVendor: 1, createdAt: -1 });

/* 🔹 Pre-validate hook to assign ID before required validation runs */
employeeSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && !this.employeeProfileId) {
      const doc = await Counter.findOneAndUpdate(
        { _id: EMP_ID_SCOPE },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const n = doc.seq;
      const id = `${EMP_ID_PREFIX}${String(n).padStart(EMP_ID_PAD, "0")}`;
      this.employeeProfileId = id;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Virtual property to check if employee is a manager (has subordinates)
employeeSchema.virtual("isManager").get(function () {
  // You can enhance this logic as needed
  return (
    !!this.designation && this.designation.toLowerCase().includes("manager")
  );
});

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
export default Employee;
