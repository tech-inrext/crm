import { Controller } from "@framework";
import LandingPopupService from "../../../../be/services/LandingPopupService";

class LandingPopupIndexController extends Controller {
  constructor() {
    super();
    this.service = new LandingPopupService();
  }

  async get(req, res) {
    return this.service.getAllLandingPopups(req, res);
  }

  async post(req, res) {
    return this.service.createLandingPopup(req, res);
  }
}

export default new LandingPopupIndexController().handler;
