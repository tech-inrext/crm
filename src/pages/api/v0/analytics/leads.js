import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  await dbConnect();
  try {
    // logged in user filter (if available)
    const loggedInUserId = req.employee?._id;
    const baseQuery = loggedInUserId ? { uploadedBy: loggedInUserId } : {};

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

    const { start: todayStart, end: todayEnd } = getDayRange(0);
    const { start: yestStart, end: yestEnd } = getDayRange(1);
    const { start: beforeYestStart, end: beforeYestEnd } = getDayRange(2);

    // Define which statuses count as a conversion (case-insensitive)
    const CONVERTED_STATUSES = [
      "site visit done",
      "call back",
      "follow up",
      "details shared",
    ];

    // Helper: include match stage only when baseQuery has uploadedBy
    const matchStage = loggedInUserId ? [{ $match: baseQuery }] : [];

    // Count leads by status (case-insensitive, using $toLower)
    const leadStatuses = ["new", "follow-up", "call back", "details shared"];

    // Helper: get site visit done counts by month or weekday
    const { period = "month" } = req.query;

    // Trend counts for each status
    function getStatusTrend(status) {
      return Promise.all([
        Lead.countDocuments({
          ...baseQuery,
          status: new RegExp(`^${status}$`, "i"),
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }),
        Lead.countDocuments({
          ...baseQuery,
          status: new RegExp(`^${status}$`, "i"),
          createdAt: { $gte: yestStart, $lte: yestEnd },
        }),
        Lead.countDocuments({
          ...baseQuery,
          status: new RegExp(`^${status}$`, "i"),
          createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd },
        }),
      ]).then(([today, yesterday, beforeYesterday]) => ({ today, yesterday, beforeYesterday }));
    }

    // Run all independent DB queries in parallel
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
        ...(loggedInUserId ? [{ $match: baseQuery }] : []),
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
            ...(loggedInUserId ? [{ $match: baseQuery }] : []),
            { $match: { status: { $regex: /^site visit done$/i } } },
            {
              $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 },
              },
            },
          ])
        : Promise.resolve([]),
      period === "week"
        ? Lead.aggregate([
            ...(loggedInUserId ? [{ $match: baseQuery }] : []),
            { $match: { status: { $regex: /^site visit done$/i } } },
            {
              $group: {
                _id: { $dayOfWeek: "$createdAt" },
                count: { $sum: 1 },
              },
            },
          ])
        : Promise.resolve([]),
      Lead.aggregate([
        ...matchStage,
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [
                  { $in: [{ $toLower: "$status" }, CONVERTED_STATUSES] },
                  1,
                  0,
                ],
              },
            },
            totalCost: { $sum: 0 }, // Placeholder for cost - not implemented in Lead model yet
          },
        },
      ]),
      Lead.aggregate([
        ...matchStage,
        {
          $group: {
            _id: "$propertyName",
            count: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [
                  { $in: [{ $toLower: "$status" }, CONVERTED_STATUSES] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    // Parse status counts
    let newLeads = 0,
      callBackLeads = 0,
      followUpLeads = 0,
      detailsSharedLeads = 0;
    statusCounts.forEach((s) => {
      if (s._id === "new") newLeads = s.count;
      else if (s._id === "call back") callBackLeads = s.count;
      else if (s._id === "follow-up") followUpLeads = s.count;
      else if (s._id === "details shared") detailsSharedLeads = s.count;
    });

    // Build siteVisitDoneData
    let siteVisitDoneData = [];
    if (period === "month") {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthMap = {};
      byMonth.forEach((m) => {
        monthMap[m._id] = m.count;
      });
      siteVisitDoneData = months.map((label, idx) => ({
        label,
        siteVisitDone: monthMap[idx + 1] || 0,
      }));
    } else if (period === "week") {
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekdayMap = {};
      byWeekday.forEach((w) => {
        weekdayMap[w._id] = w.count;
      });
      siteVisitDoneData = weekdays.map((label, idx) => ({
        label,
        siteVisitDone: weekdayMap[idx + 1] || 0,
      }));
    }

    // Count of conversions where status is 'site visit done' (case-insensitive) (for backward compatibility, sum all)
    const siteVisitConversions = siteVisitDoneData.reduce(
      (sum, d) => sum + d.siteVisitDone,
      0
    );

    // Build map and order
    const map = {};
    const sourcesOrder = [];
    const slices = [];
    bySource.forEach((s) => {
      map[s._id || "Unknown"] = s;
      sourcesOrder.push(s._id || "Unknown");
      slices.push({ label: s._id || "Unknown", value: s.count });
    });

    // Build property map with labels
    const propertyLabels = {
      dholera: "Dholera",
      "migsun-rohini-center": "Migsun Rohini Center",
      "eco-village": "Eco-Village",
      "corbett-country": "Corbett Country",
    };

    const propertyData = byProperty.map((p) => ({
      value: p._id || "Unknown",
      count: p.count,
      label: propertyLabels[p._id] || p._id || "Unknown",
      converted: p.converted,
    }));

    res.status(200).json({
      totalLeads,
      newLeads,
      callBackLeads,
      followUpLeads,
      detailsSharedLeads,
      siteVisitConversions,
      siteVisitDoneData, // <-- new array for chart
      map,
      sourcesOrder,
      slices,
      propertyData,
      trend: {
        newLeads: newLeadsTrend,
        callBackLeads: callBackLeadsTrend,
        followUpLeads: followUpLeadsTrend,
        detailsSharedLeads: detailsSharedLeadsTrend,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Export with auth wrapper so req.employee is populated (falls back to global when unauthenticated)
export default (req, res) => userAuth(req, res, handler);
