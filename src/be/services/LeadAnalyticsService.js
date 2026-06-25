import { Service } from "@framework";
import FollowUp from "../models/FollowUp";
import Lead from "../models/Lead";
import dbConnect from "../../lib/mongodb";
import mongoose from "mongoose";

class LeadAnalyticsService extends Service {
  async getTodayActivity(req, res) {
    try {
      await dbConnect();
      const employeeId = req.employee?._id;

      if (!employeeId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Today's range
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Find leads assigned to me
      const myLeads = await Lead.find({ assignedTo: employeeId }).select("_id").lean();
      const myLeadIds = myLeads.map((l) => l._id);

      // Find unique lead IDs with follow-ups scheduled for today
      const todayCallBackLeadIds = await FollowUp.distinct("leadId", {
        leadId: { $in: myLeadIds },
        followUpDate: { $gte: startOfToday, $lte: endOfToday },
        followUpType: "call back",
      });

      const todaySiteVisitLeadIds = await FollowUp.distinct("leadId", {
        leadId: { $in: myLeadIds },
        followUpDate: { $gte: startOfToday, $lte: endOfToday },
        followUpType: "site visit",
      });

      // Find unique lead IDs with overdue follow-ups (past date and still pending)
      const overdueLeadIds = await FollowUp.distinct("leadId", {
        leadId: { $in: myLeadIds },
        followUpDate: { $lt: startOfToday },
        outcome: "pending",
        followUpType: { $in: ["site visit", "call back"] },
      });

      // Lead Status Distribution
      const statusCounts = await Lead.aggregate([
        { $match: { assignedTo: new mongoose.Types.ObjectId(employeeId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const stats = {
        callBackCount: todayCallBackLeadIds.length,
        siteVisitCount: todaySiteVisitLeadIds.length,
        overdueCount: overdueLeadIds.length,
        statusDistribution: statusCounts.reduce((acc, curr) => {
          acc[curr._id || "new"] = curr.count;
          return acc;
        }, {}),
        qualityDistribution: (
          await Lead.aggregate([
            { 
              $match: { 
                assignedTo: new mongoose.Types.ObjectId(employeeId),
                status: { $nin: ["closed", "not interested"] }
              } 
            },
            { $group: { _id: "$leadType", count: { $sum: 1 } } },
          ])
        ).reduce((acc, curr) => {
          acc[curr._id || "unspecified"] = curr.count;
          return acc;
        }, {}),

        // 7-Day Performance Trend
        trendData: await Promise.all(
          [...Array(7)].map(async (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const start = new Date(date.setHours(0, 0, 0, 0));
            const end = new Date(date.setHours(23, 59, 59, 999));

            const [leadsAdded, activities] = await Promise.all([
              Lead.countDocuments({
                assignedTo: employeeId,
                createdAt: { $gte: start, $lte: end },
              }),
              FollowUp.countDocuments({
                leadId: { $in: myLeadIds },
                followUpDate: { $gte: start, $lte: end },
              }),
            ]);

            return {
              date: date.toLocaleDateString("en-US", { weekday: "short" }),
              leads: leadsAdded,
              activity: activities,
            };
          })
        ),
        total: todayCallBackLeadIds.length + todaySiteVisitLeadIds.length + overdueLeadIds.length,
      };

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("[LeadAnalyticsService] Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default LeadAnalyticsService;
