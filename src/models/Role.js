import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String, // e.g., 'Admin', 'Manager', 'SalesAgent', 'HR'
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description can be max 200 characters"],
    },
    permissions: [
      {
        type: String,
        trim: true,
        lowercase: true,
        enum: ["createLead", "read", "write", "delete"],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
