import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";

const BASE_URL = "/api/v0/cab-booking";

export const cabBookingApi = {
  async createBooking(data: any) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
  async getBookingById(id: string) {
    const res = await fetch(`${BASE_URL}/${id}`, { credentials: "include" });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async updateStatus(id: string, data: { status: string; vendor?: string }) {
    const res = await fetch(`/api/v0/cab-booking/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async updateFields(id: string, data: Record<string, any>) {
    const res = await fetch(`/api/v0/cab-booking/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw await res.json();
    return res.json();
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

/** 
 * Upload a single File to S3 via the presigned-URL endpoint 
 */
export async function uploadFileToS3(file: File): Promise<{ fileUrl: string }> {
  const presignRes = await fetch("/api/v0/s3/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  
  if (!presignRes.ok) {
    const txt = await presignRes.text().catch(() => "");
    throw new Error(`Failed to get upload URL: ${presignRes.status} ${txt}`);
  }
  
  const { uploadUrl, fileUrl } = await presignRes.json();
  if (!uploadUrl || !fileUrl) throw new Error("Invalid presign response");

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  
  if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);
  return { fileUrl };
}
