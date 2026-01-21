import { Controller } from "@framework";
import TeamService from "@/be/services/analytics/TeamService";

class TeamController extends Controller {
  constructor() {
    super();
    this.service = new TeamService();
  }

  // GET /api/teams
  get(req, res) {
    return this.service.getMyTeam(req, res);
  }
}

export default new TeamController().handler;
