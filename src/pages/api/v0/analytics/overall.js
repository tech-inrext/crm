import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Lead from "@/models/Lead";
import CabVendor from "@/models/CabVendor";
import CabBooking from "@/models/CabBooking";
import VendorBooking from "@/models/VendorBooking";
import Role from "@/models/Role";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  try {
    await dbConnect();

    // Get userId from query (for team analytics), fallback to logged-in user
    const loggedInUserId = req.employee?._id;
    const userId = req.query.userId || loggedInUserId;
    // For leads, use assignedTo or uploadedBy strictly for the selected user
    const leadUserQuery = { $or: [ { assignedTo: userId }, { uploadedBy: userId } ] };
    // For Employee/MoU, use only _id: userId (not managerId)
    const employeeUserQuery = { _id: userId };

    // Define active lead statuses (adjust as needed)
    // Use exact status values as in your DB, case-insensitive
    const activeLeadStatuses = [
      "followup",
      "follow up",
      "callback",
      "call back",
      "details shared",
      "site visit",
      "site visit done"
    ];

    // Helper to get start/end of day
    function getDayRange(offset = 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const start = new Date(now);
      start.setDate(start.getDate() - offset);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    // Today, yesterday, day before ranges
    const { start: todayStart, end: todayEnd } = getDayRange(0);
    const { start: yestStart, end: yestEnd } = getDayRange(1);
    const { start: beforeYestStart, end: beforeYestEnd } = getDayRange(2);

    // Run all independent DB queries in parallel
    // Fetch active leads for user (status in activeLeadStatuses, case-insensitive)
    const activeLeadsCount = await Lead.countDocuments({
      ...leadUserQuery,
      status: { $in: activeLeadStatuses.map(s => new RegExp(`^${s}$`, 'i')) }
    });

    // Fetch new leads for user
    const newLeadsList = await Lead.find({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" } }).sort({ createdAt: -1 }).limit(10);
    const newLeadsCount = await Lead.countDocuments({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" } });

    // Fetch site visit leads for user
    const siteVisitCount = await Lead.countDocuments({ ...leadUserQuery, status: { $regex: /site visit/i } });

    // Fetch total leads for user
    const totalLeads = await Lead.countDocuments(leadUserQuery);

    // ...existing code for trends and other stats...
    const [
      todayNewLeads,
      yesterdayNewLeads,
      beforeYesterdayNewLeads,
      todaySiteVisits,
      yesterdaySiteVisits,
      beforeYesterdaySiteVisits,
      todayUsers,
      yesterdayUsers,
      beforeYesterdayUsers,
      todayPendingMou,
      yesterdayPendingMou,
      beforeYesterdayPendingMou,
      todayApprovedMou,
      yesterdayApprovedMou,
      beforeYesterdayApprovedMou,
      employeeResults,
      mouResults,
    ] = await Promise.all([
      Lead.countDocuments({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" }, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" }, createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Lead.countDocuments({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" }, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Lead.countDocuments({ ...leadUserQuery, status: { $regex: /site visit/i }, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ ...leadUserQuery, status: { $regex: /site visit/i }, createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Lead.countDocuments({ ...leadUserQuery, status: { $regex: /site visit/i }, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, mouStatus: "Pending", createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, mouStatus: "Pending", createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, mouStatus: "Pending", createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, mouStatus: "Approved", createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, mouStatus: "Approved", createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ ...employeeUserQuery, mouStatus: "Approved", createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            cabVendors: [
              { $match: { isCabVendor: true } },
              { $project: { password: 0, __v: 0 } },
            ],
            cabVendorCount: [
              { $match: { isCabVendor: true } },
              { $count: "count" },
            ],
            ...(userId
              ? {
                  teamMembers: [
                    {
                      $match: employeeUserQuery,
                    },
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        designation: 1,
                        branch: 1,
                        managerId: 1,
                        employeeProfileId: 1,
                        email: 1,
                        phone: 1,
                      },
                    },
                  ],
                }
              : {}),
          },
        },
      ]),
      Employee.aggregate([
        {
          $match: employeeUserQuery,
        },
        {
          $facet: {
            allMou: [
              {
                $match: {
                  $or: [
                    { mouStatus: { $exists: true, $ne: null } },
                    { mouPdfUrl: { $exists: true, $ne: null } },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  employeeProfileId: 1,
                  mouStatus: 1,
                  mouPdfUrl: 1,
                  designation: 1,
                  branch: 1,
                  createdAt: 1,
                  updatedAt: 1,
                },
              },
            ],
            mouStats: [
              {
                $match: {
                  mouStatus: { $exists: true, $ne: null, $ne: "" },
                },
              },
              {
                $group: {
                  _id: "$mouStatus",
                  count: { $sum: 1 },
                },
              },
            ],
            totalMou: [
              {
                $match: {
                  $or: [
                    { mouStatus: { $exists: true, $ne: null, $ne: "" } },
                    { mouPdfUrl: { $exists: true, $ne: null, $ne: "" } },
                  ],
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),
    ]);

    // Process results efficiently
    const mouList = mouResults[0]?.allMou || [];
    const mouStats = mouResults[0]?.mouStats || [];
    const totalMou = mouResults[0]?.totalMou[0]?.count || 0;
    const pendingMouTotal =
      mouStats.find((s) => s._id === "Pending")?.count || 0;
    const approvedMouTotal =
      mouStats.find((s) => s._id === "Approved")?.count || 0;

    // Extract total users count from employee aggregation
    const totalUsers = employeeResults[0]?.totalUsers[0]?.count || 0;

    res.status(200).json({
      loggedInUserId,
      totalLeads,
      activeLeads: activeLeadsCount,
      newLeads: newLeadsCount,
      newLeadSection: newLeadsList.map((lead) => ({
        _id: lead._id,
        name: lead.name,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
      siteVisitCount,
      pendingMouTotal,
      approvedMouTotal,
      // Trend data for cards
      trend: {
        newLeads: {
          today: todayNewLeads,
          yesterday: yesterdayNewLeads,
          beforeYesterday: beforeYesterdayNewLeads,
        },
        siteVisitCount: {
          today: todaySiteVisits,
          yesterday: yesterdaySiteVisits,
          beforeYesterday: beforeYesterdaySiteVisits,
        },
        totalUsers: {
          today: todayUsers,
          yesterday: yesterdayUsers,
          beforeYesterday: beforeYesterdayUsers,
        },
        pendingMouTotal: {
          today: todayPendingMou,
          yesterday: yesterdayPendingMou,
          beforeYesterday: beforeYesterdayPendingMou,
        },
        approvedMouTotal: {
          today: todayApprovedMou,
          yesterday: yesterdayApprovedMou,
          beforeYesterday: beforeYesterdayApprovedMou,
        },
      },
      success: true,
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
}

// Export with auth middleware to ensure req.employee is populated
export default (req, res) => userAuth(req, res, handler);
