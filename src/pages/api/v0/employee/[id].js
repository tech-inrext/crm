import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role"; // Add Role import
// import cookie from "cookie";
// import { userAuth } from "../../../../middlewares/auth";
// import { checkPermission } from "../../../../utils/checkPermission"; // utility for permission check

// ✅ GET: Fetch employee by ID
const getEmployeeById = async (req, res) => {
  const { id } = req.query;

  try {
    const employee = await Employee.findById(id).populate("role", "name");

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Transform the data to match frontend expectations
    const transformedEmployee = {
      ...employee.toObject(),
      role: employee.role?.name || employee.role,
    };

    return res.status(200).json({
      success: true,
      data: transformedEmployee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// ✅ DELETE: Remove employee by ID
const deleteEmployeeById = async (req, res) => {
  const { id } = req.query;

  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: deletedEmployee,
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
  const notAllowedFields = ["phone", "email", "joiningDate", "departmentId"];

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
  };

  // Handle role conversion from name to ObjectId
  if (role) {
    if (typeof role === "string") {
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        return res.status(400).json({
          success: false,
          message: `Role '${role}' not found`,
        });
      }
      updateFields.role = roleDoc._id;
    } else {
      updateFields.role = role; // assume it's already an ObjectId
    }
  }

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

    // Transform the response to include role name
    const transformedEmployee = {
      ...updatedEmployee.toObject(),
      role: updatedEmployee.role?.name || updatedEmployee.role,
    };

    return res.status(200).json({
      success: true,
      data: transformedEmployee,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ Main Handler without authentication (for testing)
const handler = async (req, res) => {
  await dbConnect();

  // Skip authentication for testing
  // const loggedInUser = req.employee; // set by userAuth middleware
  // const roleId = loggedInUser?.role;

  // if (!loggedInUser || !roleId) {
  //   return res.status(401).json({
  //     success: false,
  //     message: "Unauthorized",
  //   });
  // }

  if (req.method === "GET") {
    // Skip permission check for testing
    // const hasReadAccess = await checkPermission(roleId, "read", "employee");
    // if (!hasReadAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have permission to view employee details",
    //   });
    // }
    return getEmployeeById(req, res);
  }

  if (req.method === "PATCH") {
    // Skip permission check for testing
    // const hasWriteAccess = await checkPermission(roleId, "write", "employee");
    // if (!hasWriteAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have permission to update employee details",
    //   });
    // }
    return updateEmployeeDetails(req, res);
  }

  if (req.method === "DELETE") {
    // Skip permission check for testing
    // const hasDeleteAccess = await checkPermission(roleId, "delete", "employee");
    // if (!hasDeleteAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have permission to delete employee",
    //   });
    // }
    return deleteEmployeeById(req, res);
  }

  // Unsupported method
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

// ✅ Export handler directly without authentication middleware for testing
export default handler;
