import { Controller } from "@framework";
import BulkAssignService from "../../../../be/services/BulkAssignService";

class DownloadBatchController extends Controller {
  constructor() {
    super();
    this.service = new BulkAssignService();
  }

  get(req, res) {
    return this.service.downloadBatchReport(req, res);
  }
}

export default new DownloadBatchController().handler;
