 
import { Controller } from "@framework";
import ScheduleAnalyticsService from "@/be/services/analytics/schedule";

class ScheduleAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = new ScheduleAnalyticsService();
  }

  get(req, res) {
    return this.service.getSchedule(req, res);
  }
}

export default new ScheduleAnalyticsController().handler;
 
