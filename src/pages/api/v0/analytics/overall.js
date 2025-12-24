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

    // Get logged-in user ID from auth middleware
    const loggedInUserId = req.employee?._id;
    const baseQuery = { uploadedBy: loggedInUserId };

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
    const [
      totalLeads,
      todayUsers,
      yesterdayUsers,
      beforeYesterdayUsers,
      todayPendingMou,
      yesterdayPendingMou,
      beforeYesterdayPendingMou,
      todayApprovedMou,
      yesterdayApprovedMou,
      beforeYesterdayApprovedMou,
      todayVendors,
      yesterdayVendors,
      beforeYesterdayVendors,
      newLeadsList,
      newLeadsCount,
      todayNewLeads,
      yesterdayNewLeads,
      beforeYesterdayNewLeads,
      siteVisitCount,
      todaySiteVisits,
      yesterdaySiteVisits,
      beforeYesterdaySiteVisits,
      employeeResults,
      mouResults,
    ] = await Promise.all([
      Lead.countDocuments(baseQuery),
      Employee.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.countDocuments({ mouStatus: "Pending", createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ mouStatus: "Pending", createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ mouStatus: "Pending", createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.countDocuments({ mouStatus: "Approved", createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ mouStatus: "Approved", createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ mouStatus: "Approved", createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Employee.countDocuments({ isCabVendor: true, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Employee.countDocuments({ isCabVendor: true, createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Employee.countDocuments({ isCabVendor: true, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Lead.find({ ...baseQuery, status: { $regex: "^new$", $options: "i" } }).sort({ createdAt: -1 }).limit(10),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "^new$", $options: "i" } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "^new$", $options: "i" }, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "^new$", $options: "i" }, createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "^new$", $options: "i" }, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "site visit", $options: "i" } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "site visit", $options: "i" }, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "site visit", $options: "i" }, createdAt: { $gte: yestStart, $lte: yestEnd } }),
      Lead.countDocuments({ ...baseQuery, status: { $regex: "site visit", $options: "i" }, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
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
            ...(loggedInUserId
              ? {
                  teamMembers: [
                    {
                      $match: {
                        $or: [
                          { _id: loggedInUserId },
                          { managerId: loggedInUserId },
                        ],
                      },
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
          $match: { _id: loggedInUserId },
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
      totalUsers,
      newLeads: newLeadsCount,
      newLeadSection: newLeadsList.map((lead) => ({
        _id: lead._id,
        name: lead.name,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
      siteVisitCount,
      totalMou,
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
        totalVendors: {
          today: todayVendors,
          yesterday: yesterdayVendors,
          beforeYesterday: beforeYesterdayVendors,
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
