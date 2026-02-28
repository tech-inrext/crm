import { Service } from "@framework";
import dbConnect from "@/lib/mongodb";
import Lead from "../../models/Lead";
import FollowUp from "../../models/FollowUp";
import mongoose from "mongoose";

class LeadAnalyticsService extends Service {
  async getLeadsAnalytics(req, res) {
    try {
      await dbConnect();

      const { period = "month" } = req.query;
      const employee = req.employee;

      if (!employee?._id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const loggedInUserId = new mongoose.Types.ObjectId(employee._id);

      //  USER VISIBILITY
      const baseQuery = {
        $or: [
          { uploadedBy: loggedInUserId },
          { managerId: loggedInUserId },
          { assignedTo: loggedInUserId },
        ],
      };

       const CONVERTED_STATUSES = [
        Lead.siteVisitConversions,
        // Lead.callback,
        // Lead.FollowUp,
        Lead.detailsShared,
      ];


      // PARALLEL QUERIES
      const [detailsSharedLeads, siteVisitRaw, bySource, byProperty] =
        await Promise.all([
          // DETAILS SHARED COUNT
          Lead.countDocuments({
            ...baseQuery,
            status: { $regex: /^details shared$/i },
          }),

          // SITE VISIT DONE (DISTINCT LEADS)
          FollowUp.aggregate([
            {
              $match: {
                followUpType: "site visit",
                leadId: { $exists: true },
              },
            },
            {
              $lookup: {
                from: "leads",
                localField: "leadId",
                foreignField: "_id",
                as: "lead",
              },
            },
            { $unwind: "$lead" },
            {
              $match: {
                $or: [
                  { "lead.uploadedBy": loggedInUserId },
                  { "lead.managerId": loggedInUserId },
                  { "lead.assignedTo": loggedInUserId },
                ],
              },
            },
            {
              $group: {
                _id:
                  period === "month"
                    ? { $month: "$followUpDate" }
                    : { $dayOfWeek: "$followUpDate" },
                leadIds: { $addToSet: "$leadId" },
              },
            },
            {
              $project: {
                count: { $size: "$leadIds" },
              },
            },
          ]),

          // SOURCE DATA
          Lead.aggregate([
            { $match: baseQuery },
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
                converted: {
                  $sum: {
                    $cond: [
                      { $in: ["$statusLower", CONVERTED_STATUSES] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ]),

          // PROPERTY DATA
          Lead.aggregate([
            { $match: baseQuery },
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
                converted: {
                  $sum: {
                    $cond: [
                      { $in: ["$statusLower", CONVERTED_STATUSES] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ]),
        ]);

      // FORMAT SITE VISIT CHART

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

        const map = {};
        siteVisitRaw.forEach((m) => {
          map[m._id] = m.count;
        });

        siteVisitDoneData = months.map((label, i) => ({
          label,
          siteVisitDone: map[i + 1] || 0,
        }));
      }

      if (period === "week") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const map = {};
        siteVisitRaw.forEach((d) => {
          map[d._id] = d.count;
        });

        siteVisitDoneData = days.map((label, i) => ({
          label,
          siteVisitDone: map[i + 1] || 0,
        }));
      }

      const siteVisitConversions = siteVisitDoneData.reduce(
        (sum, item) => sum + item.siteVisitDone,
        0,
      );

      /* ---------------- SOURCE FORMAT ---------------- */

      const map = {};
      const sourcesOrder = [];
      const slices = [];

      (bySource || []).forEach((s) => {
        const key = s._id || "Unknown";
        map[key] = s;
        sourcesOrder.push(key);
        slices.push({ label: key, value: s.count });
      });

      /* ---------------- PROPERTY FORMAT ---------------- */

      const propertyData = (byProperty || []).map((p) => ({
        value: p._id || "Unknown",
        label: p._id || "Unknown",
        count: p.count,
        converted: p.converted,
      }));

      /* ---------------- FINAL RESPONSE ---------------- */

      return res.status(200).json({
        success: true,
        detailsSharedLeads,
        siteVisitConversions,
        siteVisitDoneData,
        map,
        slices,
        sourcesOrder,
        propertyData,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

export default LeadAnalyticsService;
