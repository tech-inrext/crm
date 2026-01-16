import { Controller } from "@framework";
import NotificationService from "../../../../be/services/NotificationService";

class NotificationController extends Controller {
  constructor() {
    super();
    this.service = new NotificationService();
  }

  get(req, res) {
    return this.service.getUserNotifications(req, res);
  }

  post(req, res) {
    return this.service.createNotification(req, res);
  }
}

export default new NotificationController().handler;
