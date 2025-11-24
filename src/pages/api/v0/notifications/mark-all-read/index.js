import { Controller } from "@framework";
import dbConnect from "../../../../../lib/mongodb.js";
import notificationService from "../../../../../services/notification.service";

class NotificationMarkAllReadController extends Controller {
  constructor() {
    super();
  }

  async post(req, res) {
    await dbConnect();

    try {
      const { employee } = req;
      const { filters = {} } = req.body;
      const result = await notificationService.markAllAsRead(
        employee._id,
        filters
      );

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: {
          modifiedCount: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Mark all read API error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark notifications as read",
      });
    }
  }
}

export default new NotificationMarkAllReadController().handler;
