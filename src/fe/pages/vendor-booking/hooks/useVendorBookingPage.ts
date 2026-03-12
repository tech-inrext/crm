import { useState, useCallback } from "react";
import { VendorBooking } from "../types";

export function useVendorBookingPage() {
  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

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
  };
}
