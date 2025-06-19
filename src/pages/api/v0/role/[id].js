import dbConnect from "../../../../lib/mongodb";
import Role from "../../../../models/Role";
import cookie from "cookie";
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

// ✅ PATCH (update role permissions, not name)
const updateRoleDetails = async (req, res) => {
  const { id } = req.query;
  const { name, ...rest } = req.body;

  try {
    // Prevent role name update
    if (name) {
      return res.status(400).json({
        success: false,
        message: "Updating role name is not allowed.",
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    return res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
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