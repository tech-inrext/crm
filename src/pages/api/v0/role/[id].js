import dbConnect from "../../../../lib/mongodb";
import Role from "../../../../models/Role";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// ✅ GET role by ID (only if has READ permission)
const getRoleById = async (req, res) => {
  const { id } = req.query;

  try {
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error("Error fetching Role:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error: " + error.message });
  }
};

// ✅ PATCH (update role permissions and special flags)
const updateRoleDetails = async (req, res) => {
  const { id } = req.query;

  // Extract known updatable fields to avoid accidental updates
  const {
    name,
    read: readItems,
    write: writeItems,
    delete: deleteItems,
    isSystemAdmin,
  } = req.body;

  try {
    // Prevent role name update
    if (name) {
      return res.status(400).json({
        success: false,
        message: "Updating role name is not allowed.",
      });
    }

    const setObj = {};
    if (Array.isArray(readItems)) setObj.read = readItems;
    if (Array.isArray(writeItems)) setObj.write = writeItems;
    if (Array.isArray(deleteItems)) setObj.delete = deleteItems;

    if (typeof isSystemAdmin !== "undefined") {
      // Coerce string values to boolean too (e.g. 'true'/'false')
      const flag =
        typeof isSystemAdmin === "string"
          ? isSystemAdmin.toLowerCase() === "true"
          : Boolean(isSystemAdmin);
      setObj.isSystemAdmin = flag;
    }

    if (Object.keys(setObj).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: setObj },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Auth wrapper for cookies and token handling
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Final handler with RBAC
const handler = async (req, res) => {
  await dbConnect();

  // ✅ READ Role
  if (req.method === "GET") {
    return getRoleById(req, res);
  }

  // ✅ UPDATE Role
  if (req.method === "PATCH") {
    return updateRoleDetails(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
