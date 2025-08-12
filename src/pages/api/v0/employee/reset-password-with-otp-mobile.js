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

  const { mobile, otp, newPassword, confirmPassword } = req.body;

  if (!mobile || !otp || !newPassword || !confirmPassword) {
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

  const employee = await Employee.findOne({ mobile });

  if (
    !employee ||
    employee.resetOTP !== otp ||
    Date.now() > employee.resetOTPExpires
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }

  // Hash & update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  employee.password = hashedPassword;
  employee.resetOTP = undefined;
  employee.resetOTPExpires = undefined;
  employee.passwordLastResetAt = new Date();
  await employee.save();

  return res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
}
