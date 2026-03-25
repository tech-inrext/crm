const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      required: true,
      trim: true,
      default: "Info",
    },

    audience: {
      type: String,
      required: true,
      trim: true,
      default: "All",
    },

    expiry: {
      type: Date,
      default: null,
    },

    pinned: {
      type: Boolean,
      default: false,  
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);