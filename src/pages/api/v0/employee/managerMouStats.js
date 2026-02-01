import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class ManagerMouStatsController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }

  async get(req, res) {
    return this.service.getManagerMouStats(req, res);
  }
}

export default new ManagerMouStatsController().handler;
