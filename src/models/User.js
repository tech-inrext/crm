// models/User.js
import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    inventory_management: { type: Boolean, default: false },
    finance_reports: { type: Boolean, default: false },
    offer_management: { type: Boolean, default: false },
    cab_booking: { type: Boolean, default: false },
    user_management: { type: Boolean, default: false },
    investor_dashboard: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, unique: true }, // Add this line
  displayName: { type: String },
  photoURL: { type: String },
  providerId: { type: String },
  role: {
    type: String,
    required: true,
    enum: [
      "super_admin",
      "accounts",
      "team_head",
      "associate",
      "cab_management",
      "investor",
    ],
    default: "investor",
  },
  permissions: { type: permissionSchema, default: () => ({}) },
  assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to set default permissions based on role
userSchema.pre("save", function (next) {
  if (this.isNew) {
    this.permissions = getDefaultPermissions(this.role);
  }
  next();
});

// Method to check permissions
userSchema.methods.hasPermission = function (permission) {
  return this.permissions[permission] || false;
};

// Static method to get default permissions
function getDefaultPermissions(role) {
  const permissions = {
    inventory_management: false,
    finance_reports: false,
    offer_management: false,
    cab_booking: false,
    user_management: false,
    investor_dashboard: true,
  };

  switch (role) {
    case "super_admin":
      Object.keys(permissions).forEach((key) => (permissions[key] = true));
      break;
    case "accounts":
      permissions.inventory_management = true;
      permissions.finance_reports = true;
      permissions.cab_booking = true;
      break;
    case "team_head":
      permissions.offer_management = true;
      permissions.cab_booking = true;
      break;
    case "associate": // Add this case
      permissions.offer_management = true;
      break;
    case "cab_management":
      permissions.cab_booking = true;
      break;
  }

  return permissions;
}

module.exports = mongoose.model("User", userSchema);
