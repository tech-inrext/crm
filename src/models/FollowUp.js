<<<<<<< HEAD

=======
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
<<<<<<< HEAD
=======
      index: true, // Optimizes finding by lead
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
    },

    followUpDate: {
      type: Date,
<<<<<<< HEAD
      required: false, 
=======
      required: false,
      index: true, // CRITICAL: Optimizes range queries for notification poller
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
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
<<<<<<< HEAD
=======

    notificationsSent: {
      type: [String],
      default: [], // e.g., ["24H", "2H", "5M", "DUE"]
    },
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  },
  { timestamps: true }
);

<<<<<<< HEAD
export default mongoose.models.FollowUp || mongoose.model("FollowUp", followUpSchema);
=======
// Compound index for efficient notification queries
followUpSchema.index({ followUpDate: 1, notificationsSent: 1 });

export default mongoose.models.FollowUp ||
  mongoose.model("FollowUp", followUpSchema);
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
