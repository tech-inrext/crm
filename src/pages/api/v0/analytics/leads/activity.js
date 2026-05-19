import { Controller } from "@framework";
import LeadAnalyticsService from "@/be/services/LeadAnalyticsService";

class LeadActivityController extends Controller {
  constructor() {
    super();
    this.service = new LeadAnalyticsService();
  }

  get(req, res) {
    return this.service.getTodayActivity(req, res);
  }
}

export default new LeadActivityController().handler;
