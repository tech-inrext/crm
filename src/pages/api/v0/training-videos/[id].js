import { Controller } from "@framework";
import TrainingVideoService from "../../../../be/services/TrainingVideoService";

class TrainingVideoByIdController extends Controller {
  constructor() {
    super();
    this.service = new TrainingVideoService();
  }

  async get(req, res) {
    return this.service.getVideoById(req, res);
  }

  async patch(req, res) {
    return this.service.updateVideo(req, res);
  }

  async delete(req, res) {
    return this.service.deleteVideo(req, res);
  }
}

export default new TrainingVideoByIdController().handler;
