import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import { leadQueue } from "../../../../queue/leadQueue.js";

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
    }

    const { email } = req.body || {};

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address. Please enter a valid email ID.",
      });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "This email is not registered." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    employee.resetOTP = otp;
    employee.resetOTPExpires = expiry;
    await employee.save();

    try {
      await leadQueue.add("sendOTPJob", { email, otp });
      return res
        .status(200)
        .json({ success: true, message: "OTP is being sent to email" });
    } catch (error) {
      console.error("❌ Queueing OTP job failed:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to queue OTP email" });
    }
  } catch (err) {
    // Catch any unexpected errors and ensure we always return JSON
    console.error("❌ Unhandled error in request-otp:", err);
    try {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    } catch (e) {
      // If even sending JSON fails, fall back to plain text with proper header
      res.setHeader("Content-Type", "text/plain");
      return res.status(500).send("Internal Server Error");
    }
  }
}
