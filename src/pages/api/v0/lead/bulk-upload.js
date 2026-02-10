import { Controller } from "@framework";
import BulkUploadService from "../../../../be/services/BulkUploadService";

class BulkUploadController extends Controller {
  constructor() {
    super();
    this.service = new BulkUploadService();
  }

  post(req, res) {
    return this.service.bulkUploadLeads(req, res);
  }
}

export default new BulkUploadController().handler;
