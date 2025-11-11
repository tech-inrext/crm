
import mongoose from "mongoose";

// Helper function to auto-generate Branch ID
function generateBranchId() {
  const prefix = "BR"; // you can change prefix if needed
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
  return `${prefix}${randomNum}`;
}

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
      minlength: [2, "Branch name must be at least 2 characters long"],
      maxlength: [100, "Branch name must be at most 100 characters long"],
    },
    address: {
      type: String,
      required: [true, "Branch address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
      maxlength: [300, "Address must be at most 300 characters long"],
    },
    branchId: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-generate branchId if not already set
branchSchema.pre("save", async function (next) {
  if (!this.branchId) {
    let newId;
    let exists;
    do {
      newId = generateBranchId();
      exists = await mongoose.models.Branch.findOne({ branchId: newId });
    } while (exists);

    this.branchId = newId;
  }
  next();
});

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
