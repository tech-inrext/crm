import { Controller } from "@framework";
import BulkAssignService from "../../../../be/services/BulkAssignService";

class BulkAssignRevertController extends Controller {
  constructor() {
    super();
    this.service = new BulkAssignService();
  }

  post(req, res) {
    return this.service.revertBulkAssign(req, res);
  }
}

export default new BulkAssignRevertController().handler;
