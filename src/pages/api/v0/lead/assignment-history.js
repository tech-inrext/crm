import { Controller } from "@framework";
import BulkAssignService from "../../../../be/services/BulkAssignService";

class BulkAssignHistoryController extends Controller {
  constructor() {
    super();
    this.service = new BulkAssignService();
  }

  get(req, res) {
    return this.service.getAssignmentHistory(req, res);
  }
}

export default new BulkAssignHistoryController().handler;
