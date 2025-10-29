import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import bcrypt from "bcrypt";

function isPasswordStrong(password) {
  return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password); // at least 8 chars, mix of letters & numbers
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { email, otp, newPassword, confirmPassword } = req.body;

  if (!email || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  if (!isPasswordStrong(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters with letters and numbers",
    });
  }

  const employee = await Employee.findOne({ email });

  if (
    !employee ||
    employee.resetOTP !== otp ||
    Date.now() > employee.resetOTPExpires
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Use an atomic update to avoid triggering full document validation
    // (some legacy documents may be missing required fields like employeeProfileId)
    const result = await Employee.updateOne(
      { _id: employee._id },
      {
        $set: {
          password: hashedPassword,
          isPasswordReset: true,
          passwordLastResetAt: new Date(),
        },
        $unset: { resetOTP: "", resetOTPExpires: "" },
      }
    );

    if (!result || result.matchedCount === 0) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update password" });
    }
  } catch (err) {
    console.error("Error updating password:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
}
