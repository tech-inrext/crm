import BaseService from "@/fe/service/BaseService";

class AnalyticsApi extends BaseService {
  constructor() {
    super("/api/v0/analytics");
  }

  // Add analytics specific API methods here
  async getTodayActivity() {
    return this.get("/leads/activity");
  }
}

export const analyticsApi = new AnalyticsApi();
