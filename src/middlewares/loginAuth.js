import jwt from "jsonwebtoken";
import Employee from "../models/Employee";
import dbConnect from "../lib/mongodb";

export async function loginAuth (req, res, next){
  try {
    await dbConnect();
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Token is not valid");
    }

    const decodeObj = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodeObj;

    const employee = await Employee.findById(_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    req.employee = employee;

    // // 🔍 Determine moduleName from URL
    // const url = req.url.toLowerCase();
    // const moduleName = MODULES.find((mod) => url.includes(mod));
    // if (!moduleName) throw new Error("Unknown moduleName in route");

    // // ✍️ Determine action from method
    // let action = "read";
    // if (["POST", "PATCH"].includes(req.method)) action = "write";
    // if (req.method === "DELETE") action = "delete";

    // // 🛡️ Check permission
    // const roleId = employee.role;
    // const hasAccess = await checkPermission(roleId, action, moduleName);

    // if (!hasAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Access denied: No ${action.toUpperCase()} access to ${moduleName}`,
    //   });
    // }

    // // ✅ Store these if needed in handlers
    // req.moduleName = moduleName;
    // req.action = action;

    next();
  } catch (err) {
    res.status(400).json({ message: "Auth Error: " + err.message });
  }
};