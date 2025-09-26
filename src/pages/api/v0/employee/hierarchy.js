import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// 🔹 Recursive function to build hierarchy starting from a manager (including the manager)
const buildHierarchy = (employees, managerId) => {
  const tree = [];
  employees
    .filter((emp) => String(emp.managerId) === String(managerId)) // Find employees reporting to the manager
    .forEach((emp) => {
      const children = buildHierarchy(employees, emp._id); // Recursively find employees under each employee
      tree.push({
        _id: emp._id,
        name: emp.name,
        designation: emp.designation,
        branch: emp.branch,
        managerId: emp.managerId,
        employeeProfileId: emp.employeeProfileId,
        children: children.length ? children : [], // If no subordinates, return empty array
      });
    });
  return tree;
};

// 🔹 Handler for getting the hierarchy (including the manager)
const getHierarchyByManager = async (req, res) => {
  await dbConnect();

  try {
    const { managerId } = req.query; // Get managerId from the query params

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "Manager ID is required as query parameter",
      });
    }

    // Fetch all employees
    const employees = await Employee.find({}).lean();

    // Fetch the manager details
    const manager = employees.find(
      (emp) => String(emp._id) === String(managerId)
    );

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Build hierarchy starting from the manager themselves
    const hierarchy = {
      _id: manager._id,
      name: manager.name,
      designation: manager.designation,
      branch: manager.branch,
      managerId: manager.managerId,
      employeeProfileId: manager.employeeProfileId,
      children: buildHierarchy(employees, manager._id), // Recursively find subordinates
    };

    return res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (err) {
    console.error("Hierarchy Fetch Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hierarchy",
      error: err.message,
    });
  }
};

// 🔹 Middleware wrapper for authentication
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;

    await userAuth(req, res, () => handler(req, res));
  };
}

// 🔹 Main handler
const handler = async (req, res) => {
  if (req.method === "GET") return getHierarchyByManager(req, res);

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
