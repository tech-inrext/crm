import { Controller } from "@framework";
import MOUOperationsService from "../../../../../be/services/MOUOperationsService";

class MOUPreviewController extends Controller {
  constructor() {
    super();
    this.service = new MOUOperationsService();
    // this.skipAuth = ["get"];
  }

  async get(req, res) {
    return this.service.previewMOU(req, res);
  }
}

export default new MOUPreviewController().handler;
