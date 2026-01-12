
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { userAuth } from "@/middlewares/auth";


// Efficiently count all team members under a managerId using a queue (BFS)
const countTeamMembersBFS = (employees, managerId) => {
  let count = 0;
  const queue = employees.filter(
    (emp) => String(emp.managerId) === String(managerId) && String(emp._id) !== String(managerId)
  ).map(emp => emp._id);
  const visited = new Set();
  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(String(currentId))) continue;
    visited.add(String(currentId));
    count++;
    // Add direct reports to the queue
    for (const emp of employees) {
      if (String(emp.managerId) === String(currentId) && String(emp._id) !== String(currentId)) {
        queue.push(emp._id);
      }
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

    // Only return the count of team members under the logged-in manager
    const teamCount = countTeamMembersBFS(employees, loggedInUserId);
    return res.status(200).json({ success: true, count: teamCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
