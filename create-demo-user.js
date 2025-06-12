// Create a demo user for testing login
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGODB_URI = process.env.MONGODB_URI;

// Employee schema
const employeeSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    password: String,
    address: String,
    designation: String,
    managerId: String,
    departmentId: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    isPasswordReset: { type: Boolean, default: true },
    passwordLastResetAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Role schema
const roleSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
const Role = mongoose.model("Role", roleSchema);

async function createDemoUser() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create demo role if not exists
    let demoRole = await Role.findOne({ name: "Admin" });
    if (!demoRole) {
      demoRole = new Role({ name: "Admin" });
      await demoRole.save();
      console.log("✅ Created demo role: Admin");
    } // Check if demo user exists
    const existingUser = await Employee.findOne({ email: "demo@example.com" });
    if (existingUser) {
      console.log("✅ Demo user found. Updating password...");

      // Update password to demo1234
      const newHashedPassword = await bcrypt.hash("demo1234", 10);
      existingUser.password = newHashedPassword;
      await existingUser.save();

      console.log("✅ Demo user password updated:");
      console.log("   Email: demo@example.com");
      console.log("   Password: demo1234");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("demo1234", 10);

    // Create demo user
    const demoUser = new Employee({
      name: "Demo User",
      email: "demo@example.com",
      phone: "1234567890",
      password: hashedPassword,
      address: "Demo Address",
      designation: "Demo Manager",
      managerId: "demo-manager",
      departmentId: "demo-dept",
      role: demoRole._id,
      isPasswordReset: true,
      passwordLastResetAt: new Date(),
    });

    await demoUser.save();
    console.log("✅ Demo user created successfully!");
    console.log("   Email: demo@example.com");
    console.log("   Password: demo123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating demo user:", error.message);
    process.exit(1);
  }
}

createDemoUser();
