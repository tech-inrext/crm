<<<<<<< HEAD
import { userAuth } from "@/middlewares/auth";
import { AnalyticsService } from "@/be/services/Analytics";

async function handler(req, res) {
  try {
    const { period = "month" } = req.query;
    const employee = req.employee;
    const result = await AnalyticsService.getLeads({ period, employee });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
=======
import { Controller } from "@framework";
import LeadAnalyticsService from "@/be/services/analytics/leads";

class LeadAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = new LeadAnalyticsService();
  }

  // GET /api/analytics/leads
  get(req, res) {
    return this.service.getLeadsAnalytics(req, res);
  }
}

export default new LeadAnalyticsController().handler;
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
