import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // ✅ ADD THIS (CRITICAL)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    leave_type: {
      type: String,
      enum: ["casual", "sick", "earned"],
      required: true,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    handover_to: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ✅ ADD THESE (TRACK ACTIONS)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    approvedAt: Date,
    rejectedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Leave ||
  mongoose.model("Leave", LeaveSchema);