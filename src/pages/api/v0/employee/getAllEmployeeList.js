import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class GetAllEmployeeListController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }

  async get(req, res) {
    return this.service.getAllEmployeeList(req, res);
  }
}

export default new GetAllEmployeeListController().handler;
