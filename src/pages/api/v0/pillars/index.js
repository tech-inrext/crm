import { Controller } from "@framework";
import PillarService from "../../../../be/services/PillarService";

class PillarIndexController extends Controller {
  constructor() {
    super();
    this.service = new PillarService();
  }

  async get(req, res) {
    return this.service.getAllPillars(req, res);
  }

  async post(req, res) {
    return this.service.createPillar(req, res);
  }
}

export default new PillarIndexController().handler;
