import { Controller } from "@framework";
import dbConnect from "../../../../../lib/mongodb.js";
import { NotificationHelper } from "../../../../../lib/notification-helpers";

class TestNotificationController extends Controller {
  constructor() {
    super();
  }

  async post(req, res) {
    console.log("Test notification endpoint hit");

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

      // Create a test notification for the current user
      await NotificationHelper.notifyLeadStatusUpdate(
        "test-lead-id", // Mock lead ID
        employee._id, // Send to current user
        employee._id, // Sender (same as recipient for test)
        {
          oldStatus: "New",
          newStatus: "Qualified",
          leadId: "TEST-123456",
          company: "Test Company",
          name: employee.name,
          phone: "+1234567890",
        }
      );

      res.status(201).json({
        success: true,
        message:
          "Test notification created successfully! Check your notification bell.",
        data: {
          recipient: employee.name,
          type: "Lead status update test notification",
        },
      });
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test notification",
        error: error.message,
      });
    }
  }
}

export default new TestNotificationController().handler;
