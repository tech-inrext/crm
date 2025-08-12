import React, { useState } from "react";
import { Booking } from "@/types/cab-booking";
import BookingCard from "./BookingCard";
import BookingDetailsDialog from "./BookingDetailsDialog";

import Pagination from "../ui/Pagination";

interface BookingsListProps {
  bookings: Booking[];
  isLoading: boolean;
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, isLoading }) => {
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  // Pagination state (local, like leads cards)
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(6); // Default page size

  const totalItems = bookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedBookings = bookings.slice(
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (bookings.length === 0) {
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
