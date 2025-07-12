import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// ✅ GET: Fetch employee by ID
const getEmployeeById = async (req, res) => {
  const { id } = req.query;

  try {
    const employee = await Employee.findById(id).populate("roles");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// ✅ PATCH: Update allowed fields only
const updateEmployeeDetails = async (req, res) => {
  const { id } = req.query;

  // FIX: Destructure roles from req.body
  const {
    name,
    altPhone,
    address,
    gender,
    age,
    designation,
    managerId,
    departmentId,
    role,
    roles,
  } = req.body;

  // Fields that are NOT allowed to be updated
  const notAllowedFields = ["phone", "email", "joiningDate"];

  const requestFields = Object.keys(req.body);
  const invalidFields = requestFields.filter((field) =>
    notAllowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `You are not allowed to update these field(s): ${invalidFields.join(
        ", "
      )}`,
    });
  }

  // Build the update object dynamically
  const updateFields = {
    ...(name && { name }),
    ...(altPhone && { altPhone }),
    ...(address && { address }),
    ...(gender && { gender }),
    ...(age && { age }),
    ...(designation && { designation }),
    ...(managerId && { managerId }),
    ...(departmentId && { departmentId }),
    ...(Array.isArray(roles) && roles.length > 0 && { roles }),
  };

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("roles");

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ Auth Wrapper
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main Handler with Permission Check
const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getEmployeeById(req, res);
  }

  if (req.method === "PATCH") {
    return updateEmployeeDetails(req, res);
  }

  // Unsupported method
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

// ✅ Export with Auth Middleware
export default withAuth(handler);
