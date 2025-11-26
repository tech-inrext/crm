import { Controller } from "@framework";
import dbConnect from "../../../../../lib/mongodb.js";
import notificationService from "../../../../../services/notification.service";

class NotificationStatsController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    console.log("Stats endpoint hit");

    try {
      await dbConnect();
      const { employee } = req;

      if (!employee) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const stats = await notificationService.getNotificationStats(
        employee._id
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Notification stats API error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get notification statistics",
      });
    }
  }
}

export default new NotificationStatsController().handler;
