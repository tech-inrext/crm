import React from "react";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";
import Card from "@/components/ui/Component/Card";
import CardContent from "@/components/ui/Component/CardContent";

export function VendorStatsCards({ displayVendors, appliedFilters }) {
  const stats = [
    {
      label: "Total Bookings",
      value: displayVendors.reduce((sum, v) => sum + (v.totalBookings || 0), 0),
    },
    {
      label: "Completed",
      value: displayVendors.reduce((sum, v) => sum + (v.completedBookings || 0), 0),
    },
    {
      label: "Pending",
      value: displayVendors.reduce((sum, v) => sum + (v.pendingBookings || 0), 0),
    },
    {
      label:
        appliedFilters.status === "payment-due"
          ? "Total Payment Due"
          : "Total Spendings",
      value:
        appliedFilters.status === "payment-due"
          ? displayVendors.reduce((sum, v) => sum + (v.paymentDue || 0), 0)
          : displayVendors.reduce((sum, v) => sum + (v.totalSpendings || 0), 0),
      isCurrency: true,
    },
  ];

  return (
    <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          elevation={0}
          className="rounded-2xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center"
        >
          <CardContent className="py-3 px-3 text-center">

            {/* Value */}
            <Typography
              sx={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1.2 }}
              className="text-gray-900"
            >
              {item.isCurrency
                ? `₹${item.value.toLocaleString()}`
                : item.value}
            </Typography>

            {/* Label */}
            <Typography
              sx={{ fontSize: "11px", fontWeight: 500 }}
              className="uppercase text-gray-600 tracking-wide"
            >
              {item.label}
            </Typography>

          </CardContent>
        </Card>
      ))}
    </Box>
  );
}