import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class AllLeavesController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }
  get(req, res) {
    return this.service.getAllLeaves(req, res);
  }
}

export default new AllLeavesController().handler;
