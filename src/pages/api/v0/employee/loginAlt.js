// Alternative login endpoint using localStorage approach for testing
import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email }).populate("role");
    console.log("Employee found:", employee);

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
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ _id: employee._id }, "rahul@123", {
      expiresIn: "7d",
    });

    console.log("=== LOGIN SUCCESS (LOCALSTORAGE MODE) ===");
    console.log("Generated token:", token);
    console.log("Employee role:", employee.role);

    // Return user data with token (for localStorage approach)
    res.status(200).json({
      success: true,
      message: "Login successful",
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role?.name || "No Role",
        designation: employee.designation,
        address: employee.address,
      },
      token: token, // Include token in response for localStorage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Error : ${err.message}` });
  }
}
