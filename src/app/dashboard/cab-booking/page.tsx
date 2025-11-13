"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import { useCabBooking } from "@/hooks/useCabBooking";
import { CabBookingProps } from "@/types/cab-booking";
import {
  BookingForm,
  BookingsList,
  Notification,
  VendorBookingForm,
} from "@/components/cab-booking";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { statusOptions } from "@/constants/cab-booking";

const CabBooking: React.FC<CabBookingProps> = ({
  defaultView = "tracking",
}) => {
  const router = useRouter();
  const [activeView, setActiveView] =
    useState<CabBookingProps["defaultView"]>(defaultView);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [vendorBookingId, setVendorBookingId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const bookingId = searchParams.get("bookingId");
    if (bookingId) {
      setVendorBookingId(bookingId);
      setShowVendorDialog(true);
    }
  }, []);

  const {
    bookings,
    projects,
    isLoading,
    error,
    success,
    createBooking,
    clearMessages,
  } = useCabBooking();

  // counter used to force child list to refetch when new bookings are created
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateBooking = async (formData: any) => {
    const success = await createBooking(formData);
    if (success) {
      setActiveView("tracking");
      setShowBookingDialog(false);
      // bump refreshKey so BookingsList re-fetches immediately
      setRefreshKey((k) => k + 1);
    }
    return success;
  };

  const handleViewChange = (view: "form" | "tracking" | "vendortracking") => {
    setActiveView(view);
    clearMessages();
  };

  const handleStatusButtonClick = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <PermissionGuard module="cab-booking">
      <div
        style={{
          padding: "16px 24px",
          paddingTop: "24px",
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Notification
          error={error}
          success={success}
          onClear={clearMessages}
          autoClose={true}
          autoCloseDelay={3000}
        />

        {/* ViewSwitcher removed, only one view now */}

        {activeView === "tracking" && (
          <div className="flex justify-between items-center mb-4">
            <div>
              <label htmlFor="statusDropdown" className="mr-2 font-medium">
                Status:
              </label>
              <select
                id="statusDropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
              onClick={() => setShowBookingDialog(true)}
            >
              Create Booking
            </button>
          </div>
        )}

        {/* Booking Form Dialog using MUI Dialog */}
        {/* MUI Dialog import moved to top of file */}
        <Dialog
          open={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
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
            <BookingForm
              projects={projects || []}
              isLoading={isLoading}
              onSubmit={handleCreateBooking}
            />
          </DialogContent>
        </Dialog>
        {/* Vendor Booking Dialog */}
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
        {activeView === "tracking" && (
          <div className="p-6 rounded-lg shadow bg-white">
            <h2 className="text-xl font-bold mb-4">Bookings</h2>
            <BookingsList statusFilter={statusFilter} refreshKey={refreshKey} />
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default CabBooking;
