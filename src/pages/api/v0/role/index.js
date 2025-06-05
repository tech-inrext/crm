import dbConnect from "@/lib/mongodb";
import Role from "@/models/Role";

const createRole = async (req, res) => {
  try {
    const { name, read, write, delete: deleteItems } = req.body;

    const newRole = new Role({ name, read, write, delete: deleteItems });

    await newRole.save();
    return res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    console.error("Role Creation Error:", error.message);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch roles",
        error: error.message,
      });
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    createRole(req, res);
  } else if (req.method === "GET") {
    getAllRoles(req, res);
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
