import { Controller } from "@framework";
import PillarService from "../../../../be/services/PillarService";

class PillarByIdController extends Controller {
  constructor() {
    super();
    this.service = new PillarService();
    // Skip framework's default authn for GET
    // this.skipAuth = ["get"];
  }

  async get(req, res) {
    return this.service.getPillarById(req, res);
  }

  async patch(req, res) {
    return this.service.updatePillar(req, res);
  }

  async delete(req, res) {
    return this.service.deletePillar(req, res);
  }
}

export default new PillarByIdController().handler;


