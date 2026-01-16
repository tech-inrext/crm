import { Controller } from "@framework";
import NotificationService from "../../../../../be/services/NotificationService";

class NotificationUnreadCountController extends Controller {
  constructor() {
    super();
    this.service = new NotificationService();
  }

  get(req, res) {
    return this.service.getUnreadCount(req, res);
  }
}

export default new NotificationUnreadCountController().handler;
