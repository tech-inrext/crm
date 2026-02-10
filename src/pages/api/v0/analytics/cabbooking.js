import { Controller } from "@framework";
import CabBookingService from "@/be/services/analytics/cabBooking";

class CabBookingAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = CabBookingService; 
  }

  get(req, res) {
    return this.service.getCabBooking({
      vendorNames: req.query.vendorNames,
      vendorEmails: req.query.vendorEmails,
      month: req.query.month,
      status: req.query.status,
    }).then((data) => res.status(200).json(data));
  }
}

export default new CabBookingAnalyticsController().handler;
