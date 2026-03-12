"use client";

import React, { useEffect } from "react";
import { VendorBooking } from "../types";
import { useGetVendorBookingsQuery } from "../vendorBookingApi";
import { invalidateQueryCache, VENDOR_BOOKING_API_BASE } from "../constants";
import VendorBookingCard from "./VendorBookingCard";
import Pagination from "@/components/ui/Navigation/Pagination";
import { Typography } from "@/components/ui/Component";

interface VendorBookingsListProps {
  onViewDetails: (booking: VendorBooking) => void;
  onOpenForm: (bookingId: string, booking: VendorBooking) => void;
  canWrite: boolean;
  /** Call to get a refetch function back to the parent for post-submit refresh */
  onReady?: (refetch: () => void) => void;
}

const VendorBookingsList: React.FC<VendorBookingsListProps> = ({
  onViewDetails,
  onOpenForm,
  canWrite,
  onReady,
}) => {
  const {
    items,
    loading,
    error,
    page,
    rowsPerPage,
    totalItems,
    refetch,
    setPage,
    setPageSize,
  } = useGetVendorBookingsQuery({});

  // Expose refetch to parent so it can refresh after form submit
  useEffect(() => {
    onReady?.(refetch);
  }, [refetch]);

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
        Failed to load bookings.
      </Typography>
    );
  if (!items.length) return <div>No vendor bookings found.</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((booking: VendorBooking) => (
          <VendorBookingCard
            key={booking._id}
            booking={booking}
            canWrite={canWrite}
            onViewDetails={onViewDetails}
            onOpenForm={onOpenForm}
          />
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <Pagination
          page={page}
          pageSize={rowsPerPage}
          total={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
          pageSizeOptions={[6, 12, 24]}
        />
      </div>
    </>
  );
};

export default VendorBookingsList;
