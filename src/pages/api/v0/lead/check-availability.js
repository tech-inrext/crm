import { Controller } from "@framework";
import BulkAssignService from "../../../../be/services/BulkAssignService";

class CheckAvailabilityController extends Controller {
  constructor() {
    super();
    this.service = new BulkAssignService();
  }

  get(req, res) {
    return this.service.checkLeadAvailability(req, res);
  }
}

export default new CheckAvailabilityController().handler;
