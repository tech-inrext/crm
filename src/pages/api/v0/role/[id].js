import { Controller } from "@framework";
import RoleService from "../../../../be/services/RoleService";

class RoleByIdController extends Controller {
  constructor() {
    super();
    this.service = new RoleService();
  }

  async get(req, res) {
    return this.service.getRoleById(req, res);
  }

  async patch(req, res) {
    return this.service.updateRoleDetails(req, res);
  }
}

export default new RoleByIdController().handler;
