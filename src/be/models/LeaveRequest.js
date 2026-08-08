import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true, // Every leave must go to a manager
    },
    leaveType: {
      type: String,
      enum: [
        "Casual Leave",
        "Sick Leave",
        "Earned Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Bereavement Leave",
        "Women's Monthly Wellness Leave",
        "Compensatory Leave (Comp-Off)",
        "Loss Of Pay (LOP / LWP)",
        "Sabbatical Leave",
        "Unpaid Leave",
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    daysRequested: {
      type: Number,
      required: true,
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDayOption: {
      type: String,
      default: "Full Day",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    documentUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    managerRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    actionAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes to speed up queries
leaveRequestSchema.index({ employeeId: 1, status: 1 });
leaveRequestSchema.index({ managerId: 1, status: 1 });
leaveRequestSchema.index({ startDate: -1 });

export default mongoose.models.LeaveRequest ||
  mongoose.model("LeaveRequest", leaveRequestSchema);
