import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class EmployeeController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }
  get(req, res) {
    return this.service.getAllEmployees(req, res);
  }
  post(req, res) {
    return this.service.createEmployee(req, res);
  }
}

export default new EmployeeController().handler;
