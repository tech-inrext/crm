import { Controller, HttpStatus } from "@framework";
import LeadService from "../../../../be/services/LeadService";

class LeadIndexController extends Controller {
  constructor() {
    super();
    this.service = new LeadService();
  }

  async get(req, res) {
    return this.service.getAllLeads(req, res);
  }

  async post(req, res) {
    return this.service.createLead(req, res);
  }
}

export default new LeadIndexController().handler;
