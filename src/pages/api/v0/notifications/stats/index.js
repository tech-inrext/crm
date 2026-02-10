import { Controller } from "@framework";
import NotificationService from "../../../../../be/services/NotificationService";

class NotificationStatsController extends Controller {
  constructor() {
    super();
    this.service = new NotificationService();
  }

  get(req, res) {
    return this.service.getNotificationStats(req, res);
  }
}

export default new NotificationStatsController().handler;
