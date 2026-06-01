import { Controller } from "@framework";
import LandingPopupService from "../../../../../be/services/LandingPopupService";

class PublicLandingPopupController extends Controller {
  constructor() {
    super();
    this.service = new LandingPopupService();
    this.skipAuth = ["get"];
  }

  async get(req, res) {
    return this.service.getLandingPopup(req, res);
  }
}

export default new PublicLandingPopupController().handler;
