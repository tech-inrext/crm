import dbConnect from "../../../../lib/mongodb";
import Role from "../../../../models/Role";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";

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

// ✅ PATCH (update role permissions and optionally name)
const updateRoleDetails = async (req, res) => {
  const { id } = req.query;
  const updateData = req.body;

  console.log("Role update request:", { id, updateData }); // Debug log

  try {
    // If name is being updated, check if it already exists (but not for the current role)
    if (updateData.name) {
      const existingRole = await Role.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });

      if (existingRole) {
        console.log("Role name conflict:", updateData.name); // Debug log
        return res.status(400).json({
          success: false,
          message: "A role with this name already exists.",
        });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      console.log("Role not found:", id); // Debug log
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    console.log("Role updated successfully:", updatedRole); // Debug log
    return res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE role by ID
const deleteRole = async (req, res) => {
  const { id } = req.query;

  try {
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
      data: role,
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// ✅ Final handler with RBAC
const handler = async (req, res) => {
  await dbConnect();

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // ✅ READ Role
  if (req.method === "GET") {
    return new Promise((resolve, reject) => {
      checkPermission("role", "read")(req, res, (err) => {
        if (err) reject(err);
        else {
          getRoleById(req, res);
          resolve();
        }
      });
    });
  }

  // ✅ UPDATE Role
  if (req.method === "PATCH") {
    return new Promise((resolve, reject) => {
      checkPermission("role", "write")(req, res, (err) => {
        if (err) reject(err);
        else {
          updateRoleDetails(req, res);
          resolve();
        }
      });
    });
  }

  // ✅ DELETE Role
  if (req.method === "DELETE") {
    return new Promise((resolve, reject) => {
      checkPermission("role", "delete")(req, res, (err) => {
        if (err) reject(err);
        else {
          deleteRole(req, res);
          resolve();
        }
      });
    });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

// Export handler with authentication and permission middleware
export default handler;
