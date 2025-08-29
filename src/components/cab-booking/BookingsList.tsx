import React, { useEffect, useMemo, useState } from "react";
import { Booking } from "@/types/cab-booking";
import BookingCard from "./BookingCard";
import BookingDetailsDialog from "./BookingDetailsDialog";
import Pagination from "../ui/Pagination";

interface BookingsListProps {
  /** Pass the current status value from your dropdown.
   *  Use "", "all", or undefined to fetch all.
   *  Else pass one of: pending|approved|rejected|active|completed|cancelled
   */
  statusFilter?: string;
}

type ApiResponse = {
  success: boolean;
  data: Booking[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
};

const BookingsList: React.FC<BookingsListProps> = ({ statusFilter = "" }) => {
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  // server-side pagination controls
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // data from API
  const [rows, setRows] = useState<Booking[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // reset to page 1 whenever filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // build query
  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    const s = (statusFilter || "").toLowerCase().trim();
    if (s && s !== "all") params.set("status", s);

    return `/api/v0/cab-booking?${params.toString()}`;
  }, [page, pageSize, statusFilter]);

  // fetch page
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();
        if (!active) return;
        setRows(json.data || []);
        setTotalItems(json.pagination?.totalItems ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to load bookings");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [url]);

  const handleViewDetails = (booking: Booking) => setViewingBooking(booking);
  const handleCloseDialog = () => setViewingBooking(null);
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (size: number) => {
    setPage(1);
    setPageSize(size);
  };

  if (loading) return <div>Loading...</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!rows.length) return <div>No bookings found.</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((booking) => (
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
          pageSizeOptions={[6, 12, 24, 36]}
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
