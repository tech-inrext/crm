<<<<<<< HEAD
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  await dbConnect();
  try {
    // Get logged-in user's ID
    const loggedInUserId = req.employee?._id;
    if (!loggedInUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Count employees whose managerId matches logged-in user
    const myTeamsCount = await Employee.countDocuments({ managerId: loggedInUserId });

    return res.status(200).json({ success: true, myTeamsCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
=======
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
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
