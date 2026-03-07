import { Controller } from "@framework";
import LeadService from "@/be/services/LeadService";

class LeadAssignController extends Controller {
  constructor() {
    super();
    this.service = new LeadService();
  }

  put(req, res) {
    return this.service.assignLead(req, res);
  }
}

export default new LeadAssignController().handler;
