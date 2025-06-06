import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role"; // role model
import bcrypt from "bcrypt";
import cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../utils/checkPermission";

// Create new employee (only if has write access)
const createEmployee = async (req, res) => {
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
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const exists = await Employee.findOne({ $or: [{ email }, { phone }] });
  if (exists) {
    return res
      .status(409)
      .json({ success: false, message: "Employee already exists" });
  }

  const newEmployee = new Employee({
    name,
    email,
    phone,
    password: hashedPassword,
    altPhone,
    address,
    gender,
    age,
    joiningDate: joiningDate ? new Date(joiningDate) : undefined,
    designation,
    managerId,
    departmentId,
    role,
  });

  await newEmployee.save();
  res.status(201).json({ success: true, data: newEmployee });
};

// Get all employees (only if has read access)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    return res.status(200).json({ success: true, data: employees });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// Final API handler with role-based check
const handler = async (req, res) => {
  await dbConnect();

  // Parse cookies and authenticate user
  const parsedCookies = cookie.parse(req.headers.cookie || "");
  req.cookies = parsedCookies;

  await userAuth(req, res, async () => {
    const loggedInEmployee = req.employee; // from userAuth middleware

    if (!loggedInEmployee) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const roleId = loggedInEmployee.role;
    let hasAccess = false;

    if (req.method === "GET") {
      hasAccess = await checkPermission(roleId, "read", "employee");
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "You do not have READ access" });
      }
      return getAllEmployees(req, res);
    }

    if (req.method === "POST") {
      hasAccess = await checkPermission(roleId, "write", "employee");
      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "You do not have WRITE access" });
      }
      return createEmployee(req, res);
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  });
};

export default handler;
