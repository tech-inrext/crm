import dbConnect from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Employee from "../../../../models/Employee";
import  {loginAuth}  from "../../../../middlewares/loginAuth";

export default async function handler(req, res) {
  await dbConnect();

  // ✅ Apply loginAuth middleware
  await loginAuth(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
      const employeeId = req.employee._id; // ✅ From loginAuth middleware

      // Get selected roleId from body
      const { roleId } = req.body;
      if (!roleId) {
        return res.status(400).json({ success: false, message: "Missing roleId in request body" });
      }

      // Find employee and populate roles (assumes multiple roles)
      const employee = await Employee.findById(employeeId).populate("roles"); // Note: 'roles' plural

      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      console.log(employee.roles[1])
      // ✅ Check if roleId exists in employee's roles
      const roleExists = employee.roles.some(role => role._id.toString() === roleId);

      if (!roleExists) {
        return res.status(403).json({ success: false, message: "You do not have access to this role" });
      }

      //find selected role
      const selectedRole = employee.roles.find(role => role._id.toString() === roleId)

      // ✅ Create new token with selected role
      const newToken = jwt.sign({ _id: employeeId, roleId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // ✅ Set new token in HttpOnly cookie
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "strict",
          path: "/",
        })
      );

      res.status(200).json({ success: true, message: `Role switched successfully to ${selectedRole.name}`, role:selectedRole });

    } catch (err) {
      res.status(500).json({ success: false, message: "Error: " + err.message });
    }
  });
}
