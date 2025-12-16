import React from 'react';
import Box from '@/components/ui/Component/Box';
import Card from '@/components/ui/Component/Card';
import CardContent from '@/components/ui/Component/CardContent';
import Typography from '@/components/ui/Component/Typography';

export function VendorCardsGrid({ displayVendors }) {
  return (
    <Box className="grid grid-cols-2 gap-4">
      {displayVendors.map((vendor, idx) => {
        const paymentDueValue = Number(vendor.paymentDue) || 0;

        return (
          <Card
            key={vendor.id || idx}
            className="bg-white rounded-xl border border-gray-200 shadow-md"
          >
            <CardContent className="p-4">
              {/* Header */}
              <Box className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <Typography className="text-lg font-semibold text-gray-800">
                  {vendor.name}
                </Typography>
              </Box>

              {/* Stats Row */}
              <Box className="flex justify-between gap-2 mb-3">

                {/* Completed */}
                <Box className="bg-green-50 px-4 py-3 rounded-md text-center min-w-[90px]">
                  <Typography className="font-bold text-base">
                    {vendor.completedBookings || 0}
                  </Typography>
                  <Typography className="text-xs text-gray-600">
                    Completed
                  </Typography>
                </Box>

                {/* Pending */}
                <Box className="bg-orange-50 px-4 py-3 rounded-md text-center min-w-[80px]">
                  <Typography className="font-bold text-base">
                    {vendor.pendingBookings || 0}
                  </Typography>
                  <Typography className="text-xs text-gray-600">
                    Pending
                  </Typography>
                </Box>

                {/* Payment Due */}
                <Box className="bg-red-100 px-3 py-3 rounded-md text-center min-w-[80px]">
                  <Typography className="font-bold text-base">
                    ₹{paymentDueValue.toLocaleString()}
                  </Typography>
                  <Typography className="text-xs text-red-600">
                    Payment Due
                  </Typography>
                </Box>

                {/* Total Spendings */}
                <Box className="bg-blue-50 px-3 py-3 rounded-md text-center min-w-[80px]">
                  <Typography className="font-bold text-base">
                    ₹{(vendor.totalSpendings || 0).toLocaleString()}
                  </Typography>
                  <Typography className="text-xs text-blue-600">
                    Total Spendings
                  </Typography>
                </Box>
              </Box>

              {/* Footer Info */}
              <Box className="text-xs text-gray-600 space-y-1 mt-2">
                <Typography>📞 {vendor.phone || vendor.contactNumber || "N/A"}</Typography>

                {vendor.avp && (
                  <Typography>
                    👤 AVP: {typeof vendor.avp === "object" ? vendor.avp.name : vendor.avp}
                  </Typography>
                )}

                {vendor.lastBookingDate && (
                  <Typography>
                    📅 Last: {new Date(vendor.lastBookingDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
