import { Controller } from "@framework";
import FollowUpService from "../../../../be/services/FollowUpService";

class FeedbackSubmissionController extends Controller {
  constructor() {
    super();
    this.service = new FollowUpService();
  }

  get(req, res) {
    return this.service.getFeedbackSubmission(req, res);
  }
}

export default new FeedbackSubmissionController().handler;
