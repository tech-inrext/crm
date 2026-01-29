import { Controller } from "@framework";
import MOUOperationsService from "../../../../../be/services/MOUOperationsService";

class MOUResendMailController extends Controller {
  constructor() {
    super();
    this.service = new MOUOperationsService();
  }

  async post(req, res) {
    return this.service.resendMOUMail(req, res);
  }
}

export default new MOUResendMailController().handler;
