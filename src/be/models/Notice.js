import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true, // fast search
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      trim: true,
      index: true, // filter support
    },

    priority: {
      type: String,
      trim: true,
      default: "Info",
      index: true,
    },

    audience: {
      type: String,
      trim: true,
      default: "All",
      index: true,
    },

    expiry: {
      type: Date,
      default: null,
      index: true, // expiry filtering
    },

    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true, // important for filtering active notices
    },
  },
  { timestamps: true }
);

// Compound index for dashboard queries
noticeSchema.index({
  isActive: 1,
  priority: 1,
  pinned: 1,
  expiry: 1,
  createdAt: -1,
});

export default mongoose.models.Notice ||
  mongoose.model("Notice", noticeSchema);