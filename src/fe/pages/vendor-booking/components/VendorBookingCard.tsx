"use client";

import React from "react";
import { VendorBooking } from "../types";
import BookingCard from "@/components/cab-booking/BookingCard";

interface VendorBookingCardProps {
  booking: VendorBooking;
  canWrite: boolean;
  onViewDetails: (booking: VendorBooking) => void;
  onOpenForm: (bookingId: string, booking: VendorBooking) => void;
}

const VendorBookingCard: React.FC<VendorBookingCardProps> = ({
  booking,
  canWrite,
  onViewDetails,
  onOpenForm,
}) => {
  return (
    <div className="relative">
      <BookingCard
        booking={booking as any}
        onViewDetails={onViewDetails as any}
      />

      {/* "Fill Form" button — only shown to vendor when booking is active */}
      {canWrite && booking.status === "active" && (
        <div className="absolute top-4 right-4">
          <button
            className="px-3 py-1 bg-blue-100 text-blue-900 rounded shadow border border-blue-300 text-sm"
            onClick={() => onOpenForm(booking._id, booking)}
          >
            Fill Form
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorBookingCard;
