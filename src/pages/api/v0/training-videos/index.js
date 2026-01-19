import { Controller } from "@framework";
import TrainingVideoService from "../../../../be/services/TrainingVideoService";

class TrainingVideoIndexController extends Controller {
  constructor() {
    super();
    this.service = new TrainingVideoService();
  }

  async get(req, res) {
    return this.service.getAllVideos(req, res);
  }

  async post(req, res) {
    return this.service.createVideo(req, res);
  }
}

export default new TrainingVideoIndexController().handler;
