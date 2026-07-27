import { Controller } from "@framework";
import LeaveService from "../../../../../be/services/LeaveService";

class ManagerPendingLeavesController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }
  get(req, res) {
    return this.service.getManagerPendingLeaves(req, res);
  }
}

export default new ManagerPendingLeavesController().handler;
