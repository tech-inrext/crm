
import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    followUpDate: {
      type: Date,
      required: false,
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

    followUpType: {
      type: String,
      enum: ["site visit", "call back", "note"],
      default: "note",
    },

    cabBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CabBooking",
      required: false,
    },

    notificationsSent: {
      type: [String],
      enum: ['24H_BEFORE', '2H_BEFORE', '5MIN_BEFORE'],
      default: []
    },
  },
  { timestamps: true }
);

export default mongoose.models.FollowUp || mongoose.model("FollowUp", followUpSchema);
