import { Controller } from "@framework";
import DepartmentService from "../../../../be/services/DepartmentService";

class DepartmentIndexController extends Controller {
  constructor() {
    super();
    this.service = new DepartmentService();
  }

  async get(req, res) {
    return this.service.getAllDepartment(req, res);
  }

  async post(req, res) {
    return this.service.createDepartment(req, res);
  }
}

export default new DepartmentIndexController().handler;
