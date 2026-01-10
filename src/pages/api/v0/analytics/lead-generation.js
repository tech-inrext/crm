
import { AnalyticsService } from "@/be/services/Analytics";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  try {
    const period = req.query.period || "month";
    const result = await AnalyticsService.getLeadGeneration({ period, employee: req.employee });
    return res.status(200).json(result);
  } catch (err) {
    console.error("lead-generation error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
