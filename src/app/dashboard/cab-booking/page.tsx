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
} from "@/components/cab-booking";

const CabBooking: React.FC<CabBookingProps> = ({ defaultView = "form" }) => {
  const router = useRouter();
  const [activeView, setActiveView] =
    useState<CabBookingProps["defaultView"]>(defaultView);

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

        {activeView === "form" ? (
          <div className="p-6 rounded-lg shadow bg-white">
            <BookingForm
              projects={projects}
              isLoading={isLoading}
              onSubmit={handleCreateBooking}
            />
          </div>
        ) : activeView === "tracking" ? (
          <div className="p-6 rounded-lg shadow bg-white">
            <h2 className="text-xl font-bold mb-4">Bookings</h2>
            <BookingsList bookings={bookings} isLoading={isLoading} />
          </div>
        ) : null}
      </div>
    </PermissionGuard>
  );
};

export default CabBooking;
