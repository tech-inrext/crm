import React from 'react';
import Box from '@/components/ui/Component/Box';
import Card from '@/components/ui/Component/Card';
import CardContent from '@/components/ui/Component/CardContent';
import Typography from '@/components/ui/Component/Typography';

export function VendorCardsGrid({ displayVendors }) {
  return (
    <Box
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4"
    >
      {displayVendors.map((vendor, idx) => {
        const paymentDueValue = Number(vendor.paymentDue) || 0;

        return (
          <Card
            key={vendor.id || idx}
            className="bg-white rounded-xl border border-gray-200 shadow-md h-full flex flex-col"
          >
            <CardContent className="p-4 flex flex-col h-full">
              {/* Header */}
              <Box className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <Typography className="text-base sm:text-lg font-semibold text-gray-800 truncate max-w-[80%]">
                  {vendor.name}
                </Typography>
              </Box>

              {/* Stats Row */}
              <Box
                className="flex flex-wrap sm:flex-nowrap justify-between gap-2 mb-3"
              >
                {/* Completed */} 
                <Box className="bg-green-50 px-3 py-2 sm:px-4 sm:py-3 rounded-md text-center flex-1 min-w-[45%] sm:min-w-[90px] mb-2 sm:mb-0">
                  <Typography className="font-bold text-sm sm:text-base">
                    {vendor.completedBookings || 0}
                  </Typography>
                  <Typography className="text-xs text-gray-600">
                    Completed
                  </Typography>
                </Box>

                {/* Pending */}
                <Box className="bg-orange-50 px-3 py-2 sm:px-4 sm:py-3 rounded-md text-center flex-1 min-w-[45%] sm:min-w-[80px] mb-2 sm:mb-0">
                  <Typography className="font-bold text-sm sm:text-base">
                    {vendor.pendingBookings || 0}
                  </Typography>
                  <Typography className="text-xs text-gray-600">
                    Pending
                  </Typography>
                </Box>

                {/* Payment Due */}
                <Box className="bg-red-100 px-2 py-2 sm:px-3 sm:py-3 rounded-md text-center flex-1 min-w-[45%] sm:min-w-[80px] mb-2 sm:mb-0">
                  <Typography className="font-bold text-sm sm:text-base">
                    ₹{paymentDueValue.toLocaleString()}
                  </Typography>
                  <Typography className="text-xs text-pink-600">
                    Payment Due
                  </Typography>
                </Box>

                {/* Total Spendings */}
                <Box className="bg-blue-50 px-2 py-2 sm:px-3 sm:py-3 rounded-md text-center flex-1 min-w-[45%] sm:min-w-[80px]">
                  <Typography className="font-bold text-sm sm:text-base">
                    ₹{(vendor.totalSpendings || 0).toLocaleString()}
                  </Typography>
                  <Typography className="text-xs text-blue-600">
                    Total Spendings
                  </Typography>
                </Box>
              </Box>

              {/* Footer Info */}
              <Box className="text-xs text-gray-600 space-y-1 mt-auto pt-2">
                <Typography>
                  📞 {vendor.phone || vendor.contactNumber ? (
                    <a
                      href={`tel:${vendor.phone || vendor.contactNumber}`}
                      style={{ color: '#1976d2', textDecoration: 'underline' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {vendor.phone || vendor.contactNumber}
                    </a>
                  ) : 'N/A'}
                </Typography>

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
