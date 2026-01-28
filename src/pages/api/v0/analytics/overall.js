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
