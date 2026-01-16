import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class EmployeeLoginController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return this.service.login(req, res);
  }
}

export default new EmployeeLoginController().handler;
