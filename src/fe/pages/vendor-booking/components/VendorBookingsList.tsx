"use client";

import React, { useEffect } from "react";
import { VendorBooking, VendorBookingsListProps } from "../types";
import { useGetVendorBookingsQuery } from "../vendorBookingApi";
import VendorBookingCard from "./VendorBookingCard";
import Pagination from "@/components/ui/Navigation/Pagination";
import { Typography, Box } from "@/components/ui/Component";
import VendorBookingsSkeleton from "./VendorBookingsSkeleton";
import * as styles from "./styles";


const VendorBookingsList: React.FC<VendorBookingsListProps> = ({
  onViewDetails,
  onOpenForm,
  canWrite,
  onReady,
  search,
  statusFilter,
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
  } = useGetVendorBookingsQuery({ search, status: statusFilter === "all" ? undefined : statusFilter });

  // Reset to first page when search or statusFilter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, setPage]);

  // Expose refetch to parent so it can refresh after form submit
  useEffect(() => {
    onReady?.(refetch);
  }, [refetch, onReady]);

  if (loading) return <VendorBookingsSkeleton count={rowsPerPage || 6} />;

  if (error)
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        Failed to load bookings. Please try again later.
      </Typography>
    );

  if (!items.length) {
    return (
      <Box sx={styles.emptyStateContainerSx}>
        <Typography variant="h6" color="text.secondary">
          No vendor bookings found.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={styles.bookingGridSx}>
        {items.map((booking: VendorBooking) => (
          <VendorBookingCard
            key={booking._id}
            booking={booking}
            canWrite={canWrite}
            onViewDetails={onViewDetails}
            onOpenForm={onOpenForm}
          />
        ))}
      </Box>
      <Box className="flex justify-center mt-8">
        <Pagination
          page={page}
          pageSize={rowsPerPage}
          total={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
          pageSizeOptions={[6, 12, 18, 24]}
        />
      </Box>
    </>
  );
};

export default VendorBookingsList;
