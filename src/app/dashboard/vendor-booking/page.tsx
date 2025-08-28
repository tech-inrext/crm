"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/ui/Pagination";
import Typography from "@mui/material/Typography";
import { Box, Dialog, DialogContent } from "@mui/material";
import VendorBookingForm from "@/components/cab-booking/VendorBookingForm";
import BookingDetailsDialog from "@/components/cab-booking/BookingDetailsDialog";
import { useCabBooking } from "@/hooks/useCabBooking";
import BookingCard from "@/components/cab-booking/BookingCard";
import { useAuth } from "@/contexts/AuthContext";
import PermissionGuard from "@/components/PermissionGuard";

const VendorBookingPage = () => {
  // Booking details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showDialog, setShowDialog] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { bookings, fetchBookings, isLoading, updateBookingFields } =
    useCabBooking();
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  // For testing: show all bookings assigned to any vendor
  const vendorBookings = bookings.filter((b) => b.vendor);
  const totalBookings = vendorBookings.length;
  const paginatedBookings = vendorBookings.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleVendorFormSubmit = async (formData: any) => {
    // Try to update backend; only close the form and show details on success
    try {
      const found = bookings.find((b: any) => b._id === bookingId);
      if (!found) {
        console.error("Booking not found for id", bookingId);
        return;
      }

      // persist fields to backend and mark booking completed so form can't be reopened
      const payload = { ...formData, status: "completed" };
      if (bookingId && updateBookingFields) {
        const ok = await updateBookingFields(bookingId, payload);
        if (!ok) {
          console.error("Failed to persist vendor form data");
          return;
        }
      }

      // update local selection and then close form
      const updated = { ...found, ...payload };
      setSelectedBooking(updated);
      setShowDialog(false);
      setDetailsOpen(true);
    } catch (err) {
      console.error("Error submitting vendor form:", err);
    }
  };
  // For production: filter for current vendor only
  // const vendorBookings = bookings.filter(b => b.vendor === user?._id);

  return (
    <>
      <PermissionGuard module="vendor" action="read">
        <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
          <Box display="flex" alignItems="center" mb={2}>
            <h1 className="text-2xl font-bold">Vendor Bookings</h1>
          </Box>
          <Box sx={{ mt: 2 }}>
            {isLoading ? (
              <div>Loading...</div>
            ) : totalBookings === 0 ? (
              <div>No vendor bookings found.</div>
            ) : (
              <>
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedBookings.map((booking) => (
                      <div key={booking._id} className="relative">
                        <BookingCard
                          booking={booking}
                          onViewDetails={(b) => {
                            setSelectedBooking(b);
                            setDetailsOpen(true);
                          }}
                        />
                        {/* Form button inside the vendor card */}
                        {booking.vendor && booking.status === "active" && (
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

                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                  >
                    <Pagination
                      page={page}
                      pageSize={pageSize}
                      total={totalBookings}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </Box>
                </div>
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
                {/* Booking details dialog triggered by eye icon */}
                <BookingDetailsDialog
                  booking={selectedBooking}
                  open={detailsOpen}
                  onClose={() => setDetailsOpen(false)}
                />
              </>
            )}
          </Box>
        </Box>
      </PermissionGuard>
    </>
  );
};

export default VendorBookingPage;
