import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";
import { loginAuth } from "../../../../be/middlewares/loginAuth";

class UserProfileController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }

  async get(req, res) {
    // Wrap service call with loginAuth middleware
    return loginAuth(req, res, () =>
      this.service.getLoggedInUserProfile(req, res)
    );
  }
}

export default new UserProfileController().handler;
