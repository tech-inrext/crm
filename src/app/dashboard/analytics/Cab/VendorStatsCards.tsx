import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import Paper from '@/components/ui/Component/Paper';

export function VendorStatsCards({ displayVendors, appliedFilters }) {
  const stats = [
    {
      label: "Total Bookings",
      value: displayVendors.reduce((sum, v) => sum + (v.totalBookings || 0), 0),
      bg: "bg-blue-100",
      color: "text-blue-600",
      size: "text-2xl",
    },
    {
      label: "Completed",
      value: displayVendors.reduce((sum, v) => sum + (v.completedBookings || 0), 0),
      bg: "bg-green-100",
      color: "text-green-600",
      size: "text-2xl",
    },
    {
      label: "Pending",
      value: displayVendors.reduce((sum, v) => sum + (v.pendingBookings || 0), 0),
      bg: "bg-orange-100",
      color: "text-orange-600",
      size: "text-2xl",
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
      bg: "bg-purple-100",
      color: "text-purple-700",
      size: "text-xl",
      isCurrency: true,
    },
  ];

  return (
    <Paper className="bg-gray-100 p-4 rounded-xl border border-gray-300 mb-4" elevation={0}>
      <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">

        {stats.map((item, idx) => (
          <Box
            key={idx}
            className={`${item.bg} p-3 rounded-xl text-center`}
          >
            <Typography className={`${item.color} font-bold ${item.size}`}>
              {item.isCurrency
                ? `₹${item.value.toLocaleString()}`
                : item.value}
            </Typography>

            <Typography className="text-gray-600 text-sm">
              {item.label}
            </Typography>
          </Box>
        ))}

      </Box>
    </Paper>
  );
}
