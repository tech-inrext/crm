import { Controller } from "@framework";
import ProjectService from "../../../../be/services/ProjectService";

class ProjectIndexController extends Controller {
  constructor() {
    super();
    this.service = new ProjectService();
    // Original file did not have any auth middleware, so we skip auth for both methods to preserve logic.
    // this.skipAuth = ["get", "post"];
  }

  async get(req, res) {
    return this.service.getAllProjects(req, res);
  }

  async post(req, res) {
    return this.service.createProject(req, res);
  }
}

export default new ProjectIndexController().handler;
