import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

class RequestOTPController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return this.service.requestOTP(req, res);
  }
}

export default new RequestOTPController().handler;
