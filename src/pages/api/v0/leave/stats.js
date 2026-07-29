import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class LeaveStatsController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }
  get(req, res) {
    return this.service.getLeaveStats(req, res);
  }
}

export default new LeaveStatsController().handler;
