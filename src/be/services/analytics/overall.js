import dbConnect from "@/lib/mongodb";
import Employee from "../../models/Employee";
import Lead from "../../models/Lead";
import CabBooking from "../../models/CabBooking";
import FollowUp from "../../models/FollowUp";
import TeamService from "./TeamService";
import mongoose from "mongoose";

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

  /**
   * Count upcoming site visits based on FollowUp collection
   */
  async countUpcomingSiteVisits(userId) {
    const now = new Date();

    // Build lead filter for user visibility
    const leadFilter = this.buildLeadFilter(userId);
    const visibleLeadIds = await Lead.find(leadFilter, "_id").lean();
    const leadIdArray = visibleLeadIds.map((l) => l._id);

    // Count distinct leadIds in FollowUp for site visits
    const upcomingSiteVisitLeadIds = await FollowUp.distinct("leadId", {
      followUpType: "site visit",
      followUpDate: { $gte: now },
      leadId: { $in: leadIdArray }, // respect user visibility
    });

    return upcomingSiteVisitLeadIds.length;
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

  // Total Vendors
  async getTotalCabVendors() {
    return Employee.countDocuments({ isCabVendor: true });
  }

  // Total Earnings
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

  // OVERALL ANALYTICS
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

      // Parallel execution
      const [
        teamCount,
        activeLeads,
        newLeads,
        upcomingSiteVisitCount,
        mouPending,
        mouApproved,
        totalCabVendors,
        totalEarnings,
      ] = await Promise.all([
        this.teamService.getTeamCount(userId),
        this.countActiveLeads(leadFilter),
        this.countNewLeads(leadFilter),
        this.countUpcomingSiteVisits(userId),
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
        siteVisitCount: upcomingSiteVisitCount, // updated
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
