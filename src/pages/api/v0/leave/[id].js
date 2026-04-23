import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class LeaveIdController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }

  async put(req, res) {
    return this.service.updateLeaveStatus(req, res);
  }

  async patch(req, res) {
    return this.service.updateLeaveStatus(req, res);
  }
}

export default new LeaveIdController().handler;