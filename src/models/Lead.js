import mongoose from "mongoose";
import validator from "validator";

const range = [
  "<1 Lakh",
  "1 Lakh to 10 Lakh",
  "10 Lakh to 20 Lakh",
  "20 Lakh to 30 Lakh",
  "30 Lakh to 50 Lakh",
  "50 Lakh to 1 Crore",
  ">1 Crore",
];

const type = ["Rent", "Buy", "Sell"];

const status = ["New", "Contacted", "Site Visit", "Closed", "Dropped"];

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v);
        },
        message: "Invalid phone number",
      },
    },
    propertyType: {
      type: String,
      enum: type,
    },
    location: {
      type: String,
      trim: true,
    },
    budgetRange: {
      type: String,
      enum: range,
      trim: true,
    },
    status: {
      type: String,
      enum: status,
      default: "New",
    },
    source: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    followUpNotes: [
      {
        note: { type: String, trim: true },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    nextFollowUp: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", leadSchema);
