import { Controller } from "@framework";
import * as ScheduleAnalyticsService from "@/be/services/analytics/schedule";
import { userAuth } from "@/middlewares/auth";

class ScheduleAnalyticsController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    try {
      const result = await ScheduleAnalyticsService.getSchedule({ employee: req.employee });
      return res.status(200).json(result);
    } catch (err) {
      console.error("Schedule API error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new ScheduleAnalyticsController().handler;
