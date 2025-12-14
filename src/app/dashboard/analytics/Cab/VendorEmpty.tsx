import React from "react";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";

export function VendorEmpty({ appliedFilters, monthOptions }) {
  return (
    <Box className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 text-yellow-800 text-center">
      <Typography className="font-semibold mb-2 text-yellow-900">
        🔍 No vendors found matching your filters
      </Typography>

      <Box className="text-sm mb-2 space-y-1">
        {(appliedFilters.month !== "all" || appliedFilters.year !== "all") && (
          <Box>
            <span role="img" aria-label="calendar">📅</span>{" "}
            <strong>
              No cab booking data found for{" "}
              {[
                appliedFilters.month !== "all"
                  ? monthOptions.find((m) => m.value === appliedFilters.month)?.label
                  : null,
                appliedFilters.year !== "all" ? appliedFilters.year : null,
              ]
                .filter(Boolean)
                .join(" ")}
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
