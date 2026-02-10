import { Controller } from "@framework";
import RoleService from "../../../../be/services/RoleService";

class GetAllRoleListController extends Controller {
  constructor() {
    super();
    this.service = new RoleService();
  }

  async get(req, res) {
    return this.service.getAllRoleList(req, res);
  }
}

export default new GetAllRoleListController().handler;
