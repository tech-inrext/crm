import { Controller } from "@framework";
import RoleService from "../../../../be/services/RoleService";

class RoleIndexController extends Controller {
  constructor() {
    super();
    this.service = new RoleService();
  }

  async get(req, res) {
    return this.service.getAllRoles(req, res);
  }

  async post(req, res) {
    return this.service.createRole(req, res);
  }
}

export default new RoleIndexController().handler;
