import { Controller } from "@framework";
import LeadService from "../../../../be/services/LeadService";

class LeadIndexController extends Controller {
  constructor() {
    super();
    this.service = new LeadService();
  }

  get(req, res) {
    return this.service.getAllLeads(req, res);
  }

  post(req, res) {
    return this.service.createLead(req, res);
  }
}

export default new LeadIndexController().handler;
