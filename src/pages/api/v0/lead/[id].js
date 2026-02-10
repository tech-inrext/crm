import { Controller } from "@framework";
import LeadService from "../../../../be/services/LeadService";

class LeadByIdController extends Controller {
  constructor() {
    super();
    this.service = new LeadService();
  }

  async get(req, res) {
    return this.service.getLeadById(req, res);
  }

  async patch(req, res) {
    return this.service.updateLeadDetails(req, res);
  }
}

export default new LeadByIdController().handler;
