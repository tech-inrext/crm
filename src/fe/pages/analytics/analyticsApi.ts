import BaseService from "@/fe/service/BaseService";

class AnalyticsApi extends BaseService {
  constructor() {
    super("/api/v0/analytics");
  }

  // Add analytics specific API methods here
  async getTodayActivity() {
    return this.get("/leads/activity");
  }

  async getUserActivity() {
    return this.get("/user/activity");
  }

  async getCabBookingActivity() {
    return this.get("/cab/bookings");
  }
}

export const analyticsApi = new AnalyticsApi();
