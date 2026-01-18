import { Controller } from "@framework";
import { userAuth } from "@/middlewares/auth";
import UserStatsService from "@/be/services/analytics/users";

class UserStatsController extends Controller {
  constructor() {
    super();
    this.service = UserStatsService;
  }

  async get(req, res) {
    try {
      const managerId = req.query.managerId || req.employee?._id;
      if (!managerId) return res.status(401).json({ success: false, message: "Unauthorized" });
      const data = await this.service.getUserStats(managerId);
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      console.error("UserStatsController GET error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default (req, res) => userAuth(req, res, new UserStatsController().handler);
