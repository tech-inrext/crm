import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔹 Type of Holiday
    type: {
      type: String,
      enum: ["public", "company", "optional"],
      default: "public",
    },

    // 🔹 Impact Level (for business planning)
    impact_level: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "high",
    },

    // 🔹 Who this applies to
    applicable_to: {
      type: String,
      enum: ["all", "sales", "support", "hr", "tech"],
      default: "all",
    },

    // 🔹 Region / Country
    region: {
      type: String,
      default: "India",
    },

    // 🔹 Recurring Holiday (e.g., Diwali, Christmas)
    is_recurring: {
      type: Boolean,
      default: false,
    },

    // 🔹 Optional metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // ✅ createdAt, updatedAt
  }
);

// 🔥 INDEX (important for performance)
HolidaySchema.index({ date: 1 });
HolidaySchema.index({ type: 1 });
HolidaySchema.index({ applicable_to: 1 });

export default mongoose.models.Holiday ||
  mongoose.model("Holiday", HolidaySchema);