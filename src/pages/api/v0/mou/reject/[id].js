import { Controller } from "@framework";
import MOUOperationsService from "../../../../../be/services/MOUOperationsService";

class MOURejectController extends Controller {
  constructor() {
    super();
    this.service = new MOUOperationsService();
  }

  async post(req, res) {
    return this.service.rejectMOU(req, res);
  }
}

export default new MOURejectController().handler;
