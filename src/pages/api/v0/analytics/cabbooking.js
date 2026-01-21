import { Controller } from "@framework";
import CabBookingService from "@/be/services/analytics/cabBooking";

<<<<<<< HEAD
import { AnalyticsService } from "@/be/services/Analytics";

export default async function handler(req, res) {
  try {
    const { vendorNames, vendorEmails, month, status, avpId, avpName } = req.query;
    const result = await AnalyticsService.getCabBooking({ vendorNames, vendorEmails, month, status, avpId, avpName });
    res.status(200).json(result);
  } catch (err) {
    console.error("CabBooking analytics error:", err);
    res.status(500).json({ error: err.message });
=======
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
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  }
}

export default new CabBookingAnalyticsController().handler;
