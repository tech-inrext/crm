import { Controller } from "@framework";
import {LeadAnalyticsService} from "@/be/services/analytics/leadGeneration";
import { userAuth } from "@/middlewares/auth";

class LeadGenerationController extends Controller {
  constructor() {
    super();
    this.service = new LeadAnalyticsService();
  }

  // GET /lead-generation?period=month OR ?period=week
  async get(req, res) {
    try {
      const period = req.query.period || "month";
      const employee = req.employee; // comes from userAuth middleware
      const result = await this.service.getLeadGeneration({ period, employee });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Lead Generation Error:", error);
      return res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}

// Wrap with authentication middleware
export default (req, res) => userAuth(req, res, new LeadGenerationController().handler);
