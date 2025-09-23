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

    const { isCabVendor } = req.query;

    // Normalize stringy booleans from query (?isCabVendor=true / 1 / yes / y ...)
    const normalizeBool = (v) => {
      if (typeof v === "boolean") return v;
      if (v == null) return undefined;
      const s = String(v).trim().toLowerCase();
      if (["true", "1", "yes", "y"].includes(s)) return true;
      if (["false", "0", "no", "n"].includes(s)) return false;
      return undefined; // ignore invalid values
    };

    const vendorVal = normalizeBool(isCabVendor);

    const filter = {};
    if (typeof vendorVal === "boolean") {
      filter.isCabVendor = vendorVal;
    }

    const employees = await Employee.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
      appliedFilter: {
        isCabVendor: typeof vendorVal === "boolean" ? vendorVal : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// ✅ Exported handler with authentication
export default withAuth(getAllEmployeeList);
