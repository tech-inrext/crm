import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  await dbConnect();
  try {
    // Allow managerId to be passed as query param for flexibility
    let managerId = req.query.managerId || req.employee?._id;
    if (!managerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Save the current manager's _id for summary inclusion
    const currentManagerId = req.employee?._id?.toString?.() || (typeof managerId === 'string' ? managerId : '');
    // If managerId is an array (from query), take first
    if (Array.isArray(managerId)) managerId = managerId[0];
    let users = [];
    let filter = {};
    if (managerId && managerId !== 'all') {
      filter.managerId = managerId;
    }
    users = await Employee.find( 
      filter,
      { _id: 1, name: 1, teamName: 1 }
    ).lean();

    // For each user, fetch only their own leads (not recursive)
    const Lead = (await import("@/models/Lead")).default;
    const mongoose = (await import("mongoose")).default;
    const { getCabBooking } = await import("@/be/services/analytics/cabBooking");
    const activeLeadStatuses = [
      "followup",
      "follow up",
      "callback",
      "call back",
      "details shared",
      "site visit",
      "site visit done",
    ];
    const userStats = await Promise.all(users.map(async (user) => {
      const userId = typeof user._id === 'string' ? new mongoose.Types.ObjectId(user._id) : user._id;
      // Count new leads where user is assignedTo or uploadedBy
      const newLeads = await Lead.countDocuments({
        $or: [
          { assignedTo: userId },
          { uploadedBy: userId }
        ],
        status: { $regex: "^new$", $options: "i" }
      });
      // Match overall API: count active leads for this user (assignedTo or uploadedBy, status in activeLeadStatuses, case-insensitive)
      const leadUserQuery = { $or: [{ assignedTo: userId }, { uploadedBy: userId }] };
      const activeLeads = await Lead.countDocuments({
        ...leadUserQuery,
        status: { $in: activeLeadStatuses.map(s => new RegExp(`^${s}$`, 'i')) }
      });
      // Site visits: status contains 'site visit' (case-insensitive), user is assignedTo or uploadedBy
      const siteVisitCount = await Lead.countDocuments({
        $or: [
          { assignedTo: userId },
          { uploadedBy: userId }
        ],
        status: { $regex: /site visit/i }
      });

      // MoU stats for each user: count employees where managerId = userId and mouStatus matches (like overall API)
      const mouPending = await Employee.countDocuments({ managerId: userId.toString(), mouStatus: { $regex: "^Pending$", $options: "i" } });
      const mouApproved = await Employee.countDocuments({ managerId: userId.toString(), mouStatus: { $regex: "^Approved$", $options: "i" } });
      const mouCompleted = await Employee.countDocuments({ managerId: userId.toString(), mouStatus: { $regex: "^Completed$", $options: "i" } });

      // Fetch total vendor and total spend for this user from cab booking analytics
      const cabBookingAnalytics = await getCabBooking({ avpId: userId });
      const totalVendors = cabBookingAnalytics?.totalVendors ?? 0;
      const totalSpend = cabBookingAnalytics?.totalSpend ?? 0;

      return {
        ...user,
        newLeads,
        activeLeads,
        siteVisitCount,
        mouStats: {
          pending: mouPending,
          approved: mouApproved,
          completed: mouCompleted,
        },
        totalVendors,
        totalSpend,
      };
    }));

    // Calculate combined MoU stats for all users in userStats
    const mous = userStats.reduce((acc, user) => {
      acc.pending += user.mouStats.pending || 0;  
      acc.approved += user.mouStats.approved || 0;
      acc.completed += user.mouStats.completed || 0;
      return acc;
    }, { pending: 0, approved: 0, completed: 0 });

    return res.status(200).json({ success: true, users: userStats, mous });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
