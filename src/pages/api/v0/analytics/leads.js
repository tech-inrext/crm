import { Controller } from "@framework";
import LeadAnalyticsService from "@/be/services/Analytics/leads";

class LeadAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = new LeadAnalyticsService();
  }

  // GET /api/analytics/leads
  get(req, res) {
    const { period = "month" } = req.query;
    const employee = req.employee;

    return this.service.getLeadsAnalytics({ period, employee })
      .then((data) => res.status(200).json(data))
      .catch((err) =>
        res.status(500).json({ error: err.message })
      );
  }
}

export default new LeadAnalyticsController().handler;
