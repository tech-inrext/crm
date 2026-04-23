import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class LeaveByIdController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }

  async get(req, res) {
    return this.service.getLeaveById(req, res);
  }

  async put(req, res) {
    return this.service.updateLeaveStatus(req, res);
  }

  async delete(req, res) {
    return this.service.deleteLeave(req, res);
  }
}

export default new LeaveByIdController().handler;