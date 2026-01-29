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
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    plcType: {
      type: String,
      enum: ["percentage", "per_sq_ft", "per_sq_yard", "unit"],
      default: "percentage"
    },
    plcValue: {
      type: String,
      trim: true,
    },
    otherCharges1: {
      type: String,
      trim: true,
    },
    paymentPlan: {
      type: String,
      trim: true,
    },
    projectRate: {
      type: String,
      required: [true, "Project rate is required"],
      trim: true,
    },
    companyDiscount: {
      type: String,
      trim: true,
    },
    companyLoggedInRate: {
      type: String,
      trim: true,
    },
    salesPersonDiscountBSP: {
      type: String,
      trim: true,
    },
    salesPersonDiscountPLC: {
      type: String,
      trim: true,
    },
    salesPersonDiscountClub: {
      type: String,
      trim: true,
    },
    salesPersonDiscountOthers: {
      type: String,
      trim: true,
    },
    soldPriceBSP: {
      type: String,
      trim: true,
    },
    soldPricePLC: {
      type: String,
      trim: true,
    },
    soldPriceClub: {
      type: String,
      trim: true,
    },
    soldPriceOthers: {
      type: String,
      trim: true,
    },
    netSoldCopAmount: {
      type: String,
      trim: true,
    },
    bookingAmount: {
      type: String,
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ["cheque", "online", "cash"],
      default: "cheque"
    },
    chequeNumber: {
    type: String,
    trim: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  cashReceiptNumber: {
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
    },
    totalDiscountFromComm: {
      type: String,
      trim: true,
    },
    netApplicableComm: {
      type: String,
      trim: true,
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

// Method to calculate netSoldCopAmount
bookingLoginSchema.methods.calculateNetSoldCopAmount = function() {
  const area = parseFloat(this.area) || 0;
  const projectRate = parseFloat(this.projectRate) || 0;
  const otherCharges1 = parseFloat(this.otherCharges1) || 0;
  const companyDiscount = parseFloat(this.companyDiscount) || 0;
  const plcValue = parseFloat(this.plcValue) || 0;
  
  // Base amount
  let baseAmount = area * projectRate;
  
  // Add other charges
  baseAmount += otherCharges1;
  
  // Apply company discount
  baseAmount -= companyDiscount;
  
  // Apply PLC calculation based on type
  if (this.plcType && plcValue > 0) {
    switch (this.plcType) {
      case "percentage":
        baseAmount -= (baseAmount * plcValue) / 100;
        break;
      case "per_sq_ft":
        baseAmount -= (plcValue * area);
        break;
      case "per_sq_yard":
        baseAmount -= (plcValue * area * 0.111111);
        break;
      case "unit":
        baseAmount -= plcValue;
        break;
    }
  }
  
  return Math.max(0, baseAmount).toString();
};

// Pre-save middleware to auto-calculate netSoldCopAmount
bookingLoginSchema.pre('save', function(next) {
  if (this.isModified('area') || this.isModified('projectRate') || 
      this.isModified('otherCharges1') || this.isModified('companyDiscount') ||
      this.isModified('plcType') || this.isModified('plcValue')) {
    this.netSoldCopAmount = this.calculateNetSoldCopAmount();
  }
  next();
});

// Index for better query performance
bookingLoginSchema.index({ projectName: 1, unitNo: 1 });
bookingLoginSchema.index({ status: 1 });
bookingLoginSchema.index({ createdBy: 1 });
bookingLoginSchema.index({ phoneNo: 1 });

const BookingLogin = mongoose.models.BookingLogin || mongoose.model("BookingLogin", bookingLoginSchema);
export default BookingLogin;

