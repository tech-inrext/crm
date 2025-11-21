
import mongoose from "mongoose";

const pillarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "the-visionaries",
        "the-strategic-force", 
        "growth-navigators",
        "the-powerhouse-team"
      ],
    },
    profileImages: [{
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ["primary", "secondary"],
        default: "primary"
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    about: {
      type: String,
      required: [true, "About section is required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
    },
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    }],
    expertise: [{
      type: String,
      trim: true,
    }],
    skills: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
pillarSchema.index({ category: 1, createdAt: -1 });
pillarSchema.index({ isActive: 1 });
pillarSchema.index({ name: "text", about: "text", expertise: "text" });

// Static method to get pillars by category
pillarSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true 
  })
  .populate("projects", "projectName builderName location price images")
  .populate("createdBy", "name email")
  .sort({ createdAt: -1 });
};

// Static method to get all active pillars with populated data
pillarSchema.statics.getActivePillars = function() {
  return this.find({ isActive: true })
    .populate("projects", "projectName builderName location price images slug")
    .populate("createdBy", "name email")
    .sort({ category: 1, createdAt: -1 });
};

export default mongoose.models.Pillar || mongoose.model("Pillar", pillarSchema);


