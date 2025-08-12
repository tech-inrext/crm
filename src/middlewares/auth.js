import jwt from "jsonwebtoken";
import Role from "../models/Role"
import Employee from "../models/Employee";
import dbConnect from "../lib/mongodb";
import { checkPermission } from "../utils/checkPermission";

const MODULES = ["lead", "employee", "role", "department", "cab-booking"];

export async function userAuth (req, res, next){
  res.locals = res.locals || {};
  try {
    await dbConnect();
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Token is not valid");
    }

    const decodeObj = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, roleId  } = decodeObj;
    // console.log("hello",decodeObj)

     if (!_id || !roleId) {
      return res.status(401).json({ message: "Unauthorized: Role not selected" });
    }

    const employee = await Employee.findById(_id);
    if (!employee) {
      throw new Error("Employee not found");
    }
  // Set isManager if this user manages at least one employee
  const managedEmployees = await Employee.find({ managerId: String(_id) }).select('_id name managerId');
  const isManager = managedEmployees.length > 0;
  const employeeObj = employee.toObject ? employee.toObject() : { ...employee };
  employeeObj.isManager = isManager;
  req.employee = employeeObj;
  req.isManager = isManager;
  res.locals.isManager = isManager;

     const role = await Role.findById(roleId);
    if (!role) {
      return res.status(403).json({ message: "Invalid role" });
    }

    // 🔍 Determine moduleName from URL
    const url = req.url.toLowerCase();
    const moduleName = MODULES.find((mod) => url.includes(mod));
    if (!moduleName) throw new Error("Unknown moduleName in route");

    // ✍️ Determine action from method
    let action = "read";
    if (["POST", "PATCH"].includes(req.method)) action = "write";
    if (req.method === "DELETE") action = "delete";

    // 🛡️ Check permission
    const hasAccess = await checkPermission(roleId, action, moduleName);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied: No ${action.toUpperCase()} access to ${moduleName}`,
      });
    }

    // ✅ Store these if needed in handlers
    req.moduleName = moduleName;
    req.action = action;
    req.employee = employee;
    req.role = role;

    next();
  } catch (err) {
    res.status(400).json({ message: "Auth Error: " + err.message });
  }
};