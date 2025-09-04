// Vehicle.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { 
    type: String, 
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  model: { 
    type: String, 
    required: [true, 'Model is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['sedan', 'suv', 'van', 'luxury'],
    required: [true, 'Vehicle type is required']
  },
  capacity: { 
    type: Number, 
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  lastMaintenance: Date,
  nextMaintenance: Date,
  status: {
    type: String,
    enum: ['active', 'maintenance', 'out_of_service'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ isAvailable: 1 });
vehicleSchema.index({ status: 1 });

// Guarded model registration to avoid OverwriteModelError during hot reloads
export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
