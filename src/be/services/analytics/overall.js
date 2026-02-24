import dbConnect from "@/lib/mongodb";
import Employee from "../../models/Employee";
import Lead from "../../models/Lead";
import CabBooking from "../../models/CabBooking";
import TeamService from "./TeamService";

class OverallAnalyticsService {
  constructor() {
    this.teamService = new TeamService();
  }

  //FILTER BUILDERS

  buildLeadFilter(userId) {
    return {
      $or: [{ assignedTo: userId }, { uploadedBy: userId }],
    };
  }

  buildEmployeeFilter(userId) {
    return { managerId: userId };
  }

  //LEAD COUNTS

  countActiveLeads(filter) {
    return Lead.countDocuments({
      ...filter,
      status: { $in: ["in progress", "details shared"] },
    });
  }

  countNewLeads(filter) {
    return Lead.countDocuments({
      ...filter,
      status: "new",
    });
  }

  countSiteVisits(filter) {
    return Lead.countDocuments({
      ...filter,
      status: "site visit",
    });
  }

  // MOU COUNTS

  countMouPending(filter) {
    return Employee.countDocuments({
      ...filter,
      mouStatus: "Pending",
    });
  }

  countMouApproved(filter) {
    return Employee.countDocuments({
      ...filter,
      mouStatus: "Approved",
    });
  }

  // TotalVendors
  async getTotalCabVendors() {
    return Employee.countDocuments({ isCabVendor: true });
  }

  // TotalEarnings
  async getTotalCabEarnings() {
    const result = await CabBooking.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$fare" },
        },
      },
    ]);

    return result.length > 0 ? Number(result[0].totalEarnings.toFixed(2)) : 0;
  }

  async getOverall(req, res) {
    try {
      await dbConnect();

      const userId = req.employee?._id?.toString() || req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const leadFilter = this.buildLeadFilter(userId);
      const employeeFilter = this.buildEmployeeFilter(userId);

      const [
        teamCount,
        activeLeads,
        newLeads,
        siteVisitCount,
        mouPending,
        mouApproved,
        totalCabVendors, // separate
        totalEarnings, // separate
      ] = await Promise.all([
        this.teamService.getTeamCount(userId),
        this.countActiveLeads(leadFilter),
        this.countNewLeads(leadFilter),
        this.countSiteVisits(leadFilter),
        this.countMouPending(employeeFilter),
        this.countMouApproved(employeeFilter),
        this.getTotalCabVendors(),
        this.getTotalCabEarnings(),
      ]);

      return res.status(200).json({
        success: true,
        teamCount,
        activeLeads,
        newLeads,
        siteVisitCount,
        mouPending,
        mouApproved,
        totalCabVendors,
        totalEarnings,
      });
    } catch (error) {
      console.error("Overall Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
      });
    }
  }
}

export default OverallAnalyticsService;
