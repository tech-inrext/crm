// /pages/api/employees/login.js
import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// More robust cookie import for deployment
let cookie;
try {
  cookie = require("cookie");
} catch (err) {
  console.error("Failed to import cookie package:", err);
}

export default async function handler(req, res) {
  try {
    await dbConnect();
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "development"
          ? dbError.message
          : "Internal server error",
    });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Environment:", process.env.NODE_ENV);

    const employee = await Employee.findOne({ email });
    console.log("Employee found:", !!employee);

    if (!employee) {
      console.log("Login failed: Employee not found for email:", email);
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, employee.password);
    console.log("Password correct:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      console.log("Login failed: Incorrect password for email:", email);
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!employee.isPasswordReset) {
      console.log("Login failed: Password not reset for email:", email);
      return res.status(403).json({
        success: false,
        message: "Please reset your password before logging in.",
      });
    }

    const now = new Date();
    const resetDueAfter = new Date(employee.passwordLastResetAt);
    resetDueAfter.setMonth(resetDueAfter.getMonth() + 3);

    if (now > resetDueAfter) {
      console.log("Login failed: Password expired for email:", email);
      return res.status(403).json({
        success: false,
        message: "Your password has expired. Please reset it to continue.",
      });
    }

    // ✅ Generate JWT Token
    console.log("Generating JWT token...");
    const token = jwt.sign({ _id: employee._id }, "rahul@123", {
      expiresIn: "7d",
    });
    console.log("JWT token generated successfully");

    // ✅ Set token in HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    };

    // Robust cookie handling for deployment
    let cookieString;
    try {
      if (cookie && cookie.serialize) {
        cookieString = cookie.serialize("token", token, cookieOptions);
        console.log("Cookie serialized using cookie package");
      } else {
        // Fallback manual cookie string creation
        const secureFlag = cookieOptions.secure ? "; Secure" : "";
        const sameSiteFlag = `; SameSite=${cookieOptions.sameSite}`;
        cookieString = `token=${token}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}; HttpOnly${secureFlag}${sameSiteFlag}`;
        console.log("Cookie created manually (fallback)");
      }
      res.setHeader("Set-Cookie", cookieString);
      console.log("Cookie header set successfully");
    } catch (cookieError) {
      console.error("Cookie serialization error:", cookieError);
      // Fallback: set a simple cookie
      res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly`);
      console.log("Using simple cookie fallback");
    }

    // Safely handle roles
    let userRoles = [];
    let currentRole = null;

    try {
      // Handle different role formats safely
      if (
        employee.roles &&
        Array.isArray(employee.roles) &&
        employee.roles.length > 0
      ) {
        userRoles = employee.roles.map((role) => {
          if (typeof role === "string") return role;
          if (role && role.name) return role.name;
          return String(role);
        });
      } else if (employee.role) {
        const roleStr =
          typeof employee.role === "string"
            ? employee.role
            : employee.role.name || String(employee.role);
        userRoles = [roleStr];
      }

      if (employee.currentRole) {
        currentRole =
          typeof employee.currentRole === "string"
            ? employee.currentRole
            : employee.currentRole.name || String(employee.currentRole);
      } else {
        currentRole = userRoles[0] || null;
      }

      console.log("Roles processed successfully:", { userRoles, currentRole });
    } catch (roleError) {
      console.error("Error processing roles:", roleError);
      userRoles = ["USER"]; // Fallback role
      currentRole = "USER";
    }

    console.log("=== LOGIN SUCCESS ===");
    console.log("User roles:", userRoles);
    console.log("Current role:", currentRole);

    // Create safe employee object for response
    const safeEmployee = {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      designation: employee.designation,
      isPasswordReset: employee.isPasswordReset,
      roles: userRoles,
      currentRole: currentRole,
      hasMultipleRoles: userRoles.length > 1,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      employee: safeEmployee,
    });
  } catch (err) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error details:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Login failed",
    });
  }
}
