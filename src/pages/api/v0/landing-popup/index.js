import { Controller } from "@framework";
import LandingPopupService from "../../../../be/services/LandingPopupService";

class LandingPopupIndexController extends Controller {
  constructor() {
    super();
    this.service = new LandingPopupService();
  }

  async post(req, res) {
    return this.service.createLandingPopup(req, res);
  }

  async patch(req, res) {
    return this.service.updateLandingPopup(req, res);
  }

  async delete(req, res) {
    return this.service.deleteLandingPopup(req, res);
  }
}

export default new LandingPopupIndexController().handler;
