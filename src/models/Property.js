// models/Property.js
import mongoose from "mongoose";

// =======================
// Sub-schema: Property Type
// =======================
const propertyTypeSchema = new mongoose.Schema(
  {
    propertyType: {
      type: String,
      required: [true, "Property type name is required"],
      trim: true,
      enum: ["residential", "commercial"],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price is required for property type"],
    },
    paymentPlan: {
      type: String,
      required: [true, "Payment plan is required for property type"],
    },

    // ✅ Residential fields
    bedrooms: {
      type: Number,
      required: function () {
        return this.propertyType === "residential";
      },
    },
    bathrooms: {
      type: Number,
      required: function () {
        return this.propertyType === "residential";
      },
    },
    toilet: {
      type: Number,
      required: function () {
        return this.propertyType === "residential";
      },
    },
    balcony: {
      type: Number,
      required: function () {
        return this.propertyType === "residential";
      },
    },

    // ✅ Commercial fields
    // carpetArea: {
    //   type: String,
    //   required: function () {
    //     return this.propertyType === "commercial";
    //   },
    // },
    // builtUpArea: {
    //   type: String,
    // },
    // loadingArea: {
    //   type: String,
    // },
    carpetArea: {
      type: String,
      required: function () {
        return (
          this.propertyType === "residential" ||
          this.propertyType === "commercial"
        );
      },
    },
    builtUpArea: {
      type: String,
      required: function () {
        return (
          this.propertyType === "residential" ||
          this.propertyType === "commercial"
        );
      },
    },
    loadingArea: {
      type: String,
      required: function () {
        return (
          this.propertyType === "residential" ||
          this.propertyType === "commercial"
        );
      },
    },

    // ✅ Common fields
    features: [String],
    amenities: [String],

    images: [
      {
        url: String,
        title: String,
        description: String,
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    floorPlan: [
      {
        url: String,
        title: String,
        description: String,
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// =======================
// Main Schema: Property
// =======================
const propertySchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    builderName: {
      type: String,
      required: [true, "Builder name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    location: {
      type: String,
      required: [true, "Project location is required"],
    },

    // ✅ Multiple property types under one project
    propertyTypes: [propertyTypeSchema],

    status: {
      type: [String],
    },
    nearby: [String],
    projectHighlights: [String],

    mapLocation: {
      lat: Number,
      lng: Number,
    },

    images: [
      {
        url: String,
        title: String,
        description: String,
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    brochureUrls: [
      {
        title: String,
        url: String,
        type: { type: String, default: "PDF Document" },
      },
    ],

    creatives: [
      {
        title: String,
        url: String,
        type: { type: String, default: "Image" },
      },
    ],

    videoFiles: [
      {
        title: String,
        url: String,
        type: { type: String, default: "Video File" },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Property ||
  mongoose.model("Property", propertySchema);
