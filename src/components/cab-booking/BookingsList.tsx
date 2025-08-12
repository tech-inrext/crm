import React, { useState } from "react";
import { Booking } from "@/types/cab-booking";
import BookingCard from "./BookingCard";
import BookingDetailsDialog from "./BookingDetailsDialog";

import Pagination from "../ui/Pagination";

interface BookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
  statusFilter?: string;
}

import { statusOptions } from "@/constants/cab-booking";

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  isLoading,
  statusFilter = "",
}) => {
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filter bookings by status
  const filteredBookings = statusFilter
    ? bookings.filter((b) => b.status === statusFilter)
    : bookings;

  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleViewDetails = (booking: Booking) => {
    setViewingBooking(booking);
  };

  const handleCloseDialog = () => {
    setViewingBooking(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPage(1);
    setPageSize(size);
  };

  const handleStatusButtonClick = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (filteredBookings.length === 0) {
    return <div>No bookings found.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <BookingDetailsDialog
        booking={viewingBooking}
        open={!!viewingBooking}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default BookingsList;
