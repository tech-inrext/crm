import { Controller } from "@framework";
import LeaveService from "../../../../../be/services/LeaveService";

class ManagerActionController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }
  put(req, res) {
    return this.service.managerAction(req, res);
  }
}

export default new ManagerActionController().handler;
