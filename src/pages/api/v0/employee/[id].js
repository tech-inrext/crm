import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmolyeeService";

class EmployeeByIdController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }
  get(req, res) {
    return this.service.getEmployeeById(req, res);
  }
  patch(req, res) {
    return this.service.updateEmployeeDetails(req, res);
  }
}

export default new EmployeeByIdController().handler;
