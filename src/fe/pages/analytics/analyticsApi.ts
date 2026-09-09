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

  async getCabBookingActivity(params?: Record<string, any>) {
    return this.get<any>("/cab/bookings", { params });
  }
}

export const analyticsApi = new AnalyticsApi();
