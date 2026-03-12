"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Dialog, DialogContent } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import VendorBookingForm from "./components/VendorBookingForm";
import BookingDetailsDialog from "@/components/cab-booking/BookingDetailsDialog";
import { useUpdateBookingFieldsMutation } from "./vendorBookingApi";
import { invalidateQueryCache, VENDOR_BOOKING_API_BASE } from "./constants";
import { useVendorBookingPage } from "./hooks/useVendorBookingPage";
import VendorBookingPageHeader from "./components/VendorBookingPageHeader";
import VendorBookingsList from "./components/VendorBookingsList";
import { VendorBooking } from "./types";

/** Upload a single File to S3 via the presigned-URL endpoint */
async function uploadFileToS3(file: File): Promise<{ fileUrl: string }> {
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

const VendorBookingPage: React.FC = () => {
  const { getPermissions } = useAuth();
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
  } = useVendorBookingPage();

  const { mutate: doUpdateFields } = useUpdateBookingFieldsMutation();
  const canWriteVendorBookings = getPermissions("cab-vendor").hasWriteAccess;

  // Holds refetch fn exposed by VendorBookingsList
  const refetchRef = useRef<(() => void) | null>(null);

  // ---------- Deep-link: ?cabBooking=1&bookingId=... ----------
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

  useEffect(() => {
    if (typeof window === "undefined" || urlHandled) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cabBooking") !== "1") return;
    const bId = params.get("bookingId");
    if (!bId || isHandledFor(bId)) {
      setUrlHandled(true);
      return;
    }

    fetch(`/api/v0/cab-booking/${bId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        const booking: VendorBooking = res?.data || res;
        if (!booking?._id) return;
        setUrlHandled(true);
        markHandledFor(bId);
        if (booking.status === "active" && canWriteVendorBookings) {
          openForm(booking._id, booking);
        } else {
          openDetails(booking);
        }
      })
      .catch(() => setUrlHandled(true));
  }, [
    urlHandled,
    isHandledFor,
    markHandledFor,
    openForm,
    openDetails,
    canWriteVendorBookings,
  ]);

  const removeCabBookingQuery = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("cabBooking");
    url.searchParams.delete("bookingId");
    window.history.replaceState({}, document.title, url.toString());
  };

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
        (responseData: any) => {
          // Show updated booking in details dialog
          const updated = { ...(selectedBooking || {}), ...payload };
          setSelectedBooking(updated as VendorBooking);
          closeForm();
          openDetails(updated as VendorBooking);

          // Bust cache and refetch list
          invalidateQueryCache(VENDOR_BOOKING_API_BASE);
          refetchRef.current?.();
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
        <VendorBookingPageHeader />

        <Box sx={{ mt: 2 }}>
          <VendorBookingsList
            onViewDetails={openDetails}
            onOpenForm={openForm}
            canWrite={canWriteVendorBookings}
            onReady={(refetch) => {
              refetchRef.current = refetch;
            }}
          />
        </Box>

        <PermissionGuard module="cab-vendor" action="write" fallback={null}>
          <Dialog
            open={formOpen}
            onClose={handleCloseForm}
            fullWidth
            maxWidth="sm"
          >
            <DialogContent>
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
