import axios from "axios";
import { Employee } from "@/types/team-hierarchy";
import { API_ENDPOINTS } from "@/constants/team-hierarchy";

export class TeamHierarchyService {
  private static instance: TeamHierarchyService;

  private constructor() {}

  static getInstance(): TeamHierarchyService {
    if (!TeamHierarchyService.instance) {
      TeamHierarchyService.instance = new TeamHierarchyService();
    }
    return TeamHierarchyService.instance;
  }

  async fetchEmployeeList(): Promise<Employee[]> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.EMPLOYEE_LIST}?limit=1000&page=1`,
        { withCredentials: true }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Failed to fetch employee list:", error);
      throw error;
    }
  }

  async fetchHierarchy(managerId: string): Promise<Employee> {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.HIERARCHY}?managerId=${managerId}`,
        { withCredentials: true }
      );
      return response.data?.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to load hierarchy";
      throw new Error(message);
    }
  }
}

export const teamHierarchyService = TeamHierarchyService.getInstance();
