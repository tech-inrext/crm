import { useState, useEffect } from "react";
import { Booking, Project } from "@/types/cab-booking";
import { cabBookingApi, projectApi } from "@/services/cab-booking.service";
import { DEFAULT_PROJECTS } from "@/constants/cab-booking";

export const useCabBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [vendorBookings, setVendorBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await cabBookingApi.getAllBookings();
      console.log("Bookings API response:", res);
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (Array.isArray(res.data?.data)) {
        setBookings(res.data.data);
      } else if (Array.isArray(res.data?.bookings)) {
        setBookings(res.data.bookings);
      } else if (Array.isArray(res.bookings)) {
        setBookings(res.bookings);
      } else if (Array.isArray(res.data?.rows)) {
        setBookings(res.data.rows);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError("Failed to load bookings");
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsRes = await projectApi.getAllProjects();
      if (projectsRes.data?.data?.projects?.length > 0) {
        setProjects(projectsRes.data.data.projects);
      }
    } catch {
      // fallback to DEFAULT_PROJECTS
    }
  };

  const createBooking = async (formData: any) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await cabBookingApi.createBooking({
        ...formData,
        requestedDateTime: new Date(formData.requestedDateTime).toISOString(),
        numberOfClients: Number(formData.numberOfClients),
      });
      setSuccess("Booking created successfully!");
      await fetchBookings();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, vendorId?: string) => {
    try {
      setIsLoading(true);
      setError("");
      const payload: any = { status };
      if (vendorId) payload.vendor = vendorId;
      await cabBookingApi.updateStatus(bookingId, payload);
      setSuccess("Booking status updated!");
      await fetchBookings();
    } catch {
      setError("Failed to update booking status");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingFields = async (bookingId: string, fields: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError("");
  const res = await cabBookingApi.updateFields(bookingId, fields);
  setSuccess("Booking updated!");
  await fetchBookings();
  return res && res.success;
    } catch (err) {
      setError("Failed to update booking fields");
  return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTracking = async (bookingId: string, trackingData: any) => {
    try {
      setIsLoading(true);
      setError("");
      await cabBookingApi.updateTracking(bookingId, trackingData);
      setSuccess("Tracking info updated!");
      await fetchBookings();
    } catch {
      setError("Failed to update tracking info");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError("");
      await cabBookingApi.cancelBooking(bookingId);
      setSuccess("Booking cancelled!");
      await fetchBookings();
    } catch {
      setError("Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchProjects(), fetchBookings()]);
    };
    initializeData();
  }, []);

  return {
    bookings,
    projects,
    vendorBookings,
    isLoading,
    isLoadingVendor,
    error,
    success,
    fetchBookings,
    createBooking,
    updateBookingStatus,
  updateBookingFields,
    updateTracking,
    cancelBooking,
    clearMessages,
  };
};
