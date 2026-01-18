import { Controller } from "@framework";
import { userAuth } from "@/middlewares/auth";
import CabBookingService from "@/be/services/analytics/cabBooking";

class CabBookingController extends Controller {
  async get(req, res) {
    try {
      const { vendorNames, vendorEmails, month, status } = req.query;

      const result = await CabBookingService.getCabBooking({
        vendorNames,
        vendorEmails,
        month,
        status
      });

      res.status(200).json(result);
    } catch (err) {
      console.error("CabBooking analytics error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default (req, res) => userAuth(req, res, new CabBookingController().handler);
