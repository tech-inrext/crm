import { Controller } from "@framework";
import * as VendorAnalyticsService from "@/be/services/analytics/vendor";
import { userAuth } from "@/middlewares/auth";

class VendorAnalyticsController extends Controller {
  constructor() {
    super();
  }

  async get(req, res) {
    try {
      const { vendorNames, vendorEmails } = req.query;
      const result = await VendorAnalyticsService.getVendor({ vendorNames, vendorEmails });
      return res.status(200).json(result);
    } catch (err) {
      console.error("Vendor API Error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new VendorAnalyticsController().handler;
