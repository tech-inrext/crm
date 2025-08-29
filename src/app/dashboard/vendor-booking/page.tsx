"use client";

import React, { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/ui/Pagination";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import VendorBookingForm from "@/components/cab-booking/VendorBookingForm";
import BookingDetailsDialog from "@/components/cab-booking/BookingDetailsDialog";
import BookingCard from "@/components/cab-booking/BookingCard";
import PermissionGuard from "@/components/PermissionGuard";
import { useCabBooking } from "@/hooks/useCabBooking"; // for updateBookingFields only

type Booking = any; // replace with your real Booking type

const VendorBookingPage = () => {
  // list + loading from vendor API
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dialogs
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // pagination (1-based)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // keep using your existing updater from the shared hook
  const { updateBookingFields } = useCabBooking();

  /** Fetch bookings for the *logged-in* vendor from /api/v0/cab-vendor/getAllBookingForVendor */
  const fetchVendorBookings = useCallback(
    async (pageNum = page, limit = pageSize) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(limit),
        });

        const res = await fetch(
          `/api/v0/cab-vendor/getAllBookingForVendor?${params.toString()}`,
          {
            method: "GET",
            credentials: "include", // like axios.withCredentials
            headers: { Accept: "application/json" },
          }
        );

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(errText || `Request failed ${res.status}`);
        }

        const json = await res.json();
        const { data, pagination } = json || {};
        setBookings(Array.isArray(data) ? data : []);
        setTotal(pagination?.totalItems ?? 0);
      } catch (e: any) {
        console.error("Failed to load vendor bookings:", e);
        setBookings([]);
        setTotal(0);
        setError(e?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  // Initial + whenever page/size changes
  useEffect(() => {
    fetchVendorBookings(page, pageSize);
  }, [page, pageSize, fetchVendorBookings]);

  const handleVendorFormSubmit = async (formData: any) => {
    try {
      const found = bookings.find((b: any) => b._id === bookingId);
      if (!found) {
        console.error("Booking not found for id", bookingId);
        return;
      }

      // persist fields and mark completed
      const payload = { ...formData, status: "completed" };
      if (bookingId && updateBookingFields) {
        const ok = await updateBookingFields(bookingId, payload);
        if (!ok) {
          console.error("Failed to persist vendor form data");
          return;
        }
      }

      // reflect locally in details dialog, then refresh list from server
      const updated = { ...found, ...payload };
      setSelectedBooking(updated);
      setShowDialog(false);
      setDetailsOpen(true);

      // reload current page so cards update
      fetchVendorBookings(page, pageSize);
    } catch (err) {
      console.error("Error submitting vendor form:", err);
    }
  };

  return (
    <PermissionGuard module="cab-vendor" action="read">
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <h1 className="text-2xl font-bold">Vendor Bookings</h1>
        </Box>

        <Box sx={{ mt: 2 }}>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
              {error}
            </Typography>
          ) : bookings.length === 0 ? (
            <div>No vendor bookings found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="relative">
                    <BookingCard
                      booking={booking}
                      onViewDetails={(b) => {
                        setSelectedBooking(b);
                        setDetailsOpen(true);
                      }}
                    />

                    {/* Show form button while active */}
                    {booking.status === "active" && (
                      <div className="absolute top-4 right-4">
                        <button
                          className="px-3 py-1 bg-blue-100 text-blue-900 rounded shadow border border-blue-300"
                          onClick={() => {
                            setBookingId(booking._id);
                            setShowDialog(true);
                          }}
                        >
                          Form
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPage(1);
                    setPageSize(size);
                  }}
                />
              </Box>
            </>
          )}
        </Box>

        {/* Vendor form dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
            <VendorBookingForm
              bookingId={bookingId}
              onClose={() => setShowDialog(false)}
              onSubmit={handleVendorFormSubmit}
            />
          </DialogContent>
        </Dialog>

        {/* Booking details dialog (eye icon) */}
        <BookingDetailsDialog
          booking={selectedBooking}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      </Box>
    </PermissionGuard>
  );
};

export default VendorBookingPage;
