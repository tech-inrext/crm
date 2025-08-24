"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/PermissionGuard";
import { useCabBooking } from "@/hooks/useCabBooking";
import { CabBookingProps } from "@/types/cab-booking";
import {
  BookingForm,
  BookingsList,
  ViewSwitcher,
  Notification,
  VendorBookingForm,
} from "@/components/cab-booking";
import { statusOptions } from "@/constants/cab-booking";

const CabBooking: React.FC<CabBookingProps> = ({ defaultView = "form" }) => {
  const router = useRouter();
  const [activeView, setActiveView] =
    useState<CabBookingProps["defaultView"]>(defaultView);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const {
    bookings,
    projects,
    isLoading,
    error,
    success,
    createBooking,
    clearMessages,
  } = useCabBooking();

  const handleCreateBooking = async (formData: any) => {
    const success = await createBooking(formData);
    if (success) {
      setActiveView("tracking");
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
      <div className="container mx-auto px-4 py-6" style={{ marginTop: 24 }}>
        <Notification
          error={error}
          success={success}
          onClear={clearMessages}
          autoClose={true}
          autoCloseDelay={3000}
        />

        <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />

        {activeView === "tracking" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusButtonClick(opt.value)}
                className={`px-3 py-1 rounded border transition-colors duration-150 ${
                  statusFilter === opt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {activeView === "form" ? (
          <div className="p-6 rounded-lg shadow bg-white">
            <BookingForm
              projects={projects || []}
              isLoading={isLoading}
              onSubmit={handleCreateBooking}
            />
            {/* Add Vendor Booking Form below Cab Booking Form */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Vendor Booking Details</h2>
              <VendorBookingForm disabled />
            </div>
          </div>
        ) : activeView === "tracking" ? (
          <div className="p-6 rounded-lg shadow bg-white">
            <h2 className="text-xl font-bold mb-4">Bookings</h2>
            <BookingsList
              bookings={bookings}
              isLoading={isLoading}
              statusFilter={statusFilter}
            />
          </div>
        ) : null}
      </div>
    </PermissionGuard>
  );
};

export default CabBooking;
