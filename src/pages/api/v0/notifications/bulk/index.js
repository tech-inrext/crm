import { Controller } from "@framework";
import NotificationService from "../../../../../be/services/NotificationService";

class NotificationBulkController extends Controller {
  constructor() {
    super();
    this.service = new NotificationService();
  }

  post(req, res) {
    return this.service.bulkOperation(req, res);
  }
}

export default new NotificationBulkController().handler;
