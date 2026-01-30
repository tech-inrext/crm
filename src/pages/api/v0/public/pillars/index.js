import { Controller } from "@framework";
import PillarService from "../../../../../be/services/PillarService";

class PillarIndexController extends Controller {
  constructor() {
    super();
    this.service = new PillarService();
    this.skipAuth = ["get"];
  }

  async get(req, res) {
    return this.service.getAllPillars(req, res);
  }

 
}

export default new PillarIndexController().handler;
