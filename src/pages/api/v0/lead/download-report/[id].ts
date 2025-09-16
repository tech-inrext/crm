import { Controller } from "@framework";
import BulkUploadService from "../../../../../be/services/BulkUploadService";

class DownloadReportController extends Controller {
  constructor() {
    super();
    this.service = new BulkUploadService();
  }
  get(req, res) {
    return this.service.downloadUploadReport(req, res);
  }
}

export default new DownloadReportController().handler;
