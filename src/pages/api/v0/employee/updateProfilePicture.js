import { Controller } from "@framework";
import EmployeeService from "../../../../be/services/EmployeeService";
import { loginAuth } from "../../../../be/middlewares/loginAuth";

class UpdateProfilePictureController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }

  async post(req, res) {
    return loginAuth(req, res, () =>
      this.service.updateProfilePicture(req, res)
    );
  }
}

export default new UpdateProfilePictureController().handler;
