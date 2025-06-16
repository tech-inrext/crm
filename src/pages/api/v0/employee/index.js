import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role"; // role model
import bcrypt from "bcrypt";
import { checkPermission } from "../../../../middlewares/permissions";
import { verifyToken } from "../../../../middlewares/auth";

// ✅ Create new employee (WRITE Access Required)
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      gender,
      age,
      altPhone,
      joiningDate,
      designation,
      managerId,
      departmentId,
      role,
      roles,
      currentRole,
    } = req.body;

    const dummyPassword = "Inrext@123";
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    // 🔍 Field validation
    // if (
    //   !name ||
    //   !email ||
    //   !phone ||
    //   !address ||
    //   !designation ||
    //   !managerId ||
    //   !departmentId ||
    //   !role
    // ) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Missing required fields" });
    // }    // 🚫 Check duplicate email/phone
    const exists = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Employee already exists" });
    } // 🔍 Validate roles exist
    const rolesToValidate = roles && roles.length > 0 ? roles : [role];
    if (rolesToValidate.length > 0) {
      for (const roleName of rolesToValidate) {
        if (roleName) {
          const foundRole = await Role.findOne({ name: roleName });
          if (!foundRole) {
            return res
              .status(400)
              .json({
                success: false,
                message: `Role '${roleName}' not found`,
              });
          }
        }
      }
    } // ✅ Create new employee
    const newEmployee = new Employee({
      name,
      email,
      phone,
      password: hashedPassword,
      altPhone: altPhone || undefined,
      address,
      gender: gender || undefined,
      age: age || undefined,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      designation,
      managerId: managerId && managerId.trim() ? managerId : undefined,
      departmentId:
        departmentId && departmentId.trim() ? departmentId : undefined,
      role,
      roles: roles && roles.length > 0 ? roles : [role],
      currentRole: currentRole || (roles && roles.length > 0 ? roles[0] : role),
    });

    await newEmployee.save();

    return res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// ✅ Get all employees (READ Access Required)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    return res.status(200).json({ success: true, data: employees });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// ✅ Main Handler with permission checks
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
          getAllEmployees(req, res);
          resolve();
        }
      });
    });
  }

  if (req.method === "POST") {
    // Check write permission for employee module
    return new Promise((resolve, reject) => {
      checkPermission("employee", "write")(req, res, (err) => {
        if (err) reject(err);
        else {
          createEmployee(req, res);
          resolve();
        }
      });
    });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

// Export handler with authentication and permission middleware
export default handler;
