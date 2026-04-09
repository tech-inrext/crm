import { useState, useCallback, useEffect, useRef } from "react";
import { VendorBooking } from "../types";
import { useAuth } from "@/contexts/AuthContext";

export function useVendorBookingPage() {
  const { getPermissions } = useAuth();
  const canWriteVendorBookings = getPermissions("cab-vendor").hasWriteAccess;

  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  // Holds refetch fn exposed by VendorBookingsList
  const refetchRef = useRef<(() => void) | null>(null);

  const setRefetch = useCallback((refetch: () => void) => {
    refetchRef.current = refetch;
  }, []);

  const openDetails = useCallback((booking: VendorBooking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedBooking(null);
  }, []);

  const openForm = useCallback((bookingId: string, booking?: VendorBooking) => {
    setActiveBookingId(bookingId);
    if (booking) setSelectedBooking(booking);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setActiveBookingId(null);
  }, []);

  // ---------- URL Handling ----------
  const [urlHandled, setUrlHandled] = useState(false);

  const handledKey = (id: string) => `vendorBookingHandled_${id}`;
  
  const isHandledFor = useCallback((id: string | null) => {
    if (!id || typeof window === "undefined") return false;
    try {
      return Boolean(sessionStorage.getItem(handledKey(id)));
    } catch {
      return false;
    }
  }, []);

  const markHandledFor = useCallback((id: string | null) => {
    if (!id || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(handledKey(id!), "1");
    } catch {}
  }, []);

  const removeCabBookingQuery = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("cabBooking");
    url.searchParams.delete("bookingId");
    window.history.replaceState({}, document.title, url.toString());
  }, []);

  const handleDeepLink = useCallback(async () => {
    if (typeof window === "undefined" || urlHandled) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cabBooking") !== "1") return;
    const bId = params.get("bookingId");
    if (!bId || isHandledFor(bId)) {
      setUrlHandled(true);
      return;
    }

    try {
      const response = await fetch(`/api/v0/cab-booking/${bId}`, { credentials: "include" });
      const res = await response.json();
      const booking: VendorBooking = res?.data || res;
      if (!booking?._id) return;
      setUrlHandled(true);
      markHandledFor(bId);
      if (booking.status === "active" && canWriteVendorBookings) {
        openForm(booking._id, booking);
      } else {
        openDetails(booking);
      }
    } catch (error) {
       console.error("Failed to handle deep-link:", error);
       setUrlHandled(true);
    }
  }, [urlHandled, isHandledFor, markHandledFor, openForm, openDetails, canWriteVendorBookings]);

  useEffect(() => {
    handleDeepLink();
  }, [handleDeepLink]);

  return {
    selectedBooking,
    setSelectedBooking,
    detailsOpen,
    formOpen,
    activeBookingId,
    openDetails,
    closeDetails,
    openForm,
    closeForm,
    canWriteVendorBookings,
    setRefetch,
    triggerRefetch: () => refetchRef.current?.(),
    removeCabBookingQuery,
    markHandledFor,
    setUrlHandled
  };
}
