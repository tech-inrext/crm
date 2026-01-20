import { Controller } from "@framework";
import LeadAnalyticsService from "@/be/services/Analytics/leads";

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
