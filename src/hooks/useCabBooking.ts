import { useState, useEffect, useCallback } from "react";
import { cabBookingApi, projectApi } from "@/services/cab-booking.service";
import { DEFAULT_PROJECTS } from "@/constants/cab-booking";

// options: { autoFetch?: boolean, refetchAfterMutations?: boolean }
export const useCabBooking = (opts = {}) => {
  const { autoFetch = true, refetchAfterMutations = true } = opts;

  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [vendorBookings, setVendorBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = useCallback(async (params) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await cabBookingApi.getAllBookings(params);

      // normalize common response shapes
      if (Array.isArray(res?.data)) {
        setBookings(res.data);
      } else if (Array.isArray(res?.data?.data)) {
        setBookings(res.data.data);
      } else if (Array.isArray(res?.data?.bookings)) {
        setBookings(res.data.bookings);
      } else if (Array.isArray(res?.bookings)) {
        setBookings(res.bookings);
      } else if (Array.isArray(res?.data?.rows)) {
        setBookings(res.data.rows);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError("Failed to load bookings");
      console.error("Error fetching bookings:", err?.response?.data || err?.message || err);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const projectsRes = await projectApi.getAllProjects();
      if (projectsRes?.data?.data?.projects?.length > 0) {
        setProjects(projectsRes.data.data.projects);
      }
    } catch {
      // keep DEFAULT_PROJECTS
    }
  }, []);

  const createBooking = useCallback(async (formData) => {
    // Start create request but don't block caller on the network latency.
    setIsLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      requestedDateTime: new Date(formData.requestedDateTime).toISOString(),
      numberOfClients: Number(formData.numberOfClients),
    };

    // fire-and-forget: kick off network request and handle result in background
    cabBookingApi
      .createBooking(payload)
        .then((res) => {
          setSuccess("Booking created successfully!");
          // Only perform background refetch if the hook was configured to both
          // autoFetch and refetchAfterMutations. Vendor pages set autoFetch=false
          // to avoid calling protected GET endpoints.
          if (refetchAfterMutations && autoFetch) {
            fetchBookings().catch((err) => console.error("Background fetchBookings failed:", err));
          }
        })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to create booking");
      })
      .finally(() => {
        // ensure loading indicator is cleared when background request completes
        setIsLoading(false);
      });

    // Return success immediately so UI can proceed (optimistic UX).
    setIsLoading(false);
    return true;
  }, [fetchBookings, refetchAfterMutations]);

  const updateBookingStatus = useCallback(async (bookingId, status, vendorId) => {
    try {
      setIsLoading(true);
      setError("");
      const payload = { status };
      if (vendorId) payload.vendor = vendorId;
      await cabBookingApi.updateStatus(bookingId, payload);
  setSuccess("Booking status updated!");
  if (refetchAfterMutations && autoFetch) await fetchBookings();
    } catch {
      setError("Failed to update booking status");
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookings, refetchAfterMutations]);

  const updateBookingFields = useCallback(async (bookingId, fields) => {
    try {
      setIsLoading(true);
      setError("");
      const res = await cabBookingApi.updateFields(bookingId, fields);
  setSuccess("Booking updated!");
  if (refetchAfterMutations && autoFetch) await fetchBookings();
      return Boolean(res && (res.success ?? true));
    } catch (err) {
      setError("Failed to update booking fields");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookings, refetchAfterMutations]);

  const updateTracking = useCallback(async (bookingId, trackingData) => {
    try {
      setIsLoading(true);
      setError("");
      await cabBookingApi.updateTracking(bookingId, trackingData);
  setSuccess("Tracking info updated!");
  if (refetchAfterMutations && autoFetch) await fetchBookings();
    } catch {
      setError("Failed to update tracking info");
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookings, refetchAfterMutations]);

  const cancelBooking = useCallback(async (bookingId) => {
    try {
      setIsLoading(true);
      setError("");
      await cabBookingApi.cancelBooking(bookingId);
  setSuccess("Booking cancelled!");
  if (refetchAfterMutations && autoFetch) await fetchBookings();
    } catch {
      setError("Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookings, refetchAfterMutations]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (!autoFetch) return; // ⛔ don't auto-read if you’re on vendor page
    (async () => {
      await Promise.all([fetchProjects(), fetchBookings()]);
    })();
  }, [autoFetch, fetchProjects, fetchBookings]);

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
