import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";

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

    console.log("employee created");
    // Basic field validation
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
        .json({ success: false, error: "Missing required fields." });
    }

    // Optional duplicate check
    const exists = await Employee.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res
        .status(409)
        .json({
          success: false,
          error: "Employee already exists with this email or phone.",
        });
    }

    const newUser = new Employee({
      name,
      email,
      phone,
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

    await newUser.save();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Employee creation error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    return res.status(200).json({ success: true, data: employees });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    return createEmployee(req, res);
  } else if (req.method === "GET") {
    return getAllEmployees(req, res);
  } else {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
