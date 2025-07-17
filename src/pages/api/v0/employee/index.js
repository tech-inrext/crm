import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import Role from "../../../../models/Role"; // role model
import bcrypt from "bcrypt";
import * as cookie from "cookie";
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
      roles,
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
      !roles
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
      roles,
    });

    await newEmployee.save();

    return res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error creating employee",
      error: error.message,
    });
  }
};

// ✅ Get all employees (READ Access Required)
// const getAllEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find({});
//     return res.status(200).json({ success: true, data: employees });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch employees",
//       error: error.message,
//     });
//   }
// };

const getAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Optional search filter
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [employees, totalEmployees] = await Promise.all([
      Employee.find(query)
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 }),
      Employee.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        totalItems: totalEmployees,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalEmployees / itemsPerPage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Employee",
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
