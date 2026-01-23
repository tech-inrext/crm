
import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true, // Optimizes finding by lead
    },

    followUpDate: {
      type: Date,
      required: false, 
      required: false,
      index: true, // CRITICAL: Optimizes range queries for notification poller
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
      default: [], // e.g., ["24H", "2H", "5M", "DUE"]
    },
  },
  { timestamps: true }
);
// Compound index for efficient notification queries
followUpSchema.index({ followUpDate: 1, notificationsSent: 1 });

export default mongoose.models.FollowUp ||
  mongoose.model("FollowUp", followUpSchema);

