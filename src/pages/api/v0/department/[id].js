import { Controller } from "@framework";
import DepartmentService from "../../../../be/services/DepartmentService";

class DepartmentByIdController extends Controller {
  constructor() {
    super();
    this.service = new DepartmentService();
  }

  async get(req, res) {
    return this.service.getDepartmentById(req, res);
  }

  async patch(req, res) {
    return this.service.updateDepartmentDetails(req, res);
  }

  async delete(req, res) {
    return this.service.deleteDepartment(req, res);
  }
}

export default new DepartmentByIdController().handler;
