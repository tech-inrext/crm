import axios from "axios";

// Use the correct API base URL and version prefix
const API_URL = "http://localhost:3000/api/v0";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response);
    return Promise.reject(error);
  }
);

export const projectApi = {
  getAllProjects: (params?: any) => api.get("/projects", { params }),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (projectData: any) => api.post("/projects", projectData),
  updateProject: (id: string, projectData: any) => api.patch(`/projects/${id}`, projectData),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

export const cabBookingApi = {
  getAllBookings: (params: any = {}) => api.get("/cab-bookings", { params }),
  getMyBookings: (params: any = {}) => api.get("/cab-bookings/my-bookings", { params }),
  createBooking: (bookingData: any) => api.post("/cab-bookings", bookingData),
  getBooking: (id: string) => api.get(`/cab-bookings/${id}`),
  updateStatus: (id: string, statusData: any) => api.patch(`/cab-bookings/${id}/status`, statusData),
  updateTracking: (id: string, trackingData: any) => api.patch(`/cab-bookings/${id}/tracking`, trackingData),
  cancelBooking: (id: string) => api.patch(`/cab-bookings/my-bookings/${id}/cancel`),
  getAvailableVehicles: () => api.get("/cab-bookings/vehicles/available"),
  getProjects: () => api.get("/projects"),
};

// ...other APIs as needed...
export default api;
