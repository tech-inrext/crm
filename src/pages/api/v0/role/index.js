import dbConnect from "@/lib/mongodb";
import Role from "@/models/Role";
import cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import { checkPermission } from "@/utils/checkPermission"; // ✅ Reusable permission checker

// ✅ Create a new role (requires WRITE access on "role")
const createRole = async (req, res) => {
  try {
    const { name, read, write, delete: deleteItems } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const newRole = new Role({
      name,
      read,
      write,
      delete: deleteItems,
    });

    await newRole.save();

    return res.status(201).json({
      success: true,
      data: newRole,
    });
  } catch (error) {
    console.error("Role Creation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get all roles (requires READ access on "role")
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

// ✅ Middleware wrapper to check permissions
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;

    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main handler with permission checks
const handler = async (req, res) => {
  await dbConnect();

  const loggedInEmployee = req.employee;
  const roleId = loggedInEmployee?.role;

  if (!loggedInEmployee || !roleId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  // ✅ Handle GET (read permission required)
  if (req.method === "GET") {
    const hasReadAccess = await checkPermission(roleId, "read", "role");
    if (!hasReadAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view roles",
      });
    }
    return getAllRoles(req, res);
  }

  // ✅ Handle POST (write permission required)
  if (req.method === "POST") {
    const hasWriteAccess = await checkPermission(roleId, "write", "role");
    if (!hasWriteAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create roles",
      });
    }
    return createRole(req, res);
  }

  // ✅ Method not supported
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);
