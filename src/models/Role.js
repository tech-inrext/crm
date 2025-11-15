import mongoose from "mongoose";

const modules = [
  "employee",
  "lead",
  "mou",
  "team",
  "role",
  "department",
  "cab-booking",
  "cab-vendor",
  "vendor",
  "property",
  "booking-login"
];

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String, // e.g., 'Admin', 'Manager', 'SalesAgent', 'HR'
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    isSystemAdmin: {
      type: Boolean,
      default: false,
    },
    showTotalUsers: {
      type: Boolean,
      default: false,
    },
    showTotalVendorsBilling: {
      type: Boolean,
      default: false,
    },
    showCabBookingAnalytics: {
      type: Boolean,
      default: false,
    },
    showScheduleThisWeek: {
      type: Boolean,
      default: false,
    },
    read: {
      type: [String],
      enum: modules,
    },
    write: {
      type: [String],
      enum: modules,
    },
    delete: {
      type: [String],
      enum: modules,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
