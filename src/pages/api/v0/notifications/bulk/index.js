import { Controller } from "@framework";
import dbConnect from "@/lib/mongodb.js";
import notificationService from "@/services/notification.service";

class NotificationBulkController extends Controller {
  constructor() {
    super();
  }

  async post(req, res) {
    await dbConnect();

    try {
      const { employee } = req;
      const { notificationIds, action = "read", context = {} } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        res.status(400).json({
          success: false,
          message: "Invalid notification IDs provided",
        });
        return;
      }

      let result;
      switch (action) {
        case "read":
          result = await notificationService.markAsRead(
            notificationIds,
            employee._id,
            context
          );
          break;
        case "archive":
          result = await notificationService.archiveNotifications(
            notificationIds,
            employee._id
          );
          break;
        case "delete":
          result = await notificationService.deleteNotifications(
            notificationIds,
            employee._id
          );
          break;
        default:
          res.status(400).json({
            success: false,
            message: "Invalid action specified",
          });
          return;
      }

      res.status(200).json({
        success: true,
        message: `Notifications ${action} successfully`,
        data: {
          modifiedCount: result.modifiedCount || result.deletedCount,
        },
      });
    } catch (error) {
      console.error("Bulk operation API error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to ${req.body.action || "process"} notifications`,
      });
    }
  }
}

export default new NotificationBulkController().handler;
