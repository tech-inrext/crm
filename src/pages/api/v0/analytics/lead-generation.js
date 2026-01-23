
import { Controller } from "@framework";
import LeadAnalyticsService from "@/be/services/analytics/leadGeneration";

class LeadGenerationController extends Controller {
  constructor() {
    super();
    this.service = new LeadAnalyticsService();
  }

  // GET /api/v0/analytics/lead-generation?period=month|week
  get(req, res) {
    return this.service.getLeadGeneration(req, res);
 
  }
}

export default new LeadGenerationController().handler;
