import { Controller } from "@framework";
import VendorAnalyticsService from "@/be/services/analytics/vendor";

class VendorAnalyticsController extends Controller {
  constructor() {
    super();
    this.service = new VendorAnalyticsService();
  }

  get(req, res) {
    return this.service.getVendor(req, res);
  }
}

export default new VendorAnalyticsController().handler;
