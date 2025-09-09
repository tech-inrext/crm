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
  "",
];

const type = ["Rent", "Buy", "Sell", ""];

const status = ["New", "Contacted", "Site Visit", "Closed", "Dropped", ""];

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      unique: true,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Invalid phone number",
      },
    },
    propertyName: {
      type: String,
      trim: true,
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
    followUpNotes: {
      type: [String],
    },

    nextFollowUp: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", leadSchema);
