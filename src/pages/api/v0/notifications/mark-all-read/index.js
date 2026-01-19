import { Controller } from "@framework";
import NotificationService from "../../../../../be/services/NotificationService";

class NotificationMarkAllReadController extends Controller {
  constructor() {
    super();
    this.service = new NotificationService();
  }

  post(req, res) {
    return this.service.markAllAsRead(req, res);
  }
}

export default new NotificationMarkAllReadController().handler;
