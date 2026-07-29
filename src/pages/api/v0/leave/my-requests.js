import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class MyLeavesController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }
  get(req, res) {
    return this.service.getMyLeaves(req, res);
  }
}

export default new MyLeavesController().handler;
