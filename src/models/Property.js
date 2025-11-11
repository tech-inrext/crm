// models/Property.js
import mongoose from "mongoose";
import slugify from "slugify";

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
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Project location is required"],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: ["project", "residential", "commercial", "plot"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // Allows multiple nulls for unique constraint
    },
    status: { type: [String], default: [] },
    nearby: { type: [String], default: [] },
    projectHighlights: { type: [String], default: [] },

    mapLocation: {
      lat: Number,
      lng: Number,
    },

    images: [{
      url: String,
      title: String,
      description: String,
      isPrimary: { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now },
    }],

    brochureUrls: [{
      title: String,
      url: String,
      type: { type: String, default: "PDF Document" },
    }],

    creatives: [{
      type: { type: String, enum: ["image", "video", "3d-tour"] },
      url: String,
      title: String,
      description: String,
      thumbnail: String,
      uploadedAt: { type: Date, default: Date.now },
    }],

    videos: [{
      url: String,
      title: String,
      description: String,
      thumbnail: String,
      type: { type: String, enum: ["youtube", "vimeo", "direct"], default: "youtube" },
      uploadedAt: { type: Date, default: Date.now },
    }],

    propertyName: {
      type: String,
      trim: true,
    },
    propertyDescription: {
      type: String,
    },
    price: {
      type: String,
    },
    minPrice: {
      type: Number,
      default: null
    },
    maxPrice: {
      type: Number,
      default: null
    },
    paymentPlan: {
      type: String,
      required: [true, "Payment plan is required"],
    },

    minSize: {
      type: String,
    },
    maxSize: {
      type: String,
    },
    sizeUnit: {
      type: String,
      enum: ["sq.ft.", "sq.m.", "sq.yd.", "acres", "hectares", ""],
      default: "sq.ft.",
    },

    bedrooms: {
      type: Number,
    },
    bathrooms: {
      type: Number,
    },
    toilet: {
      type: Number,
    },
    balcony: {
      type: Number,
    },
    carpetArea: {
      type: String,
    },
    builtUpArea: {
      type: String,
    },

    ownershipType: {
      type: String,
      enum: ["Freehold", "Leasehold", "GPA", "Power of Attorney"],
    },
    landType: {
      type: String,
      enum: ["Residential Plot", "Commercial Plot", "Farm Land", "Industrial Plot", "Mixed Use"],
    },
    approvedBy: {
      type: String,
    },
    boundaryWall: {
      type: Boolean,
    },

    propertyImages: {
      type: [{
        url: String,
        title: String,
        description: String,
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      }],
    },
    
    floorPlans: {
      type: [{
        url: String,
        title: String,
        description: String,
        type: { 
          type: String, 
          enum: ["2d", "3d", "structural", "image", "pdf"],
          default: "2d" 
        },
        uploadedAt: { type: Date, default: Date.now },
      }],
    },

    amenities: {
      type: [String],
      default: []
    },

    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    hierarchyLevel: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug
