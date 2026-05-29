import { Controller } from "@framework";
import CabBookingAnalyticsService from "@/be/services/CabBookingAnalyticsService";

class CabBookingAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = new CabBookingAnalyticsService();
  }

  get(req, res) {
    return this.service.getCabBookingStats(req, res);
  }
}

export default new CabBookingAnalyticsController().handler;
