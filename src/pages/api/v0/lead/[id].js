import { Controller } from "@framework";
import LeadService from "../../../../be/services/LeadService";
import { userAuth } from "@/middlewares/auth";

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

const controller = new LeadByIdController();
export default (req, res) => userAuth(req, res, controller.handler);
