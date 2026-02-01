import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";

import { loginAuth } from "../../../../be/middlewares/loginAuth";

class SwitchRoleController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
    // this.userAuth = loginAuth;
    this.skipAuth = ["post"];
  }

  async post(req, res) {
    return loginAuth(req, res, () => 
      this.service.switchRole(req, res));
  }
}

export default new SwitchRoleController().handler;
