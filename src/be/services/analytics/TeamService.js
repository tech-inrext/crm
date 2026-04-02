import { Service } from "@framework";
import Employee from "../../models/Employee";

class TeamService extends Service {
  constructor() {
    super();
  }

  // ---------------- CHECK TEAM MEMBER ----------------
  async isTeamMember(employeeId) {
    try {
      if (!employeeId) return false;

      const employee = await Employee.findById(employeeId)
        .select("_id managerId")
        .lean();

      if (!employee) return false;

      // if employee has manager → team member
      if (employee.managerId) return true;

      // if employee has subordinates → manager
      const subordinates = await Employee.countDocuments({
        managerId: employeeId,
      });

      return subordinates > 0;
    } catch (error) {
      console.error("isTeamMember error:", error);
      return false;
    }
  }

  // ---------------- GET MY TEAM MEMBERS ----------------
  async getMyTeamMembers(employeeId) {
    try {
      if (!employeeId) return [];

      const members = await Employee.find({
        managerId: employeeId,
      })
        .select("_id")
        .lean();

      return members.map((m) => m._id);
    } catch (error) {
      console.error("getMyTeamMembers error:", error);
      return [];
    }
  }

  // ---------------- GET MY MANAGER ----------------
  async getMyManager(employeeId) {
    try {
      if (!employeeId) return null;

      const employee = await Employee.findById(employeeId)
        .select("managerId")
        .lean();

      return employee?.managerId || null;
    } catch (error) {
      console.error("getMyManager error:", error);
      return null;
    }
  }
}

export default TeamService;