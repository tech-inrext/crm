import jwt from "jsonwebtoken";
import Employee from "../models/Employee";
import dbConnect from "../lib/mongodb";
import { checkPermission } from "../utils/checkPermission";

const MODULES = ["lead", "employee", "role", "department"];

// Simple token verification without permission checking
export async function verifyToken(req, res, next) {
  try {
    await dbConnect();
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required: No token provided",
      });
    }
    const decodeObj = jwt.verify(token, "rahul@123");
    const { _id } = decodeObj;

    const employee = await Employee.findById(_id);
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed: User not found",
      });
    }

    // Set user in request for permission middleware
    req.user = employee;
    next();
  } catch (err) {
    console.log("Auth Error Details:", {
      error: err.message,
      url: req.url,
      method: req.method,
      cookies: req.cookies,
    });
    return res.status(401).json({
      success: false,
      message: "Authentication failed: " + err.message,
    });
  }
}

export async function userAuth(req, res, next) {
  try {
    await dbConnect();
    const { token } = req.cookies;
    // console.log("hello",token)
    // console.log("hellooo",req.cookies)

    if (!token) {
      throw new Error("Token is not valid");
    }
    const decodeObj = jwt.verify(token, "rahul@123");
    const { _id } = decodeObj;
    console.log("hello", decodeObj);

    const employee = await Employee.findById(_id);
    if (!employee) {
      throw new Error("User not found");
    }

    req.employee = employee;

    // 🔍 Determine moduleName from URL
    const url = req.url.toLowerCase();
    const moduleName = MODULES.find((mod) => url.includes(mod));
    if (!moduleName) throw new Error("Unknown moduleName in route");

    // ✍️ Determine action from method
    let action = "read";
    if (["POST", "PATCH"].includes(req.method)) action = "write";
    if (req.method === "DELETE") action = "delete"; // 🛡️ Check permission - use currentRole for multiple roles support
    const roleId = employee.currentRole || employee.role; // Fallback to old role field if currentRole not set
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

    next();
  } catch (err) {
    console.log("Auth Error Details:", {
      error: err.message,
      url: req.url,
      method: req.method,
      cookies: req.cookies,
    });
    res.status(400).json({ message: "Auth Error: " + err.message });
  }
}
