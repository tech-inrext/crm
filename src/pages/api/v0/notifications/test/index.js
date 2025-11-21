import { Controller } from "@framework";

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
}

export default new NotificationTestController().handler;
