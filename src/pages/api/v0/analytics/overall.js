import { userAuth } from "@/middlewares/auth";
import { AnalyticsService } from "@/be/services/Analytics";

async function handler(req, res) {
  try {
    const employee = req.employee;
    const userId = req.query.userId;
    const result = await AnalyticsService.getOverall({ userId, employee });
    res.status(200).json(result);
  } catch (err) {
    console.error("Analytics API error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
}

export default (req, res) => userAuth(req, res, handler);
