import { Controller } from "@framework";
import { NotificationHelper } from "@/lib/notification-helpers";
import dbConnect from "@/lib/mongodb.js";

class NotificationTestController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    try {
      console.log("Test endpoint hit");
      console.log("Employee:", req.employee ? "Found" : "Not found");

      res.status(200).json({
        success: true,
        message: "Test endpoint working",
        data: {
          hasEmployee: !!req.employee,
          employeeId: req.employee?._id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Test endpoint error:", error);
      res.status(500).json({
        success: false,
        message: "Test endpoint failed",
        error: error.message,
      });
    }
  }

  async post(req, res) {
    try {
      await dbConnect();

      const { employee } = req;
      const { type = "test", assignedTo } = req.body;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      console.log("Creating test notification...");
      let result;

      if (type === "lead_assigned" && assignedTo) {
        console.log("Testing lead assignment notification");
        result = await NotificationHelper.notifyLeadAssigned(
          "test-lead-id",
          assignedTo,
          employee._id,
          {
            name: "Test Lead",
            phone: "123-456-7890",
            company: "Test Company",
            priority: "HIGH",
          }
        );
      } else if (type === "lead_status") {
        console.log("Testing lead status notification");
        result = await NotificationHelper.notifyLeadStatusUpdate(
          "test-lead-id",
          employee._id,
          "new",
          "contacted",
          {
            name: "Test Lead",
            phone: "123-456-7890",
            company: "Test Company",
          }
        );
      } else {
        // Simple test notification
        console.log("Testing simple notification");
        const notificationService = (
          await import("@/services/notification.service")
        ).default;
        result = await notificationService.createNotification({
          recipient: employee._id,
          type: "SYSTEM_ANNOUNCEMENT",
          title: "Test Notification",
          message:
            "This is a test notification to verify the system is working.",
          metadata: {
            priority: "MEDIUM",
          },
          channels: {
            inApp: true,
            email: false,
          },
        });
      }

      console.log("Test notification result:", result);

      res.status(200).json({
        success: true,
        message: "Test notification sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send test notification",
        error: error.message,
      });
    }
  }
}

export default new NotificationTestController().handler;
