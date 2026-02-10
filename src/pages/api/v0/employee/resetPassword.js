import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class ResetPasswordController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return this.service.resetPassword(req, res);
  }
}

export default new ResetPasswordController().handler;
