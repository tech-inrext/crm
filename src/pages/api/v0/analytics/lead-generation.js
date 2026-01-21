<<<<<<< HEAD

import { AnalyticsService } from "@/be/services/Analytics";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  try {
    const period = req.query.period || "month";
    const result = await AnalyticsService.getLeadGeneration({ period, employee: req.employee });
    return res.status(200).json(result);
  } catch (err) {
    console.error("lead-generation error", err);
    return res.status(500).json({ success: false, error: err.message });
=======
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
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  }
}

export default new LeadGenerationController().handler;
