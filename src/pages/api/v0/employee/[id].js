import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";

// ✅ GET: Fetch employee by ID
const getEmployeeById = async (req, res) => {
  const { id } = req.query;

  try {
    const employee = await Employee.findById(id).populate("role");

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

// ✅ DELETE: Delete employee by ID
const deleteEmployee = async (req, res) => {
  const { id } = req.query;

  try {
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// ✅ PATCH: Update allowed fields only
const updateEmployeeDetails = async (req, res) => {
  const { id } = req.query;

  const { name, altPhone, address, gender, age, designation, managerId, role } =
    req.body;

  // Fields that are NOT allowed to be updated
  // const notAllowedFields = ["phone", "email", "joiningDate"];

  // const requestFields = Object.keys(req.body);
  // const invalidFields = requestFields.filter((field) =>
  // notAllowedFields.includes(field)
  //);

  // if (invalidFields.length > 0) {
  //   return res.status(400).json({
  //     success: false,
  //     message: `You are not allowed to update these field(s): ${invalidFields.join(
  //       ", "
  //     )}`,
  //   });
  // }

  // Build the update object dynamically
  const updateFields = {
    ...(name && { name }),
    ...(altPhone && { altPhone }),
    ...(address && { address }),
    ...(gender && { gender }),
    ...(age && { age }),
    ...(designation && { designation }),
    ...(managerId && { managerId }),
    ...(role && { role }),
  };

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("role");

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

// ✅ Main Handler with Permission Check
const handler = async (req, res) => {
  await dbConnect();

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method === "GET") {
    // Check read permission for employee module
    return new Promise((resolve, reject) => {
      checkPermission("employee", "read")(req, res, (err) => {
        if (err) reject(err);
        else {
          getEmployeeById(req, res);
          resolve();
        }
      });
    });
  }

  if (req.method === "PATCH") {
    // Check write permission for employee module
    return new Promise((resolve, reject) => {
      checkPermission("employee", "write")(req, res, (err) => {
        if (err) reject(err);
        else {
          updateEmployeeDetails(req, res);
          resolve();
        }
      });
    });
  }

  if (req.method === "DELETE") {
    // Check delete permission for employee module
    return new Promise((resolve, reject) => {
      checkPermission("employee", "delete")(req, res, (err) => {
        if (err) reject(err);
        else {
          deleteEmployee(req, res);
          resolve();
        }
      });
    });
  }

  // Unsupported method
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

// ✅ Export with Auth Middleware
// Export handler directly without authentication middleware for testing
export default handler;
