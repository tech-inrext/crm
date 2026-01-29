
import { Controller } from "@framework";
import SiteVisitService from "../../../../be/services/SiteVisitService";

class SiteVisitController extends Controller {
  constructor() {
    super();
    this.service = new SiteVisitService();
  }

  post(req, res) {
    return this.service.createSiteVisit(req, res);
  }
}

export default new SiteVisitController().handler;
