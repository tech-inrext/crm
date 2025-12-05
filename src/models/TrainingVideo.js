import mongoose from "mongoose";

const trainingVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Video title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  videoUrl: {
    type: String,
    required: [true, "Video URL is required"]
  },
  thumbnailUrl: {
    type: String,
    required: [true, "Thumbnail URL is required"]
  },
  category: {
    type: String,
    enum: [
      "basic-sales-training-fundamentals",
      "team-building", 
      "growth-model",
      "basic-fundamentals-of-real-estate",
      "company-code-of-conduct-rules-compliances"
    ],
    required: [true, "Category is required"]
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
trainingVideoSchema.index({ title: "text", description: "text" });
trainingVideoSchema.index({ category: 1 });
trainingVideoSchema.index({ uploadDate: -1 });
trainingVideoSchema.index({ createdBy: 1 });

// Static method to get featured videos
trainingVideoSchema.statics.getFeaturedVideos = function(limit = 4) {
  return this.find({})
    .sort({ uploadDate: -1 })
    .limit(limit)
    .populate("createdBy", "name email");
};

// Static method to get videos by category
trainingVideoSchema.statics.getVideosByCategory = function(category, limit = 10) {
  return this.find({ 
    category
  })
  .sort({ uploadDate: -1 })
  .limit(limit)
  .populate("createdBy", "name email");
};

export default mongoose.models.TrainingVideo || mongoose.model("TrainingVideo", trainingVideoSchema);
