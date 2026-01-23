
import { Controller } from "@framework";
import UserStatsService from "@/be/services/analytics/users";

class UserStatsController extends Controller {
  constructor() {
    super();
    this.service = new UserStatsService();
  }

  get(req, res) {
    return this.service.getAllUsers(req, res);
  }
}

export default new UserStatsController().handler;
 