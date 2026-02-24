// TeamService.js

import { Service } from "@framework";
import Employee from "../../models/Employee";

class TeamService extends Service {
  constructor() {
    super();
  }

  buildTeamHierarchy(employees, managerId, visited = new Set()) {
    if (visited.has(String(managerId))) return [];
    visited.add(String(managerId));

    return employees
      .filter((emp) => String(emp.managerId) === String(managerId))
      .map((emp) => ({
        _id: emp._id,
        children: this.buildTeamHierarchy(employees, emp._id, new Set(visited)),
      }));
  }

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

  // 🔥 Reusable method
  async getTeamCount(loggedInId) {
    const employees = await Employee.find({}, "_id managerId").lean();

    const teamHierarchy = this.buildTeamHierarchy(employees, loggedInId);

    return this.countTeamMembers(teamHierarchy);
  }
}

export default TeamService;
