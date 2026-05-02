"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import { useCabBooking } from "@/fe/pages/cab-booking/hooks/useCabBooking";
import { CabBookingProps } from "@/fe/pages/cab-booking/types/cab-booking";
import {
  BookingsList,
  Notification,
  VendorBookingForm,
} from "@/fe/pages/cab-booking/components";
import BookingDetailsDialog from "@/fe/pages/cab-booking/components/BookingDetailsDialog";
import { cabBookingApi } from "@/fe/pages/cab-booking/cabBookingApi";
import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";
import {
  containerSx,
  loadingContainerSx,
  contentGridSx,
  listPaperSx,
  scrollContainerSx,
  statusFilterContainerSx,
} from "./styles";
import { CabBookingActionBar } from "./components";
import { Box, CircularProgress, Typography, Dialog, DialogContent } from "@mui/material";

const CabBooking: React.FC<CabBookingProps> = ({
  defaultView = "tracking",
}) => {
  const router = useRouter();
  const [activeView, setActiveView] =
    useState<CabBookingProps["defaultView"]>(defaultView);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [vendorBookingId, setVendorBookingId] = useState<string | null>(null);
  
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      (async () => {
        try {
          setFetchLoading(true);
          const res = await cabBookingApi.getBookingById(bookingId);
          if (res?.success && res?.data) {
            setViewingBooking(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch deep-linked booking:", err);
        } finally {
          setFetchLoading(false);
        }
      })();
    }
  }, []);

  const {
    bookings,
    projects,
    isLoading,
    error,
    success,
    clearMessages,
  } = useCabBooking();

  const [refreshKey, setRefreshKey] = useState(0);



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <PermissionGuard module="cab-booking">
      <Box sx={containerSx}>
        <Notification
          error={error}
          success={success}
          onClear={clearMessages}
          autoClose={true}
          autoCloseDelay={3000}
        />

        <CabBookingActionBar 
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <Box sx={contentGridSx}>
          <Box sx={listPaperSx}>
            <Box sx={scrollContainerSx}>
              {activeView === "tracking" && (
                <BookingsList 
                  statusFilter={statusFilter} 
                  refreshKey={refreshKey} 
                  search={search}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Dialog
          open={showVendorDialog}
          onClose={() => setShowVendorDialog(false)}
          fullScreen={typeof window !== "undefined" && window.innerWidth < 600}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: 2,
              height: { xs: "80vh", sm: "auto" },
              maxHeight: { xs: "60vh", sm: "90vh" },
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
            },
          }}
        >
          <DialogContent
            sx={{ p: { xs: 2.5, sm: 2 }, overflowY: "auto", flex: 1 }}
          >
            <VendorBookingForm bookingId={vendorBookingId} />
          </DialogContent>
        </Dialog>

        <BookingDetailsDialog
          booking={viewingBooking}
          open={!!viewingBooking}
          onClose={() => setViewingBooking(null)}
        />
      </Box>
    </PermissionGuard>
  );
};

export default CabBooking;