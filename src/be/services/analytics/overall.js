import dbConnect from "@/lib/mongodb";
import Employee from "../../models/Employee";
import Lead from "../../models/Lead";

class OverallAnalyticsService {
  /**
   * Dashboard analytics (self)
   */

  getActiveLeadsCount(filters) {
    return Lead.countDocuments({
      ...filters,
      status: {
        $in: ["in progress", "details shared"],
      },
    });
  }

  getNewLeadsCount(filters) {
    return Lead.find({
      ...filters,
      status: "new",
    });
  }

  getActiveMOUCount(filters) {
    return Employee.countDocuments({
      ...filters,
      mouStatus: { $regex: "^Pending$", $options: "i" },
    });
  }

  getApprovedMOUCount(filters) {
    return Employee.countDocuments({
      ...filters,
      mouStatus: { $regex: "^Approved$", $options: "i" },
    });
  }

  async getOverall(req, res) {
    await dbConnect();

    try {
      const loggedInUserId = req.employee?._id;
      let userId = req.query.userId || loggedInUserId;

      const leadUserQuery = {
        $or: [{ assignedTo: userId }, { uploadedBy: userId }],
      };

      const fetchAllDetailsPromise = [];
      /* ---------- ACTIVE LEADS (ONLY IN PROGRESS + DETAILS SHARED) ---------- */
      const activeLeadsCount = this.getActiveLeadsCount(leadUserQuery);
      fetchAllDetailsPromise.push(activeLeadsCount);

      const newLeadsCount = this.getNewLeadsCount(leadUserQuery);
      fetchAllDetailsPromise.push(newLeadsCount);

      // Add site visit count

      /* ---------- MOU STATS ---------- */
      let mouStats = { pending: 0, approved: 0 };

      if (loggedInUserId) {
        const activeMOUCount = this.getActiveMOUCount({
          managerId: loggedInUserId.toString(),
        });
        fetchAllDetailsPromise.push(activeMOUCount);
        const approvedMOUCount = this.getApprovedMOUCount({
          managerId: loggedInUserId.toString(),
        });
        fetchAllDetailsPromise.push(approvedMOUCount);
      }

      const allDetails = await Promise.all(fetchAllDetailsPromise);

      return res.status(200).json({
        success: true,
        loggedInUserId,
        totalLeads,
        activeLeads: activeLeadsCount,
        newLeads: newLeadsCount,
        newLeadSection: newLeadsList.map((lead) => ({
          _id: lead._id,
          name: lead.fullName || lead.name,
          status: lead.status,
          createdAt: lead.createdAt,
        })),
        siteVisitCount,
        mouStats,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Manager / Team analytics
   */
  async getTeamAnalytics(req, res) {
    await dbConnect();

    try {
      let managerId = req.query.managerId || req.employee?._id;
      if (!managerId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const Lead = (await import("../../models/Lead")).default;
      const { getCabBooking } = await import(
        "@/be/services/analytics/cabBooking"
      );

      if (Array.isArray(managerId)) managerId = managerId[0];

      let filter = {};
      if (managerId !== "all") filter.managerId = managerId;

      const users = await Employee.find(filter, {
        _id: 1,
        name: 1,
        teamName: 1,
      }).lean();

      const userIds = users.map((u) => u._id);

      /* ---------- NEW LEADS ---------- */
      const newLeadsAgg = await Lead.aggregate([
        {
          $match: {
            $or: [
              { assignedTo: { $in: userIds } },
              { uploadedBy: { $in: userIds } },
            ],
            status: { $regex: "^new$", $options: "i" },
          },
        },
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      ]);

      const newLeadsMap = Object.fromEntries(
        newLeadsAgg.map((x) => [x._id?.toString(), x.count])
      );

      /* ---------- ACTIVE LEADS (ONLY IN PROGRESS) ---------- */
      const activeLeadsAgg = await Lead.aggregate([
        {
          $match: {
            assignedTo: { $in: userIds },
            status: { $regex: "^in progress$", $options: "i" },
          },
        },
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      ]);

      const activeLeadsMap = Object.fromEntries(
        activeLeadsAgg.map((x) => [x._id?.toString(), x.count])
      );

      /* ---------- SITE VISITS ---------- */
      const siteVisitAgg = await Lead.aggregate([
        {
          $match: {
            $or: [
              { assignedTo: { $in: userIds } },
              { uploadedBy: { $in: userIds } },
            ],
            status: { $regex: /site visit/i },
          },
        },
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      ]);

      const siteVisitMap = Object.fromEntries(
        siteVisitAgg.map((x) => [x._id?.toString(), x.count])
      );

      /* ---------- MOU ---------- */
      const mouAgg = await Employee.aggregate([
        { $match: { _id: { $in: userIds } } },
        {
          $group: {
            _id: "$_id",
            pending: {
              $sum: {
                $cond: [
                  { $regexMatch: { input: "$mouStatus", regex: /^Pending$/i } },
                  1,
                  0,
                ],
              },
            },
            approved: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: { input: "$mouStatus", regex: /^Approved$/i },
                  },
                  1,
                  0,
                ],
              },
            },
            completed: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: { input: "$mouStatus", regex: /^Completed$/i },
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const mouMap = Object.fromEntries(
        mouAgg.map((x) => [
          x._id?.toString(),
          { pending: x.pending, approved: x.approved, completed: x.completed },
        ])
      );

      /* ---------- CAB ---------- */
      const cabResults = await Promise.all(
        userIds.map((id) => getCabBooking({ avpId: id }))
      );

      const usersStats = users.map((u, i) => ({
        ...u,
        newLeads: newLeadsMap[u._id.toString()] || 0,
        activeLeads: activeLeadsMap[u._id.toString()] || 0,
        siteVisitCount: siteVisitMap[u._id.toString()] || 0,
        mouStats: mouMap[u._id.toString()] || {
          pending: 0,
          approved: 0,
          completed: 0,
        },
        totalVendors: cabResults[i]?.totalVendors ?? 0,
        totalSpend: cabResults[i]?.totalSpend ?? 0,
      }));

      return res.status(200).json({ success: true, users: usersStats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default OverallAnalyticsService;
