import { Controller } from "@framework";
import LandingPopupService from "../../../../be/services/LandingPopupService";

class LandingPopupByIdController extends Controller {
  constructor() {
    super();
    this.service = new LandingPopupService();
  }

  async patch(req, res) {
    return this.service.updateLandingPopup(req, res);
  }

  async delete(req, res) {
    return this.service.deleteLandingPopup(req, res);
  }
}

export default new LandingPopupByIdController().handler;
