import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class MouStatsController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }

  async get(req, res) {
    return this.service.getMouStats(req, res);
  }
}

export default new MouStatsController().handler;
