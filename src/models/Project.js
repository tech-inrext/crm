// models/Project.js
// const mongoose = require('mongoose');

// const projectSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: { type: String, required: true },
//   reraNumber: { type: String, required: true },
//   status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
//   description: { type: String },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Project', projectSchema);

// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  location: {
    type: String,
    required: [true, 'Project location is required']
  },
  brochureUrls: [{
    title: String,
    url: String,
    type: { type: String, default: 'PDF Document' }
  }],
  creatives: [{
    title: String,
    url: String,
    type: { type: String, default: 'Image' }
  }],
  videoIds: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ name: 1, location: 1, isActive: 1 });

export default mongoose.model("Project", ProjectSchema);
 

 


