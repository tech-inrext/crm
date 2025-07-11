import mongoose from "mongoose";

const BulkUploadSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  totalRecords: Number,
  uploaded: Number,
  duplicates: Number,
  invalidPhones: Number,
  otherErrors: Number,
  details: {
    uploaded: [String],
    duplicates: [{ phone: String, reason: String }],
    invalidPhones: [{ phone: String, reason: String }],
    otherErrors: [{ phone: String, reason: String }],
  },
  fileUrl: {
    type: String,
    required: true, // or false based on implementation
  },
  reportFileName: {
    type: String,
    required: true,
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BulkUpload ||
  mongoose.model("BulkUpload", BulkUploadSchema);
