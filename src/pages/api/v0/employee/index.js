import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role"; // role model
import bcrypt from "bcrypt";
import cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";


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
    } = req.body;

    const dummyPassword = "Inrext@123";
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    // 🔍 Field validation
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

    // 🚫 Check duplicate email/phone
    const exists = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Employee already exists" });
    }

    // ✅ Create new employee
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

    return res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
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

// ✅ Middleware Wrapper
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main Handler
const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getAllEmployees(req, res);
  }

  if (req.method === "POST") {
    return createEmployee(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);

