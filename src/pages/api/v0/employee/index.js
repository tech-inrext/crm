import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role"; // role model
import bcrypt from "bcrypt";
// import cookie from "cookie";
// import { userAuth } from "../../../../middlewares/auth";
// import { checkPermission } from "../../../../utils/checkPermission";

// Create new employee (only if has write access)
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
    } = req.body;
    const dummyPassword = "Inrext@123";
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    console.log("Received employee data:", req.body); // Debug log

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !designation ||
      !managerId ||
      !departmentId ||
      !role
    ) {
      console.log("Missing required fields:", {
        name,
        email,
        phone,
        address,
        designation,
        managerId,
        departmentId,
        role,
      });
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const exists = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Employee already exists" });
    } // Find the role by name and get its ObjectId
    let roleId;
    if (role && typeof role === "string") {
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) {
        // Create default role if not found
        const defaultRole = new Role({ name: role });
        await defaultRole.save();
        roleId = defaultRole._id;
      } else {
        roleId = roleDoc._id;
      }
    } else if (role) {
      roleId = role; // assume it's already an ObjectId
    } else {
      // Create default role if none provided
      const defaultRole = await Role.findOneAndUpdate(
        { name: "Employee" },
        { name: "Employee" },
        { upsert: true, new: true }
      );
      roleId = defaultRole._id;
    }
    const newEmployee = new Employee({
      name,
      email,
      phone,
      password: hashedPassword,
      altPhone: altPhone || "",
      address,
      gender: gender || "Other",
      age: age || undefined,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      designation,
      managerId,
      departmentId,
      role: roleId,
    });

    await newEmployee.save();
    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    console.error("Error creating employee:", error);

    // Handle duplicate key errors (MongoDB E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Employee with this ${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

// Get all employees (only if has read access)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).populate("role", "name");

    // Transform the data to match frontend expectations
    const transformedEmployees = employees.map((emp) => ({
      ...emp.toObject(),
      role: emp.role?.name || emp.role, // Use role name if populated, fallback to original
    }));

    return res.status(200).json({ success: true, data: transformedEmployees });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// Final API handler without authentication (for testing)
const handler = async (req, res) => {
  await dbConnect();

  // Skip authentication for testing
  // const parsedCookies = cookie.parse(req.headers.cookie || "");
  // req.cookies = parsedCookies;

  // await userAuth(req, res, async () => {
  //   const loggedInEmployee = req.employee; // from userAuth middleware

  //   if (!loggedInEmployee) {
  //     return res.status(401).json({ success: false, message: "Unauthorized" });
  //   }

  //   const roleId = loggedInEmployee.role;
  //   let hasAccess = false;

  if (req.method === "GET") {
    // Skip permission check for testing
    // hasAccess = await checkPermission(roleId, "read", "employee");
    // if (!hasAccess) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "You do not have READ access" });
    // }
    return getAllEmployees(req, res);
  }

  if (req.method === "POST") {
    // Skip permission check for testing
    // hasAccess = await checkPermission(roleId, "write", "employee");
    // if (!hasAccess) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "You do not have WRITE access" });
    // }
    return createEmployee(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
  // });
};

export default handler;
