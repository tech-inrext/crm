import { Service } from "@framework";
import dbConnect from "@/lib/mongodb";
import Lead from "../../models/Lead";
import mongoose from "mongoose";

class LeadAnalyticsService extends Service {
  async getLeadsAnalytics(req, res) {
    try {
      await dbConnect();

      const { period = "month" } = req.query;
      const employee = req.employee;
      if (!employee?._id) return res.status(401).json({ success: false, message: "Unauthorized" });

      const loggedInUserId = new mongoose.Types.ObjectId(employee._id);

      // ✅ Include all user roles
      const baseQuery = {
        $or: [
          { uploadedBy: loggedInUserId },
          { managerId: loggedInUserId },
          { assignedTo: loggedInUserId },
        ],
      };
      const matchStage = [{ $match: baseQuery }];

      /* ---------------- Date Helpers ---------------- */
      const getDayRange = (offset = 0) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const start = new Date(now);
        start.setDate(now.getDate() - offset);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      };

      const { start: todayStart, end: todayEnd } = getDayRange(0);
      const { start: yestStart, end: yestEnd } = getDayRange(1);
      const { start: beforeYestStart, end: beforeYestEnd } = getDayRange(2);

      const CONVERTED_STATUSES = ["site visit done", "call back", "follow up", "details shared"];
      const leadStatuses = ["new", "follow-up", "call back", "details shared"];

      const getStatusTrend = (status) =>
        Promise.all([
          Lead.countDocuments({ ...baseQuery, status: new RegExp(`^${status}$`, "i"), createdAt: { $gte: todayStart, $lte: todayEnd } }),
          Lead.countDocuments({ ...baseQuery, status: new RegExp(`^${status}$`, "i"), createdAt: { $gte: yestStart, $lte: yestEnd } }),
          Lead.countDocuments({ ...baseQuery, status: new RegExp(`^${status}$`, "i"), createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
        ]).then(([today, yesterday, beforeYesterday]) => ({ today, yesterday, beforeYesterday }));

      /* ---------------- Parallel Queries ---------------- */
      const [
        totalLeads,
        statusCounts,
        newLeadsTrend,
        callBackLeadsTrend,
        followUpLeadsTrend,
        detailsSharedLeadsTrend,
        byMonth,
        byWeekday,
        bySource,
        byProperty,
      ] = await Promise.all([
        Lead.countDocuments(baseQuery),

        Lead.aggregate([
          ...matchStage,
          { $addFields: { statusLower: { $toLower: "$status" } } },
          { $match: { statusLower: { $in: leadStatuses } } },
          { $group: { _id: "$statusLower", count: { $sum: 1 } } },
        ]),

        getStatusTrend("new"),
        getStatusTrend("call back"),
        getStatusTrend("follow-up"),
        getStatusTrend("details shared"),

        period === "month"
          ? Lead.aggregate([
              ...matchStage,
              { $match: { status: { $regex: /^site visit done$/i } } },
              { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
            ])
          : Promise.resolve([]),

        period === "week"
          ? Lead.aggregate([
              ...matchStage,
              { $match: { status: { $regex: /^site visit done$/i } } },
              { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
            ])
          : Promise.resolve([]),

        // ✅ Group by Source with normalization
        Lead.aggregate([
          ...matchStage,
          {
            $addFields: {
              normalizedSource: { $ifNull: ["$source", "Unknown"] },
              statusLower: { $toLower: "$status" },
            },
          },
          {
            $group: {
              _id: "$normalizedSource",
              count: { $sum: 1 },
              converted: { $sum: { $cond: [{ $in: ["$statusLower", CONVERTED_STATUSES] }, 1, 0] } },
            },
          },
        ]),

        // ✅ Group by Property with normalization
        Lead.aggregate([
          ...matchStage,
          {
            $addFields: {
              normalizedProperty: { $ifNull: ["$propertyName", "Unknown"] },
              statusLower: { $toLower: "$status" },
            },
          },
          {
            $group: {
              _id: "$normalizedProperty",
              count: { $sum: 1 },
              converted: { $sum: { $cond: [{ $in: ["$statusLower", CONVERTED_STATUSES] }, 1, 0] } },
            },
          },
        ]),
      ]);

      /* ---------------- Status Normalize ---------------- */
      let newLeads = 0, callBackLeads = 0, followUpLeads = 0, detailsSharedLeads = 0;
      statusCounts.forEach((s) => {
        if (s._id === "new") newLeads = s.count;
        if (s._id === "call back") callBackLeads = s.count;
        if (s._id === "follow-up") followUpLeads = s.count;
        if (s._id === "details shared") detailsSharedLeads = s.count;
      });

      /* ---------------- Site Visit Chart ---------------- */
      let siteVisitDoneData = [];
      if (period === "month") {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const map = {};
        (byMonth || []).forEach((m) => (map[m._id] = m.count));
        siteVisitDoneData = months.map((label, i) => ({ label, siteVisitDone: map[i + 1] || 0 }));
      }
      if (period === "week") {
        const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const map = {};
        (byWeekday || []).forEach((d) => (map[d._id] = d.count));
        siteVisitDoneData = days.map((label, i) => ({ label, siteVisitDone: map[i + 1] || 0 }));
      }

      /* ---------------- Source & Property ---------------- */
      const map = {};
      const sourcesOrder = [];
      const slices = [];
      (bySource || []).forEach((s) => {
        const key = s._id || "Unknown";
        map[key] = s;
        sourcesOrder.push(key);
        slices.push({ label: key, value: s.count });
      });

      const propertyData = (byProperty || []).map((p) => ({
        value: p._id || "Unknown",
        count: p.count,
        label: p._id || "Unknown",
        converted: p.converted,
      }));

      return res.status(200).json({
        totalLeads,
        newLeads,
        callBackLeads,
        followUpLeads,
        detailsSharedLeads,
        siteVisitConversions: siteVisitDoneData.reduce((s, d) => s + d.siteVisitDone, 0),
        siteVisitDoneData,
        map,
        sourcesOrder,
        slices,
        propertyData,
        trend: { newLeads: newLeadsTrend, callBackLeads: callBackLeadsTrend, followUpLeads: followUpLeadsTrend, detailsSharedLeads: detailsSharedLeadsTrend },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default LeadAnalyticsService;
