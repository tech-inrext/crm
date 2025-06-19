import dbConnect from "../../../../lib/mongodb";
import Department from "../../../../models/Department";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

const updateDepartmentDetails = async (req, res) => {
  const { id } = req.query;
  try {
    const update = req.body;
    const updated = await Department.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  const { id } = req.query;
  try {
    const deleted = await Department.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Department deactivated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  const { id } = req.query;
  try {
    const department = await Department.findById(id).populate(
      "managerId",
      "name email"
    );

    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Authenticate first
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "PATCH") {
    return updateDepartmentDetails(req, res);
  }

  if (req.method === "DELETE") {
    return deleteDepartment(req, res);
  }
  if (req.method === "GET") {
    return getDepartmentById(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
