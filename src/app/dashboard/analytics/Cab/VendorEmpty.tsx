import React from "react";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";

export function VendorEmpty({ appliedFilters }) {
  return (
    <Box className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-yellow-800 text-center">
      <Typography className="font-semibold mb-2 text-yellow-900">
        🔍 No vendors found matching your filters
      </Typography>

      <Box className="text-sm mb-2 space-y-1">
        {(appliedFilters.fromDate || appliedFilters.toDate) && (
          <Box>
            <span role="img" aria-label="calendar">📅</span>{" "}
            <strong>
              No cab booking data found for{' '}
              {appliedFilters.fromDate ? `from ${new Date(appliedFilters.fromDate).toLocaleDateString()}` : ''}
              {appliedFilters.toDate ? ` to ${new Date(appliedFilters.toDate).toLocaleDateString()}` : ''}
            </strong>
          </Box>
        )}

        {appliedFilters.status !== "all" && (
          <Box>
            <span role="img" aria-label="status">📋</span>{" "}
            No vendors with <strong>{appliedFilters.status}</strong> bookings
          </Box>
        )}

        {appliedFilters.avp !== "all" && (
          <Box>
            <span role="img" aria-label="avp">👤</span>{" "}
            No vendors assigned to selected AVP
          </Box>
        )}
      </Box>

      <Typography className="text-sm">
        Try selecting a different filter or reset filters to see all vendors.
      </Typography>
    </Box>
  );
}
