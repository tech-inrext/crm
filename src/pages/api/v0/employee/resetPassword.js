import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { newPassword, email, oldPassword } = req.body;

  if (!email || !newPassword || !oldPassword) {
    return res.status(400).json({
      success: false,
      message: "Email and new password are required",
    });
  }

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Email or Old Password" });
    }

    const isMatch = await bcrypt.compare(oldPassword, employee.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Email or Old Password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    employee.password = hashedPassword;
    employee.isPasswordReset = true;
    employee.passwordLastResetAt = new Date(); // ✅ for 3-month expiry tracking

    await employee.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
