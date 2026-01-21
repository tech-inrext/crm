<<<<<<< HEAD
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
=======
import { Controller } from "@framework";
import OverallAnalyticsService from "@/be/services/analytics/overall";

class OverallAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = new OverallAnalyticsService();
  }

  get(req, res) {
    return this.service.getOverall(req, res);
  }
}

export default new OverallAnalyticsController().handler;
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
