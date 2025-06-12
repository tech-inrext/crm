const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/inrext";

// Role schema (simplified for demo)
const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true },
  modulePermissions: {
    employee: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    user: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    lead: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    role: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Employee schema (simplified for demo)
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

async function setupRBACDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Role.deleteMany({});
    await Employee.deleteMany({});
    console.log("Cleared existing data");

    // Create roles with different permission levels
    const roles = [
      {
        roleName: "Admin",
        modulePermissions: {
          employee: { read: true, write: true, delete: true },
          user: { read: true, write: true, delete: true },
          lead: { read: true, write: true, delete: true },
          role: { read: true, write: true, delete: true },
        },
      },
      {
        roleName: "Manager",
        modulePermissions: {
          employee: { read: true, write: true, delete: false },
          user: { read: true, write: true, delete: false },
          lead: { read: true, write: true, delete: true },
          role: { read: true, write: false, delete: false },
        },
      },
      {
        roleName: "Sales Representative",
        modulePermissions: {
          employee: { read: false, write: false, delete: false },
          user: { read: false, write: false, delete: false },
          lead: { read: true, write: true, delete: false },
          role: { read: false, write: false, delete: false },
        },
      },
      {
        roleName: "Viewer",
        modulePermissions: {
          employee: { read: true, write: false, delete: false },
          user: { read: true, write: false, delete: false },
          lead: { read: true, write: false, delete: false },
          role: { read: true, write: false, delete: false },
        },
      },
    ];

    // Insert roles
    const createdRoles = await Role.insertMany(roles);
    console.log(
      "Created roles:",
      createdRoles.map((r) => r.roleName)
    );

    // Create demo users with different roles
    const hashedPassword = await bcrypt.hash("password123", 10);

    const employees = [
      {
        employeeId: "ADMIN001",
        name: "Admin User",
        email: "admin@inrext.com",
        password: hashedPassword,
        role: "Admin",
      },
      {
        employeeId: "MGR001",
        name: "Manager User",
        email: "manager@inrext.com",
        password: hashedPassword,
        role: "Manager",
      },
      {
        employeeId: "SALES001",
        name: "Sales Rep User",
        email: "sales@inrext.com",
        password: hashedPassword,
        role: "Sales Representative",
      },
      {
        employeeId: "VIEW001",
        name: "Viewer User",
        email: "viewer@inrext.com",
        password: hashedPassword,
        role: "Viewer",
      },
    ];

    // Insert employees
    const createdEmployees = await Employee.insertMany(employees);
    console.log(
      "Created employees:",
      createdEmployees.map((e) => e.name)
    );

    console.log("\n=== RBAC Demo Setup Complete ===");
    console.log("Test Users Created:");
    console.log("1. Admin: admin@inrext.com / password123 (Full access)");
    console.log("2. Manager: manager@inrext.com / password123 (Limited admin)");
    console.log(
      "3. Sales Rep: sales@inrext.com / password123 (Lead access only)"
    );
    console.log(
      "4. Viewer: viewer@inrext.com / password123 (Read-only access)"
    );
    console.log(
      "\nYou can now test the RBAC system by logging in with these users."
    );
  } catch (error) {
    console.error("Error setting up RBAC demo:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

setupRBACDemo();
