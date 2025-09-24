import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true
    },
    builderName: {
      type: String,
      required: [true, "Builder name is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Project description is required"]
    },
    location: {
      type: String,
      required: [true, "Project location is required"]
    },
    price: {
      type: String,
      required: [true, "Price is required"]
    },
    status: {
      type: String,
      enum: ["Under Construction", "Ready to Move", "Pre Launch"],
      required: true
    },
    features: [String],
    amenities: [String],
    nearby: [String],
    projectHighlights: [String],
    mapLocation: {
      lat: Number,
      lng: Number
    },
    brochureUrls: [{
      title: String,
      url: String,
      type: { type: String, default: "PDF Document" }
    }],
    creatives: [{
      title: String,
      url: String,
      type: { type: String, default: "Image" }
    }],
    videoIds: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.Property || mongoose.model("Property", propertySchema);