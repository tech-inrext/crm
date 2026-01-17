import { Controller } from "@framework";
import EmployeeService from "../../../../../be/services/EmployeeService";

class PublicEmployeeController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    this.skipAuth = ["get"];
  }
  get(req, res) {
    return this.service.getEmployeeById(req, res);
  }
}

export default new PublicEmployeeController().handler;