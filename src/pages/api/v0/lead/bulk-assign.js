import { Controller } from "@framework";
import BulkAssignService from "../../../../be/services/BulkAssignService";

class BulkAssignController extends Controller {
  constructor() {
    super();
    this.service = new BulkAssignService();
  }

  post(req, res) {
    return this.service.bulkAssignLeads(req, res);
  }
}

export default new BulkAssignController().handler;
