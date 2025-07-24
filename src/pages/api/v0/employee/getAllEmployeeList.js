import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
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
const getAllEmployeeList = async (req, res) => {
  try {
    await dbConnect(); // Ensure DB connection

    const employees = await Employee.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
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
export default withAuth(getAllEmployeeList);
