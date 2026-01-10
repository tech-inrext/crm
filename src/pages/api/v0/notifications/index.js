import { Controller } from "@framework";
import dbConnect from "../../../../lib/mongodb.js";
import notificationService from "../../../../services/notification.service";

class NotificationController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    try {
      await dbConnect();
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const {
        page = 1,
        limit = 20,
        status,
        type,
        priority,
        fromDate,
        toDate,
      } = req.query;

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid pagination parameters",
        });
      }

      const options = {
        page: pageNum,
        limit: limitNum,
      };

      if (status && status !== "undefined") options.status = status;
      if (type && type !== "undefined") options.type = type;
      if (priority && priority !== "undefined") options.priority = priority;

      if (fromDate && fromDate !== "undefined") {
        const date = new Date(fromDate);
        if (!isNaN(date.getTime())) options.fromDate = date;
      }

      if (toDate && toDate !== "undefined") {
        const date = new Date(toDate);
        if (!isNaN(date.getTime())) options.toDate = date;
      }

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
    try {
      await dbConnect();
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
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
