import { Service } from "@framework";
import BookingLogin from "../models/BookingLogin";
import Lead from "../models/Lead";
import Employee from "../models/Employee";
import dbConnect from "../../lib/mongodb";
import mongoose from "mongoose";

class UserAnalyticsService extends Service {
  async getUserActivity(req, res) {
    try {
      await dbConnect();
      const employeeId = req.employee?._id;

      if (!employeeId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Find employees reporting to this user
      const teamMembers = await Employee.find({ managerId: String(employeeId) }).select("_id mouStatus").lean();
      const teamIds = teamMembers.map(member => new mongoose.Types.ObjectId(member._id));
      const targetIds = [new mongoose.Types.ObjectId(employeeId), ...teamIds];

      // 1. Employee MOU Status Distribution (Under Me)
      const mouDistribution = {
        pending: 0,
        approved: 0,
        rejected: 0
      };

      teamMembers.forEach((member) => {
        if (!member.mouStatus) return; // Ignore if mouStatus is null or undefined

        let status = member.mouStatus.toLowerCase().trim();
        // Normalize DB values to match UI keys
        if (status === "completed") status = "approved";
        if (status === "submitted") status = "pending";

        if (mouDistribution.hasOwnProperty(status)) {
          mouDistribution[status]++;
        }
      });

      // Calculate total MOUs generated under me (only those with an actual status)
      const totalMOUs = Object.values(mouDistribution).reduce((a, b) => a + b, 0);

      // 2. Revenue / Target Achievement (Sum of netSoldCopAmount for approved MOUs)
      const revenueData = await BookingLogin.aggregate([
        { 
          $match: { 
            createdBy: { $in: targetIds },
            status: "approved"
          } 
        },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: { $toDouble: "$netSoldCopAmount" } } 
          } 
        }
      ]);

      const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
      const monthlyTarget = 5000000; // Mock target: 50 Lakhs (can be dynamic later)

      // 3. Conversion Stats (Total Leads vs Total Approved MOUs)
      const totalLeads = await Lead.countDocuments({ assignedTo: { $in: targetIds } });
      const approvedMOUs = mouDistribution["approved"] || 0;
      const conversionRate = totalLeads > 0 ? ((approvedMOUs / totalLeads) * 100).toFixed(1) : 0;

      const stats = {
        mouDistribution,
        totalMOUs,
        revenue: {
          achieved: totalRevenue,
          target: monthlyTarget,
          percentage: Math.min((totalRevenue / monthlyTarget) * 100, 100)
        },
        conversion: {
          totalLeads,
          approvedMOUs,
          rate: conversionRate
        }
      };

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("[UserAnalyticsService] Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default UserAnalyticsService;
