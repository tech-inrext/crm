import React, { useEffect, useMemo, useState } from "react";
import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";
import BookingCard from "./BookingCard";
import BookingDetailsDialog from "./BookingDetailsDialog";
import Pagination from "@/components/ui/Navigation/Pagination";
import { useDebounce } from "@/hooks/useDebounce";

interface BookingsListProps {
  statusFilter?: string;
  refreshKey?: number;
  search?: string;
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

const BookingsList: React.FC<BookingsListProps> = ({
  statusFilter = "",
  refreshKey,
  search = "",
}) => {
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  // server-side pagination controls
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // data from API
  const [rows, setRows] = useState<Booking[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // reset to page 1 whenever filter or search changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  // build query
  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    if (debouncedSearch) params.set("search", debouncedSearch);

    const s = (statusFilter || "").toLowerCase().trim();
    if (s && s !== "all") params.set("status", s);

    return `/api/v0/cab-booking?${params.toString()}`;
  }, [page, pageSize, statusFilter, debouncedSearch]);

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
        const respTotal = json.pagination?.totalItems ?? 0;
        const respTotalPages = json.pagination?.totalPages ?? 1;
        const respPage = json.pagination?.currentPage ?? page;
        setTotalItems(respTotal);
        setTotalPages(respTotalPages);
        // If server adjusted the page (e.g. requested page was beyond last page),
        // update client page state so UI syncs to server.
        if (respPage !== page) {
          setPage(respPage);
        }
      } catch (e: any) {
        if (active) setErr(e?.message || "Failed to load bookings");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [url, refreshKey, page]);

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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      <div className="pt-4 pb-2 border-t border-gray-100 sticky bottom-0 z-10">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[8, 16, 24, 32]}
        />
      </div>

      <BookingDetailsDialog
        booking={viewingBooking}
        open={!!viewingBooking}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default BookingsList;
