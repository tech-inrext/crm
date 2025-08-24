// CabBooking.js
import mongoose from "mongoose";

const cabBookingSchema = new mongoose.Schema(
  {
    cabBookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    bookingId: {
      type: String,
      unique: true,
      required: true,
      default: () => {
        // Generate a unique Booking ID (e.g., CAB-<timestamp>-<random>)
        const ts = Date.now();
        const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `CAB-${ts}-${rand}`;
      },
    },
    project: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name must be less than 100 characters"],
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    numberOfClients: {
      type: Number,
      required: [true, "Number of clients is required"],
      min: [1, "At least 1 client required"],
    },
    pickupPoint: {
      type: String,
      required: [true, "Pickup point is required"],
      trim: true,
    },
    dropPoint: {
      type: String,
      required: [true, "Drop point is required"],
      trim: true,
    },
    managerId: {
      type: String,
      trim: true,
      required: [true, "Manager ID is required for approval"],
    },
    requestedDateTime: {
      type: Date,
      required: [true, "Requested date/time is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "completed", "cancelled"],
        message: "Invalid status",
      },
      default: "pending",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    currentLocation: {
      type: String,
      trim: true,
    },
    estimatedArrival: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
cabBookingSchema.index({ project: 1, status: 1 });
cabBookingSchema.index({ teamLeader: 1 });
cabBookingSchema.index({ status: 1 });
cabBookingSchema.index({ requestedDateTime: 1 });

// Virtual populate
cabBookingSchema.virtual("projectDetails", {
  ref: "Project",
  localField: "project",
  foreignField: "_id",
  justOne: true,
});

cabBookingSchema.virtual("driverDetails", {
  ref: "User",
  localField: "driver",
  foreignField: "_id",
  justOne: true,
});

cabBookingSchema.virtual("teamLeaderDetails", {
  ref: "User",
  localField: "teamLeader",
  foreignField: "_id",
  justOne: true,
});

export default mongoose.models.CabBooking || mongoose.model("CabBooking", cabBookingSchema);
