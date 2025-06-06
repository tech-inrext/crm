import mongoose from "mongoose";
import validator from "validator";

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
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
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v);
        },
        message: "Invalid phone number",
      },
    },
    propertyType: {
      type: String,
      enum: ["Rent", "Buy", "Sell"],
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    budgetRange: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Site Visit", "Closed", "Dropped"],
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
