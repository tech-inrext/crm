import BaseService from "@/fe/service/BaseService";
import { LeaveRequestPayload, LeaveActionPayload } from "./types";

class LeaveApi extends BaseService {
  constructor() {
    super("/api/v0/leave");
  }

  async createRequest(data: LeaveRequestPayload) {
    return this.post("/request", data);
  }

  async getMyRequests() {
    return this.get("/my-requests");
  }

  async getManagerPending() {
    return this.get("/manager/pending");
  }

  async managerAction(data: LeaveActionPayload) {
    return this.put("/manager/action", data);
  }

  async getLeaveStats(employeeId?: string) {
    const url = employeeId ? `/stats?employeeId=${employeeId}` : "/stats";
    return this.get<{ success: boolean; data: any }>(url);
  }

  async getAllLeaves(params?: { page?: number; limit?: number; status?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.status && params.status !== "ALL") query.append("status", params.status);
    if (params?.employeeId) query.append("employeeId", params.employeeId);

    const queryString = query.toString();
    const url = queryString ? `/all?${queryString}` : "/all";
    return this.get<{ success: boolean; data: any[]; pagination: any }>(url);
  }
}

export const leaveApi = new LeaveApi();
