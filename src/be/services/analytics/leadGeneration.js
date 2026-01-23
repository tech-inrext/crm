 
import { Service } from "@framework";
 
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

const CONVERTED_STATUSES = [

  "site visit done",
  "call back",
  "follow up",
  "details shared",
];

class LeadAnalyticsService extends Service {
  async getLeadGeneration(req, res) {
    try {
      await dbConnect();

      const period = (req.query.period || "month").toString();
      const employee = req.employee;

      const loggedInUserId = employee?._id;
      const baseMatch = {};
      if (loggedInUserId) baseMatch.uploadedBy = loggedInUserId;

      /* -------- WEEK -------- */
      if (period === "week") {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;

        const monday = new Date(now);
        monday.setHours(0, 0, 0, 0);
        monday.setDate(now.getDate() - diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const weekMatch = { createdAt: { $gte: monday, $lte: sunday } };
        if (loggedInUserId) weekMatch.uploadedBy = loggedInUserId;

        const allWeekLeads = await Lead.find(weekMatch).lean();

        const convertedLeads = allWeekLeads.filter((lead) => {
          const statusNorm = (lead.status || "")
            .toLowerCase()
            .replace(/-/g, " ")
            .trim();
          return CONVERTED_STATUSES.includes(statusNorm);
        });

        const countsByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

        convertedLeads.forEach((lead) => {
          const dayOfWeek = new Date(lead.createdAt).getDay();
          countsByDay[dayOfWeek]++;
        });

        return res.status(200).json({
          success: true,
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [
            countsByDay[1],
            countsByDay[2],
            countsByDay[3],
            countsByDay[4],
            countsByDay[5],
            countsByDay[6],
            countsByDay[0],
          ],
        });
      }

      /* -------- MONTH (LAST 6) -------- */
      const now = new Date();
      const monthsToReturn = 6;

      const startMonth = new Date(
        now.getFullYear(),
        now.getMonth() - (monthsToReturn - 1),
        1
      );
      startMonth.setHours(0, 0, 0, 0);

      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endMonth.setHours(23, 59, 59, 999);

      const results = await Lead.aggregate([
        {
          $match: {
            ...baseMatch,
            createdAt: { $gte: startMonth, $lte: endMonth },
          },
        },
        {
          $project: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            statusNorm: {
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
            },
          },
        },
        { $match: { statusNorm: { $in: CONVERTED_STATUSES } } },
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
      const map = {};

      results.forEach((r) => {
        map[`${r._id.year}-${r._id.month}`] = r.count;
      });

      for (let i = monthsToReturn - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        labels.push(d.toLocaleString("en-US", { month: "short" }));
        data.push(map[key] || 0);
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
 
