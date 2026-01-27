import { Controller } from "@framework";
import MOUOperationsService from "../../../../../be/services/MOUOperationsService";

class MOUApproveController extends Controller {
  constructor() {
    super();
    this.service = new MOUOperationsService();
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return this.service.approveAndSendMOU(req, res);
  }
}

export default new MOUApproveController().handler;
