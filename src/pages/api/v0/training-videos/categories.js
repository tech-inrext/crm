import { Controller } from "@framework";
import TrainingVideoService from "../../../../be/services/TrainingVideoService";

class TrainingVideoCategoriesController extends Controller {
  constructor() {
    super();
    this.service = new TrainingVideoService();
  }

  async get(req, res) {
    return this.service.getCategories(req, res);
  }
}

export default new TrainingVideoCategoriesController().handler;
