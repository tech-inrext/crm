import { userAuth } from "@/be/middlewares/auth";
import UserAnalyticsService from "@/be/services/UserAnalyticsService";

const userAnalyticsService = new UserAnalyticsService();

export default async function handler(req, res) {
  await userAuth(req, res, async () => {
    if (req.method === "GET") {
      return userAnalyticsService.getUserActivity(req, res);
    } else {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  });
}
