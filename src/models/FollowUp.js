import mongoose from "mongoose";

const followUpEntrySchema = new mongoose.Schema({
  followUpDate: {
    type: Date,
  },
  note: {
    type: String,
    trim: true,
    default: "N/A",
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // followUpType - site visit, call back, note
  followUpType: {
    type: String,
    enum: ["site visit", "call back", "note"],
    default: "note",
  },
});

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      unique: true, // One lead, one FollowUp document
    },

    followUps: [followUpEntrySchema],
  },
  { timestamps: true }
);

export default mongoose.models.FollowUp || mongoose.model("FollowUp", followUpSchema);
