import { Service } from "@framework";
import dbConnect from "@/lib/mongodb";
import Lead from "../../models/Lead";

const CONVERTED_STATUS = "details shared";

class LeadAnalyticsService extends Service {
  // Reusable Mongo status normalization
  normalizeStatusExpression() {
    return {
      $trim: {
        input: {
          $toLower: {
            $replaceAll: {
              input: { $ifNull: ["$status", ""] },
              find: "-",
              replacement: " ",
            },
          },
        },
      },
    };
  }

  async getLeadGeneration(req, res) {
    try {
      await dbConnect();

      const period = (req.query.period || "month").toString();
      const loggedInUserId = req.employee?._id;

      const baseMatch = {};
      if (loggedInUserId) {
        baseMatch.uploadedBy = loggedInUserId;
      }

      const now = new Date();

      /* ================= WEEK (BASED ON updatedAt) ================= */
      if (period === "week") {
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;

        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const results = await Lead.aggregate([
          {
            $match: {
              ...baseMatch,
              updatedAt: { $gte: monday, $lte: sunday }, // ✅ changed
            },
          },
          {
            $project: {
              dayOfWeek: { $dayOfWeek: "$updatedAt" }, // ✅ changed
              statusNorm: this.normalizeStatusExpression(),
            },
          },
          { $match: { statusNorm: CONVERTED_STATUS } },
          {
            $group: {
              _id: "$dayOfWeek",
              count: { $sum: 1 },
            },
          },
        ]);

        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

        results.forEach((r) => {
          counts[r._id] = r.count;
        });

        return res.status(200).json({
          success: true,
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [
            counts[2],
            counts[3],
            counts[4],
            counts[5],
            counts[6],
            counts[7],
            counts[1],
          ],
        });
      }

      /* ================= MONTH (LAST 6 MONTHS BASED ON updatedAt) ================= */

      const monthsToReturn = 6;

      const startMonth = new Date(
        now.getFullYear(),
        now.getMonth() - (monthsToReturn - 1),
        1,
      );
      startMonth.setHours(0, 0, 0, 0);

      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endMonth.setHours(23, 59, 59, 999);

      const results = await Lead.aggregate([
        {
          $match: {
            ...baseMatch,
            updatedAt: { $gte: startMonth, $lte: endMonth }, // ✅ changed
          },
        },
        {
          $project: {
            year: { $year: "$updatedAt" }, // ✅ changed
            month: { $month: "$updatedAt" }, // ✅ changed
            statusNorm: this.normalizeStatusExpression(),
          },
        },
        { $match: { statusNorm: CONVERTED_STATUS } },
        {
          $group: {
            _id: { year: "$year", month: "$month" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const labels = [];
      const data = [];
      const resultMap = {};

      results.forEach((r) => {
        resultMap[`${r._id.year}-${r._id.month}`] = r.count;
      });

      for (let i = monthsToReturn - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

        labels.push(d.toLocaleString("en-US", { month: "short" }));
        data.push(resultMap[key] || 0);
      }

      return res.status(200).json({
        success: true,
        labels,
        data,
      });
    } catch (err) {
      console.error("Lead Generation Service Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

export default LeadAnalyticsService;
