// Test login API directly
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

async function testLogin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find demo user
    const user = await Employee.findOne({ email: "demo@example.com" }).populate(
      "role"
    );
    if (!user) {
      console.log("❌ Demo user not found");
      process.exit(1);
    }

    console.log("✅ Demo user found:");
    console.log("   Name:", user.name);
    console.log("   Email:", user.email);
    console.log("   isPasswordReset:", user.isPasswordReset);

    // Test password
    const isPasswordCorrect = await bcrypt.compare("demo123", user.password);
    console.log("   Password test:", isPasswordCorrect ? "✅ PASS" : "❌ FAIL");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testLogin();
