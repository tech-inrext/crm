import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import { sendViaGupshup } from "../../../../lib/gupshupService"; // direct send without worker

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { mobile } = req.body;

  // Basic mobile number validation (adjust for your country code)
  const mobileRegex = /^[0-9]{10,15}$/;
  const isValid = mobileRegex.test(mobile);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile number. Please enter a valid mobile.",
    });
  }

  const employee = await Employee.findOne({ mobile });
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: "This mobile number is not registered.",
    });
  }

  // Generate OTP & expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  employee.resetOTP = otp;
  employee.resetOTPExpires = expiry;
  await employee.save();

  try {
    // Send OTP via WhatsApp
    await sendViaGupshup({
      to: mobile, // with country code, e.g. "91XXXXXXXXXX"
      templateName: "otp_template", // change to your approved template
      parameters: [otp],
    });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to WhatsApp" });
  } catch (error) {
    console.error("❌ Failed to send WhatsApp OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP on WhatsApp",
    });
  }
}
