import { Booking } from "@/types/cab-booking";

const BASE_URL = "/api/v0/cab-booking";

export const cabBookingApi = {
  async createBooking(data: any) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getAllBookings(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}${query ? `?${query}` : ""}`);
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async updateStatus(id: string, data: { status: string }) {
    throw new Error("updateStatus not implemented in backend");
  },

  async updateTracking(
    id: string,
    data: { currentLocation: string; estimatedArrival: string }
  ) {
    throw new Error("updateTracking not implemented in backend");
  },

  async cancelBooking(id: string) {
    throw new Error("cancelBooking not implemented in backend");
  },
};

// Placeholder for project API - replace with actual implementation
export const projectApi = {
  async getAllProjects() {
    // This should be replaced with actual API call
    return { data: { data: { projects: [] } } };
  },
};
