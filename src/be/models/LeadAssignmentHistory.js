import mongoose from "mongoose";

const leadAssignmentHistorySchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    previousAssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    newAssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["ASSIGN", "REVERT"],
      default: "ASSIGN",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default mongoose.models.LeadAssignmentHistory ||
  mongoose.model("LeadAssignmentHistory", leadAssignmentHistorySchema);
