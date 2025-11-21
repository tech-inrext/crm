import { Controller } from "@framework";
import dbConnect from "../../../../../lib/mongodb.js";
import notificationService from "../../../../../services/notification.service";

class NotificationUnreadCountController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    console.log("Unread count endpoint hit");

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

      const unreadCount = await notificationService.getUnreadCount(
        employee._id
      );

      res.status(200).json({
        success: true,
        data: {
          unreadCount,
        },
      });
    } catch (error) {
      console.error("Unread count API error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get unread count",
      });
    }
  }
}

export default new NotificationUnreadCountController().handler;
