import { Controller } from "@framework";
import NotificationService from "../../../../../be/services/NotificationService";

class NotificationByIdController extends Controller {
  constructor() {
    super();
    this.service = new NotificationService();
  }

  get(req, res) {
    return this.service.getNotificationById(req, res);
  }

  put(req, res) {
    return this.service.updateNotification(req, res);
  }

  delete(req, res) {
    return this.service.deleteNotification(req, res);
  }
}

export default new NotificationByIdController().handler;
