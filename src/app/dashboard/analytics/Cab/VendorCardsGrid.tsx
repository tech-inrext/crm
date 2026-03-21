import React from "react";
import Box from "@/components/ui/Component/Box";
import Card from "@/components/ui/Component/Card";
import CardContent from "@/components/ui/Component/CardContent";
import Typography from "@/components/ui/Component/Typography";

export function VendorCardsGrid({ displayVendors }) {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
      {displayVendors.map((vendor, idx) => {

        const paymentDueValue = Number(vendor.paymentDueAmount) || 0;

        return (
          <Card
            key={vendor.id || idx}
            className="rounded-2xl border border-gray-200 shadow-sm p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-[2px] flex flex-col"
          >
            <CardContent className="p-0 flex flex-col h-full">

              {/* Header */}
              <Box className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
                <Typography
                  sx={{ fontSize: "13px", fontWeight: 600 }}
                  className="text-gray-900 truncate max-w-[80%]"
                >
                  {vendor.name}
                </Typography>
              </Box>

              {/* Stats */}
              <Box className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2">

                {/* Completed */}
                <Box className="border border-gray-200 rounded-md px-2 py-2 text-center bg-gray-50">
                  <Typography
                    sx={{ fontSize: "0.95rem", fontWeight: 600 }}
                    className="text-gray-900"
                  >
                    {vendor.completedBookings || 0}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "10px", fontWeight: 500 }}
                    className="uppercase text-gray-600 tracking-wide"
                  >
                    Completed
                  </Typography>
                </Box>

                {/* Pending */}
                <Box className="border border-gray-200 rounded-md px-2 py-2 text-center bg-gray-50">
                  <Typography
                    sx={{ fontSize: "0.95rem", fontWeight: 600 }}
                    className="text-gray-900"
                  >
                    {vendor.pendingBookings || 0}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "10px", fontWeight: 500 }}
                    className="uppercase text-gray-600 tracking-wide"
                  >
                    Pending
                  </Typography>
                </Box>

                {/* Payment Due */}
                <Box className="border border-gray-200 rounded-md px-2 py-2 text-center bg-gray-50">
                  <Typography
                    sx={{ fontSize: "0.95rem", fontWeight: 600 }}
                    className="text-gray-900"
                  >
                    ₹{paymentDueValue.toLocaleString()}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "10px", fontWeight: 500 }}
                    className="uppercase text-gray-600 tracking-wide"
                  >
                    Due
                  </Typography>
                </Box>

                {/* Total Spendings */}
                <Box className="border border-gray-200 rounded-md px-2 py-2 text-center bg-gray-50">
                  <Typography
                    sx={{ fontSize: "0.95rem", fontWeight: 600 }}
                    className="text-gray-900"
                  >
                    ₹{(
                      vendor.totalSpendings ||
                      vendor.totalEarnings ||
                      0
                    ).toLocaleString()}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "10px", fontWeight: 500 }}
                    className="uppercase text-gray-600 tracking-wide"
                  >
                    Spend
                  </Typography>
                </Box>

              </Box>

              {/* Footer Info */}
              <Box className="text-[11px] text-gray-600 space-y-0.5 mt-auto pt-1">

                <Typography>
                  📞 {vendor.phone || vendor.contactNumber ? (
                    <a
                      href={`tel:${vendor.phone || vendor.contactNumber}`}
                      className="text-blue-600 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {vendor.phone || vendor.contactNumber}
                    </a>
                  ) : "N/A"}
                </Typography>

                {vendor.avp && (
                  <Typography>
                    👤 {typeof vendor.avp === "object"
                      ? vendor.avp.name
                      : vendor.avp}
                  </Typography>
                )}

                {vendor.lastBookingDate && (
                  <Typography>
                    📅 {new Date(vendor.lastBookingDate).toLocaleDateString()}
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