// models/TrainingVideo.js
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
    required: [true, "Video URL is required"],
    validate: {
      validator: function(v) {
        return v && (v.startsWith('http') || v.startsWith('/'));
      },
      message: "Invalid video URL format"
    }
  },
  thumbnailUrl: {
    type: String,
    required: [true, "Thumbnail URL is required"]
  },
  mimeType: {
    type: String,
    default: "video/mp4"
  },
  resolution: {
    type: String,
    default: "720p"
  },
  isPublic: {
    type: Boolean,
    default: true
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
  },
  isYouTube: {
    type: Boolean,
    default: false
  },
  youTubeId: {
    type: String,
    sparse: true
  },
  sourceType: {
    type: String,
    enum: ["youtube", "upload"],
    default: "upload"
  }
}, {
  timestamps: true
});

// Helper method to extract YouTube ID
trainingVideoSchema.methods.extractYouTubeId = function() {
  if (!this.videoUrl) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = this.videoUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Pre-save middleware to auto-set YouTube fields
trainingVideoSchema.pre('save', function(next) {
  if (this.videoUrl && this.videoUrl.includes('youtube.com') || this.videoUrl.includes('youtu.be')) {
    this.isYouTube = true;
    this.sourceType = "youtube";
    this.youTubeId = this.extractYouTubeId();
    
    // Auto-set thumbnail if not provided and it's YouTube
    if (this.youTubeId && !this.thumbnailUrl) {
      this.thumbnailUrl = `https://img.youtube.com/vi/${this.youTubeId}/maxresdefault.jpg`;
    }
    
    // Set mimeType for YouTube
    this.mimeType = "video/youtube";
  } else {
    this.isYouTube = false;
    this.sourceType = "upload";
  }
  
  next();
});

// Indexes for better performance
trainingVideoSchema.index({ title: "text", description: "text" });
trainingVideoSchema.index({ category: 1 });
trainingVideoSchema.index({ uploadDate: -1 });
trainingVideoSchema.index({ createdBy: 1 });
trainingVideoSchema.index({ isYouTube: 1 });
trainingVideoSchema.index({ sourceType: 1 });

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

