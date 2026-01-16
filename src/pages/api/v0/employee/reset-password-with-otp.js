import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class ResetPasswordWithOTPController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return this.service.resetPasswordWithOTP(req, res);
  }
}

export default new ResetPasswordWithOTPController().handler;
