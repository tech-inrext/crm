import { Controller } from "@framework";
import BulkUploadService from "../../../../be/services/BulkUploadService";

class UploadStatusController extends Controller {
  constructor() {
    super();
    this.service = new BulkUploadService();
  }
  get(req, res) {
    return this.service.getUploadStatus(req, res);
  }
}

export default new UploadStatusController().handler;
