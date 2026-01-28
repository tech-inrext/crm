import { Service } from "@framework";
import Employee from "../../models/Employee";

class TeamService extends Service {
  constructor() {
    super();
  }

  // 🔹 Recursive hierarchy builder
  buildTeamHierarchy(employees, managerId, visited = new Set()) {
    if (visited.has(String(managerId))) return [];
    visited.add(String(managerId));

    return employees
      .filter(
        (emp) =>
          String(emp.managerId) === String(managerId) &&
          String(emp._id) !== String(managerId)
      )
      .map((emp) => ({
        _id: emp._id,
        name: emp.name,
        designation: emp.designation,
        branch: emp.branch,
        managerId: emp.managerId,
        employeeProfileId: emp.employeeProfileId,
        children: this.buildTeamHierarchy(
          employees,
          emp._id,
          new Set(visited)
        ),
      }));
  }

  // 🔹 Count all members recursively
  countTeamMembers(team) {
    if (!Array.isArray(team)) return 0;

    let count = 0;
    for (const member of team) {
      count += 1;
      if (member.children?.length) {
        count += this.countTeamMembers(member.children);
      }
    }
    return count;
  }

  // 🔹 Main API method
  async getMyTeam(req, res) {
    try {
      const loggedInId =
        req.employee?._id?.toString?.() ||
        req.user?._id?.toString?.();

      if (!loggedInId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const employees = await Employee.find({}).lean();

      const teamHierarchy = this.buildTeamHierarchy(
        employees,
        loggedInId
      );

      const teamCount = this.countTeamMembers(teamHierarchy);

      return res.status(200).json({
        success: true,
        team: teamHierarchy,
        count: teamCount,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch team",
        error: err.message,
      });
    }
  }
}

export default TeamService;
