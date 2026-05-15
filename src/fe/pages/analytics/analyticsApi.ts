import BaseService from "@/fe/service/BaseService";

class AnalyticsApi extends BaseService {
  constructor() {
    super("/analytics");
  }

  // Add analytics specific API methods here
}

export const analyticsApi = new AnalyticsApi();
