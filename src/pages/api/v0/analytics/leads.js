import { userAuth } from "@/middlewares/auth";
import { AnalyticsService } from "@/be/services/Analytics";

async function handler(req, res) {
  try {
    const { period = "month" } = req.query;
    const employee = req.employee;
    const result = await AnalyticsService.getLeads({ period, employee });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
