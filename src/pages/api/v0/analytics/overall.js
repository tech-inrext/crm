import { Controller } from "@framework";
import * as OverallAnalyticsService from "@/be/services/analytics/overall";

class OverallAnalyticsController extends Controller {
	constructor() {
		super();
	}

	// GET: overall dashboard stats
	async get(req, res) {
		const result = await OverallAnalyticsService.getOverall({
			userId: req.query.userId,
			employee: req.employee,
		});
		return res.status(200).json(result);
	}

 
}

export default new OverallAnalyticsController().handler;
