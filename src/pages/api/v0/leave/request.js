import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class LeaveRequestController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }
  post(req, res) {
    return this.service.createLeaveRequest(req, res);
  }
}

export default new LeaveRequestController().handler;
