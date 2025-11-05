// models/BookingLogin.js
import mongoose from "mongoose";

const bookingLoginSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    product: {
      type: String,
      trim: true,
    },
    customer1Name: {
      type: String,
      required: [true, "Customer 1 name is required"],
      trim: true,
    },
    customer2Name: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    phoneNo: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    panImage: {
      url: String,
      public_id: String,
    },
    aadharImage: [{
      url: String,
      public_id: String,
    }],
    unitNo: {
      type: String,
      required: [true, "Unit number is required"],
      trim: true,
    },
    area: {
      type: Number,
      required: [true, "Area is required"],
      min: [0, "Area cannot be negative"],
    },
    floor: {
      type: String,
      required: [true, "Floor is required"],
      trim: true,
    },
    plcPercentage: {
      type: Number,
      min: [0, "PLC percentage cannot be negative"],
    },
    plcAmount: {
      type: Number,
      min: [0, "PLC amount cannot be negative"],
    },
    otherCharges1: {
      type: Number,
      min: [0, "Other charges cannot be negative"],
    },
    otherCharges2: {
      type: Number,
      min: [0, "Other charges cannot be negative"],
    },
    paymentPlan: {
      type: String,
      trim: true,
    },
    projectRate: {
      type: Number,
      required: [true, "Project rate is required"],
      min: [0, "Project rate cannot be negative"],
    },
    companyDiscount: {
      type: Number,
      min: [0, "Company discount cannot be negative"],
    },
    actualLoggedInRate: {
      type: Number,
      min: [0, "Rate cannot be negative"],
    },
    salesPersonDiscountBSP: {
      type: Number,
      min: [0, "Discount cannot be negative"],
    },
    salesPersonDiscountPLC: {
      type: Number,
      min: [0, "Discount cannot be negative"],
    },
    salesPersonDiscountClub: {
      type: Number,
      min: [0, "Discount cannot be negative"],
    },
    salesPersonDiscountOthers: {
      type: Number,
      min: [0, "Discount cannot be negative"],
    },
    soldPriceBSP: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    soldPricePLC: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    soldPriceClub: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    soldPriceOthers: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    netSoldCopAmount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
    },
    bookingAmount: {
      type: Number,
      min: [0, "Booking amount cannot be negative"],
    },
    chequeTransactionDetails: {
      type: String,
      trim: true,
    },
    transactionDate: {
      type: Date,
    },
    bankDetails: {
      type: String,
      trim: true,
    },
    slabPercentage: {
      type: String,
      enum: ["50% Sales Executive", "60% Manager", "70% Senior Manager", "80% General Manager", "90% A.V.P (Core Member)", "95% V.P", "100% President"],
      default: "50% Sales Executive",
      validate: {
        validator: function(v) {
          return ["50% Sales Executive", "60% Manager", "70% Senior Manager", "80% General Manager", "90% A.V.P (Core Member)", "95% V.P", "100% President"].includes(v);
        },
        message: "Slab percentage must be one of: 50% Sales Executive, 60% Manager, 70% Senior Manager, 80% General Manager, 90% A.V.P (Core Member), 95% V.P, 100% President."
      }
    },
    totalDiscountFromComm: {
      type: Number,
      min: [0, "Discount cannot be negative"],
    },
    netApplicableComm: {
      type: Number,
      min: [0, "Commission cannot be negative"],
    },
    salesPersonName: {
      type: String,
      trim: true,
    },
    teamHeadName: {
      type: String,
      trim: true,
    },
    teamLeaderName: {
      type: String,
      trim: true,
    },
    businessHead: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
bookingLoginSchema.index({ projectName: 1, unitNo: 1 });
bookingLoginSchema.index({ status: 1 });
bookingLoginSchema.index({ createdBy: 1 });
bookingLoginSchema.index({ phoneNo: 1 });

// Virtual for total amount calculation
bookingLoginSchema.virtual("totalAmount").get(function () {
  return (this.area * this.projectRate) || 0;
});

// Method to update status
bookingLoginSchema.methods.updateStatus = function (status, approvedBy = null, rejectionReason = "") {
  this.status = status;
  if (status === "approved" && approvedBy) {
    this.approvedBy = approvedBy;
  }
  if (status === "rejected") {
    this.rejectionReason = rejectionReason;
  }
  return this.save();
};

const BookingLogin = mongoose.models.BookingLogin || mongoose.model("BookingLogin", bookingLoginSchema);
export default BookingLogin;


