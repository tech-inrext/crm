import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class EmployeeLogoutController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return this.service.logout(req, res);
  }
}

export default new EmployeeLogoutController().handler;
