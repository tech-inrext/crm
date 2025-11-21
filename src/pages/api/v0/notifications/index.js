import { Controller } from "@framework";
import dbConnect from "../../../../lib/mongodb.js";
import notificationService from "../../../../services/notification.service";

class NotificationController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    console.log("Notification endpoint hit");

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

      const {
        page = "1",
        limit = "20",
        status,
        type,
        priority,
        fromDate,
        toDate,
      } = req.query;

      // Filter out undefined string values
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      if (status && status !== "undefined") options.status = status;
      if (type && type !== "undefined") options.type = type;
      if (priority && priority !== "undefined") options.priority = priority;
      if (fromDate && fromDate !== "undefined")
        options.fromDate = new Date(fromDate);
      if (toDate && toDate !== "undefined") options.toDate = new Date(toDate);

      const result = await notificationService.getUserNotifications(
        employee._id,
        options
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  }

  async post(req, res) {
    console.log("Create notification endpoint hit");

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

      const notificationData = {
        ...req.body,
        sender: employee._id,
      };

      const notification = await notificationService.createNotification(
        notificationData
      );

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create notification",
      });
    }
  }
}

export default new NotificationController().handler;
