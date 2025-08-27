// models/CabVendor.js
import mongoose from "mongoose";

const cabVendorSchema = new mongoose.Schema(
  {
    cabOwnerName: {
      type: String,
      required: [true, "Cab Owner Name is required"],
      trim: true,
      minlength: [2, "Cab Owner Name must be at least 2 characters long"],
      maxlength: [120, "Cab Owner Name must be at most 120 characters long"],
    },

    driverName: {
      type: String,
      required: [true, "Driver Name is required"],
      trim: true,
      minlength: [2, "Driver Name must be at least 2 characters long"],
      maxlength: [120, "Driver Name must be at most 120 characters long"],
    },

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
        validator: function (value) {
          if (typeof this.startKilometers !== "number") return true;
          return value >= this.startKilometers;
        },
        message:
          "End Kilometers must be greater than or equal to Start Kilometers",
      },
    },

    totalKilometers: {
      type: Number,
      default: 0,
      min: [0, "Total Kilometers cannot be negative"],
      immutable: true,
    },

    pickupPoint: {
      type: String,
      required: [true, "Pickup Point is required"],
      trim: true,
      minlength: [2, "Pickup Point must be at least 2 characters long"],
      maxlength: [200, "Pickup Point must be at most 200 characters long"],
    },

    dropPoint: {
      type: String,
      required: [true, "Drop Point is required"],
      trim: true,
      minlength: [2, "Drop Point must be at least 2 characters long"],
      maxlength: [200, "Drop Point must be at most 200 characters long"],
    },

    // 🔄 bookedBy (reference to Employee)
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Booked By (Employee) is required"],
    },

    // 🆕 approvedBy (reference to Employee)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Utility to compute total KM
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
  const update = this.getUpdate() || {};
  const $set = update.$set || update;

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

// Indexes
cabVendorSchema.index({ driverName: 1 });

// Virtuals
cabVendorSchema.virtual("bookedByDetails", {
  ref: "Employee",
  localField: "bookedBy",
  foreignField: "_id",
  justOne: true,
});

cabVendorSchema.virtual("approvedByDetails", {
  ref: "Employee",
  localField: "approvedBy",
  foreignField: "_id",
  justOne: true,
});

const CabVendor =
  mongoose.models.CabVendor || mongoose.model("CabVendor", cabVendorSchema);

export default CabVendor;
