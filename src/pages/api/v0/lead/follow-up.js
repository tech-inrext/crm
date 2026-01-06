import { Controller } from "@framework";
import FollowUpService from "../../../../be/services/FollowUpService";

class FollowUpController extends Controller {
  constructor() {
    super();
    this.service = new FollowUpService();
  }

  get(req, res) {
    return this.service.getFollowUpHistory(req, res);
  }

  post(req, res) {
    return this.service.handleFollowUpRequest(req, res);
  }
}

export default new FollowUpController().handler;
