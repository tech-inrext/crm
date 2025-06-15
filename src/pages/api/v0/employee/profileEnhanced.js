// Enhanced authentication check endpoint that works with multiple auth methods
import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import allowCors from "../../../../middlewares/cors";

async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    let token = null;

    // Try multiple methods to get the token
    console.log("=== AUTH CHECK DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Raw Cookie Header:", req.headers.cookie);

    // Method 1: Check HTTP-only cookies
    if (req.headers.cookie) {
      const parsedCookies = cookie.parse(req.headers.cookie);
      console.log("Parsed cookies:", parsedCookies);
      token = parsedCookies.token;
      if (token) {
        console.log("✅ Token found in HTTP-only cookie");
      }
    }

    // Method 2: Check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("✅ Token found in Authorization header");
      }
    }

    // Method 3: Check custom header (fallback for development)
    if (!token && req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
      console.log("✅ Token found in custom header");
    }

    if (!token) {
      console.log("❌ No token found in any method");
      return res.status(401).json({
        success: false,
        message: "No authentication token found",
        debug: {
          cookieHeader: req.headers.cookie,
          authHeader: req.headers.authorization,
          customHeader: req.headers["x-auth-token"],
        },
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, "rahul@123");
    console.log("✅ Token verified:", decoded);

    // Get user from database with populated role
    const user = await Employee.findById(decoded._id).populate("role");
    if (!user) {
      console.log("❌ User not found in database");
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    console.log("✅ User found:", user.name, user.email);

    // Return user profile
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name || "No Role",
        gender: user.gender,
        address: user.address,
        designation: user.designation,
        departmentId: user.departmentId,
        managerId: user.managerId,
        joiningDate: user.joiningDate,
      },
    });
  } catch (error) {
    console.log("❌ Auth check error:", error.message);
    res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
}

export default allowCors(handler);
