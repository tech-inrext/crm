import { Controller } from "@framework";

class NotificationSimpleController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    console.log("Simple notification endpoint hit");

    try {
      const { employee } = req;
      console.log("Employee ID:", employee?._id);

      res.status(200).json({
        success: true,
        message: "Simple notification endpoint working",
        data: {
          notifications: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        },
      });
    } catch (error) {
      console.error("Simple notification error:", error);
      res.status(500).json({
        success: false,
        message: "Simple notification failed",
      });
    }
  }
}

export default new NotificationSimpleController().handler;
