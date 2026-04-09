"use client";

import React, { useCallback } from "react";
import { Box, Dialog, DialogContent } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import VendorBookingForm from "./components/VendorBookingForm";
import BookingDetailsDialog from "@/components/cab-booking/BookingDetailsDialog";
import { useUpdateBookingFieldsMutation } from "./vendorBookingApi";
import { invalidateQueryCache, VENDOR_BOOKING_API_BASE } from "./constants";
import { useVendorBookingPage } from "./hooks/useVendorBookingPage";
import VendorBookingActionBar from "./components/VendorBookingActionBar";
import VendorBookingsList from "./components/VendorBookingsList";
import { VendorBooking } from "./types";
import { uploadFileToS3 } from "./utils/s3";

const VendorBookingPage: React.FC = () => {
  const {
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
    triggerRefetch,
    removeCabBookingQuery,
    markHandledFor,
    setUrlHandled,
  } = useVendorBookingPage();

  const { mutate: doUpdateFields } = useUpdateBookingFieldsMutation();

  // ---------- Form submit ----------
  const handleVendorFormSubmit = useCallback(
    async (formData: any) => {
      if (!activeBookingId || !canWriteVendorBookings) return;

      const payload: Record<string, any> = {
        ...formData,
        status: "payment_due",
      };

      // Upload odometer images if File objects were provided
      try {
        if (formData.odometerStartFile instanceof File) {
          const { fileUrl } = await uploadFileToS3(formData.odometerStartFile);
          payload.odometerStartImageUrl = fileUrl;
        }
        if (formData.odometerEndFile instanceof File) {
          const { fileUrl } = await uploadFileToS3(formData.odometerEndFile);
          payload.odometerEndImageUrl = fileUrl;
        }
      } catch (err) {
        console.error("Failed to upload odometer images:", err);
        return;
      }

      // Remove raw File objects / preview strings from payload
      delete payload.odometerStartFile;
      delete payload.odometerEndFile;
      delete payload.odometerStartPreview;
      delete payload.odometerEndPreview;

      await doUpdateFields(
        { id: activeBookingId, ...payload },
        () => {
          // Show updated booking in details dialog
          const updated = { ...(selectedBooking || {}), ...payload };
          setSelectedBooking(updated as VendorBooking);
          closeForm();
          openDetails(updated as VendorBooking);

          // Bust cache and refetch list
          invalidateQueryCache(VENDOR_BOOKING_API_BASE);
          triggerRefetch();
        },
      );
    },
    [
      activeBookingId,
      canWriteVendorBookings,
      selectedBooking,
      doUpdateFields,
      closeForm,
      openDetails,
      setSelectedBooking,
      triggerRefetch,
    ],
  );

  const handleCloseForm = () => {
    closeForm();
    removeCabBookingQuery();
    setUrlHandled(true);
    markHandledFor(activeBookingId);
  };

  const handleCloseDetails = () => {
    closeDetails();
    removeCabBookingQuery();
    setUrlHandled(true);
    markHandledFor(selectedBooking?._id || null);
  };

  return (
    <PermissionGuard module="cab-vendor" action="read">
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
        <VendorBookingActionBar />

        <Box sx={{ mt: 2 }}>
          <VendorBookingsList
            onViewDetails={openDetails}
            onOpenForm={openForm}
            canWrite={canWriteVendorBookings}
            onReady={setRefetch}
          />
        </Box>

        <PermissionGuard module="cab-vendor" action="write" fallback={null}>
          <Dialog
            open={formOpen}
            onClose={handleCloseForm}
            fullWidth
            maxWidth="sm"
          >
            <DialogContent sx={{ p: 0 }}>
              <VendorBookingForm
                bookingId={activeBookingId}
                onClose={handleCloseForm}
                onSubmit={handleVendorFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </PermissionGuard>

        {/* Booking details dialog */}
        <BookingDetailsDialog
          booking={selectedBooking as any}
          open={detailsOpen}
          onClose={handleCloseDetails}
        />
      </Box>
    </PermissionGuard>
  );
};

export default VendorBookingPage;
