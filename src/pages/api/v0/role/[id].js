// get method
// post method
// patch method

import dbConnect from "../../../../lib/mongodb";
import Role from "../../../../models/Role";

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

const updateRoleDetails = async (req, res) => {
  const { id } = req.query;
  const { name, ...rest } = req.body;
  try {
    // Prevent changing the 'name' field
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

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    getRoleById(req, res);
  } else if (req.method === "PATCH") {
    updateRoleDetails(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }
}
