import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "General Announcements",
        "Project Updates",
        "Pricing / Offers",
        "Sales Targets",
        "Urgent Alerts",
        "HR / Internal",
      ],
      index: true,
    },

    priority: {
      type: String,
      enum: ["Urgent", "Important", "Info"],
      default: "Info",
      index: true,
    },

    departments: {
      type: String,
      enum: ["All", "Sales", "Marketing", "HR", "Accounts", "Operations"],
      default: "All",
      index: true,
    },

    expiry: {
      type: Date,
      default: null,
      index: true,
    },

    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Compound index for dashboard queries
noticeSchema.index({
  isActive: 1,
  priority: 1,
  pinned: 1,
  expiry: 1,
  createdAt: -1,
});

// Meta Method
noticeSchema.statics.getMeta = function () {
  return {
    categories: this.schema.path("category").enumValues,
    priorities: this.schema.path("priority").enumValues,
    departments: this.schema.path("departments").enumValues,
  };
};

export default mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
