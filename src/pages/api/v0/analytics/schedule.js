
import { AnalyticsService } from "@/be/services/Analytics";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  try {
    const result = await AnalyticsService.getSchedule({ employee: req.employee });
    res.status(200).json(result);
  } catch (err) {
    console.error("Schedule API error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
