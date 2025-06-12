import dbConnect from "../../../../lib/mongodb";
import Role from "../../../../models/Role";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";

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

// ✅ Main handler with permission checks
const handler = async (req, res) => {
  await dbConnect();

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // ✅ Handle GET (read permission required)
  if (req.method === "GET") {
    return new Promise((resolve, reject) => {
      checkPermission("role", "read")(req, res, (err) => {
        if (err) reject(err);
        else {
          getAllRoles(req, res);
          resolve();
        }
      });
    });
  }

  // ✅ Handle POST (write permission required)
  if (req.method === "POST") {
    return new Promise((resolve, reject) => {
      checkPermission("role", "write")(req, res, (err) => {
        if (err) reject(err);
        else {
          createRole(req, res);
          resolve();
        }
      });
    });
  }

  // ✅ Method not supported
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

// Export handler with authentication and permission middleware
export default handler;
