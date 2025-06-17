// /pages/api/employees/login.js
import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    console.log(employee);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Credentials." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, employee.password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!employee.isPasswordReset) {
      return res.status(403).json({
        success: false,
        message: "Please reset your password before logging in.",
      });
    }

    const now = new Date();
    const resetDueAfter = new Date(employee.passwordLastResetAt);
    resetDueAfter.setMonth(resetDueAfter.getMonth() + 3);

    if (now > resetDueAfter) {
      return res.status(403).json({
        success: false,
        message: "Your password has expired. Please reset it to continue.",
      });
    } // ✅ Generate JWT Token
    const token = jwt.sign({ _id: employee._id }, "rahul@123", {
      expiresIn: "7d",
    });

    // ✅ Set token in HTTP-only cookie with development-friendly settings
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false for development over HTTP
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax", // More permissive than "strict" for development
      path: "/",
    };

    const cookieString = cookie.serialize("token", token, cookieOptions);
    res.setHeader("Set-Cookie", cookieString);

    console.log("=== LOGIN DEBUG ===");
    console.log("Generated token:", token);
    console.log("Cookie options:", cookieOptions);
    console.log("Cookie string:", cookieString);
    console.log("Environment:", process.env.NODE_ENV); // Determine available roles and current role
    const userRoles =
      employee.roles && employee.roles.length > 0
        ? employee.roles
        : [employee.role];
    const currentRole = employee.currentRole || employee.role;

    res.status(200).json({
      success: true,
      message: "Login successful",
      employee: {
        ...employee.toObject(),
        roles: userRoles,
        currentRole: currentRole,
        hasMultipleRoles: userRoles.length > 1,
      },
      debug: {
        tokenGenerated: !!token,
        cookieSet: !!cookieString,
        environment: process.env.NODE_ENV || "development",
        cookieHeader: cookieString,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Error : ${err.message}` });
  }
}
