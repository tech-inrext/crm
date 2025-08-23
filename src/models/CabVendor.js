// models/CabVendor.js
import mongoose from "mongoose";

const cabVendorSchema = new mongoose.Schema(
  {
    // Top fields
    cabOwnerName: {
      type: String,
      required: [true, "Cab Owner Name is required"],
      trim: true,
      maxlength: 120,
    },
    driverName: {
      type: String,
      required: [true, "Driver Name is required"],
      trim: true,
      maxlength: 120,
    },

    // Project Name(s) - multi-select
    // (UI has "Select All Projects" which is a UI helper, not stored)
    projects: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
      ],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Please select at least one project",
      },
      required: true,
    },

    // Team Head (dropdown)
    teamHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team Head is required"],
    },

    // Odometer + total
    startKilometers: {
      type: Number,
      required: [true, "Start Kilometers is required"],
      min: [0, "Start Kilometers cannot be negative"],
    },
    endKilometers: {
      type: Number,
      required: [true, "End Kilometers is required"],
      min: [0, "End Kilometers cannot be negative"],
      validate: {
        validator: function (v) {
          // only validate when both are set
          if (typeof this.startKilometers !== "number") return true;
          return v >= this.startKilometers;
        },
        message:
          "End Kilometers must be greater than or equal to Start Kilometers",
      },
    },
    totalKilometers: {
      type: Number,
      default: 0, // will be auto-computed in hooks below
      min: [0, "Total Kilometers cannot be negative"],
      immutable: true, // keep derived
    },

    // Route points
    pickupPoint: {
      type: String,
      required: [true, "Pickup Point is required"],
      trim: true,
      maxlength: 200,
    },
    dropPoint: {
      type: String,
      required: [true, "Drop Point is required"],
      trim: true,
      maxlength: 200,
    },

    // Employee Name (text field in the form)
    employeeName: {
      type: String,
      required: [true, "Employee Name is required"],
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Derive totalKilometers on save/update
function computeTotal(doc) {
  if (
    typeof doc.startKilometers === "number" &&
    typeof doc.endKilometers === "number"
  ) {
    doc.totalKilometers = Math.max(0, doc.endKilometers - doc.startKilometers);
  }
}

cabVendorSchema.pre("validate", function (next) {
  computeTotal(this);
  next();
});

cabVendorSchema.pre("findOneAndUpdate", function (next) {
  // Ensure total is recomputed on updates that change odometer values
  const update = this.getUpdate() || {};
  const $set = update.$set || update;

  // Use existing values if not provided in the update
  // (requires an extra read of current doc)
  if ($set && ("startKilometers" in $set || "endKilometers" in $set)) {
    this.model
      .findOne(this.getQuery())
      .then((current) => {
        const start =
          "startKilometers" in $set
            ? $set.startKilometers
            : current.startKilometers;
        const end =
          "endKilometers" in $set ? $set.endKilometers : current.endKilometers;
        const total = Math.max(0, (end ?? 0) - (start ?? 0));

        if (update.$set) update.$set.totalKilometers = total;
        else update.totalKilometers = total;

        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// Helpful indexes
cabVendorSchema.index({ projects: 1, createdAt: -1 });
cabVendorSchema.index({ teamHead: 1, createdAt: -1 });
cabVendorSchema.index({ driverName: 1 });

// Optional virtuals for easy population
cabVendorSchema.virtual("projectDetails", {
  ref: "Project",
  localField: "projects",
  foreignField: "_id",
  justOne: false,
});

cabVendorSchema.virtual("teamHeadDetails", {
  ref: "User",
  localField: "teamHead",
  foreignField: "_id",
  justOne: true,
});

export default mongoose.models.CabVendor ||
  mongoose.model("CabVendor", cabVendorSchema);
