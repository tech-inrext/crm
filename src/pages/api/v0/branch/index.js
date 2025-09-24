import { Controller } from "@framework";
import BranchService from "../../../../be/services/BranchService";

class BranchController extends Controller {
  constructor() {
    super();
    this.service = new BranchService();
  }
  get(req, res) {
    return this.service.getAllBranches(req, res);
  }
  post(req, res) {
    return this.service.createBranch(req, res);
  }
}

export default new BranchController().handler;
