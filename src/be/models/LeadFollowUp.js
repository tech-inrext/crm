import mongoose from "mongoose";

const leadFollowUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    leadIdentifier: {
      // store the original leadId or _id string for easy reference
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    submittedByName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.LeadFollowUp || mongoose.model("LeadFollowUp", leadFollowUpSchema);

