import dbConnect from "../../../../lib/mongodb";
import Role from "../../../../models/Role";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// ✅ Middleware Wrapper for Authentication
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ GET All Leads Without Pagination
const getAllRoleList = async (req, res) => {
  try {
    await dbConnect(); // Ensure DB connection

    const roles = await Role.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all leads",
      error: error.message,
    });
  }
};

// ✅ Exported handler with authentication
export default withAuth(getAllRoleList);
