
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { userAuth } from "@/middlewares/auth";

// Recursive function to build hierarchy for a given managerId (excluding the manager node itself)
const buildTeamHierarchy = (employees, managerId, visited = new Set()) => {
  if (visited.has(String(managerId))) return [];
  visited.add(String(managerId));
  return employees
    .filter(
      (emp) => String(emp.managerId) === String(managerId) && String(emp._id) !== String(managerId)
    )
    .map((emp) => ({
      _id: emp._id,
      name: emp.name,
      designation: emp.designation,
      branch: emp.branch,
      managerId: emp.managerId,
      employeeProfileId: emp.employeeProfileId,
      children: buildTeamHierarchy(employees, emp._id, new Set(visited)),
    }));
};

// Recursive function to count all users in the hierarchy
const countTeamMembers = (team) => {
  if (!Array.isArray(team)) return 0;
  let count = 0;
  for (const member of team) {
    count += 1; // count this member
    if (member.children && member.children.length > 0) {
      count += countTeamMembers(member.children);
    }
  }
  return count;
};

async function handler(req, res) {
  await dbConnect();
  try {
    // Get logged-in user's ID
    const loggedInUserId = req.employee?._id;
    if (!loggedInUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch all employees
    const employees = await Employee.find({}).lean();

    // Build the team hierarchy under the logged-in manager (excluding the manager node itself)
    const teamHierarchy = buildTeamHierarchy(employees, loggedInUserId);
    const teamCount = countTeamMembers(teamHierarchy);

    return res.status(200).json({ success: true, team: teamHierarchy, count: teamCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
