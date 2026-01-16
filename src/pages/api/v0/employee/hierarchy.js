import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class HierarchyController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }

  async get(req, res) {
    return this.service.getHierarchyByManager(req, res);
  }
}

export default new HierarchyController().handler;
