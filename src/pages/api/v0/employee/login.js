// /pages/api/employees/login.js
import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
  console.log("🔌 Login API called");

  try {
    await dbConnect();
    console.log("✅ MongoDB connected in login API");
  } catch (error) {
    console.error("❌ MongoDB connection failed in login API:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }

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
    } // ✅ Generate JWT Token with very short expiration for immediate logout
    const token = jwt.sign({ _id: employee._id }, "rahul@123", {
      expiresIn: "15m", // 15 minutes only
    });

    // ✅ Set token in HTTP-only cookie with short expiration
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60, // 15 minutes
        sameSite: "strict",
        path: "/",
      })
    );

    console.log(token);
    res
      .status(200)
      .json({ success: true, message: "Login successful", employee });
  } catch (err) {
    res.status(500).json({ success: false, message: `Error : ${err.message}` });
  }
}
