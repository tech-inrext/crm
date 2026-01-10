import { Controller } from "@framework";
import dbConnect from "../../../../../lib/mongodb.js";
import notificationService from "../../../../../services/notification.service";

class NotificationByIdController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    await dbConnect();
    this.getNotification(req, res);
  }

  async put(req, res) {
    await dbConnect();
    this.updateNotification(req, res);
  }

  async delete(req, res) {
    await dbConnect();
    this.deleteNotification(req, res);
  }

  async getNotification(req, res) {
    try {
      const { employee } = req;
      const { id } = req.query;

      // Use a direct findOne query instead of fetching all user notifications
      const notification = await notificationService.getNotificationById(
        id,
        employee._id
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error("Get notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notification",
      });
    }
  }

  async updateNotification(req, res) {
    try {
      const { employee } = req;
      const { id } = req.query;
      const { action, context } = req.body;

      if (action === "mark_read") {
        await notificationService.markAsRead([id], employee._id, context);
      } else if (action === "archive") {
        await notificationService.archiveNotifications([id], employee._id);
      }

      res.status(200).json({
        success: true,
        message: "Notification updated successfully",
      });
    } catch (error) {
      console.error("Update notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update notification",
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { employee } = req;
      const { id } = req.query;

      await notificationService.deleteNotifications([id], employee._id);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }
  }
}

export default new NotificationByIdController().handler;
