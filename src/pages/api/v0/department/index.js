import dbConnect from "../../../../lib/mongodb";
import Department from "../../../../models/Department";
import cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

const createDepartment = async (req, res) => {
  try {
    const { name, description, managerId, departmentId } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Department name is required" });
    }

    const newDept = new Department({ name, description, managerId, departmentId });
    await newDept.save();

    return res.status(201).json({ success: true, data: newDept });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllDepartment = async (req,res) => {
  try {
    const departments = await Department.find({ isActive: true }).populate(
      "managerId",
      "name email"
    );
    return res.status(200).json({ success: true, data: departments });
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

  if (req.method === "POST") {
    return createDepartment(req, res);
  }

  if (req.method === "GET") {
    return getAllDepartment(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