propertySchema.pre("save", function (next) {
  // Generate slug only for main projects (parentId is null)
  if ((this.isModified("projectName") || this.isModified("builderName") || !this.slug) && this.parentId === null) {
    const baseSlug = slugify(`${this.projectName} ${this.builderName}`, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Add random string for uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomSuffix}`;
  } else if (this.parentId) {
    // Sub-properties don't get slugs
    this.slug = undefined;
  }

  // Set hierarchy level based on parentId
  if (this.parentId) {
    this.hierarchyLevel = 1;
  } else {
    this.hierarchyLevel = 0;
  }

  // Clean up fields based on propertyType to ensure database consistency
  if (this.propertyType === 'project') {
    // For projects, remove residential/commercial/plot specific fields
    this.propertyImages = undefined;
    this.floorPlans = undefined;
    this.bedrooms = undefined;
    this.bathrooms = undefined;
    this.toilet = undefined;
    this.balcony = undefined;
    this.carpetArea = undefined;
    this.builtUpArea = undefined;
    this.ownershipType = undefined;
    this.landType = undefined;
    this.approvedBy = undefined;
    this.boundaryWall = undefined;
  } 
  else if (this.propertyType === 'residential') {
    // For residential, remove plot/commercial specific fields
    this.ownershipType = undefined;
    this.landType = undefined;
    this.approvedBy = undefined;
    this.boundaryWall = undefined;
  }
  else if (this.propertyType === 'commercial') {
    // For commercial, remove residential/plot specific fields
    this.bedrooms = undefined;
    this.bathrooms = undefined;
    this.toilet = undefined;
    this.balcony = undefined;
    this.ownershipType = undefined;
    this.landType = undefined;
    this.approvedBy = undefined;
    this.boundaryWall = undefined;
  }
  else if (this.propertyType === 'plot') {
    // For plot, remove residential/commercial specific fields
    this.bedrooms = undefined;
    this.bathrooms = undefined;
    this.toilet = undefined;
    this.balcony = undefined;
    this.carpetArea = undefined;
    this.builtUpArea = undefined;
  }
  
  next();
});

// Static method to generate unique slug
propertySchema.statics.generateUniqueSlug = async function(projectName, builderName, existingId = null) {
  let baseSlug = slugify(`${projectName} ${builderName}`, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug already exists
  while (true) {
    const query = { slug: slug };
    if (existingId) {
      query._id = { $ne: existingId };
    }
    
    const existingProperty = await this.findOne(query);
    
    if (!existingProperty) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Static method to find by slug
propertySchema.statics.findBySlug = function(slug) {
  return this.findOne({ 
    slug: slug,
    isActive: true 
  }).populate("createdBy", "name email");
};

// Static method to find by ID or slug
propertySchema.statics.findByIdOrSlug = function(identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return this.findOne({ 
      _id: identifier,
      isActive: true 
    }).populate("createdBy", "name email");
  } else {
    return this.findOne({ 
      slug: identifier,
      isActive: true 
    }).populate("createdBy", "name email");
  }
};

// Index for better query performance
// propertySchema.index({ slug: 1 });
propertySchema.index({ projectName: 1, builderName: 1, location: 1 });
propertySchema.index({ parentId: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ hierarchyLevel: 1 });
propertySchema.index({ minPrice: 1 }); 
propertySchema.index({ maxPrice: 1 }); 

// Virtual for subProperties
propertySchema.virtual("subProperties", {
  ref: "Property",
  localField: "_id",
  foreignField: "parentId",
});

// Virtual for subProperties count
propertySchema.virtual("subPropertiesCount", {
  ref: "Property",
  localField: "_id",
  foreignField: "parentId",
  count: true,
});

// Virtual for parent property details
propertySchema.virtual("parentDetails", {
  ref: "Property",
  localField: "parentId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtual fields are serialized
propertySchema.set("toJSON", { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.id;
    return ret;
  }
});

propertySchema.set("toObject", { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.id;
    return ret;
  }
});

// Static method to find active properties
propertySchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find main projects only
propertySchema.statics.findMainProjects = function() {
  return this.find({ 
    parentId: null,
    isActive: true 
  });
};

// Static method to find sub-properties by parentId
propertySchema.statics.findSubProperties = function(parentId) {
  return this.find({ 
    parentId: parentId,
    isActive: true 
  });
};

// Static method to find by project name with hierarchy
propertySchema.statics.findByProjectName = function(projectName) {
  return this.find({ 
    projectName: new RegExp(projectName, 'i'),
    isActive: true 
  });
};

// Instance method to check if property has sub-properties
propertySchema.methods.hasSubProperties = async function() {
  const count = await mongoose.model('Property').countDocuments({ 
    parentId: this._id,
    isActive: true 
  });
  return count > 0;
};

// Instance method to get sub-properties
propertySchema.methods.getSubProperties = function() {
  return mongoose.model('Property').find({ 
    parentId: this._id,
    isActive: true 
  });
};

// Instance method to get parent property
propertySchema.methods.getParentProperty = function() {
  return mongoose.model('Property').findOne({ 
    _id: this.parentId,
    isActive: true 
  });
};

export default mongoose.models.Property || mongoose.model("Property", propertySchema);


