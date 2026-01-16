import { Controller } from "@framework";
import EmployeeService from "../../../../../be/services/EmployeeService";

class PublicEmployeeController extends Controller {
  constructor() {
    super();
    this.service = new EmployeeService();
  }
  get(req, res) {
    return this.service.getPublicEmployeeById(req, res);
  }
}

export default new PublicEmployeeController().handler;