"use client";

import React from "react";
import { Box, Skeleton, Card } from "@/components/ui/Component";
import * as styles from "./styles";
import { VendorBookingsSkeletonProps } from "../types";

const VendorBookingsSkeleton: React.FC<VendorBookingsSkeletonProps> = ({ count = 6 }) => {
  return (
    <Box sx={styles.bookingGridSx}>
      {Array.from(new Array(count)).map((_, index) => (
        <Card
          key={index}
          sx={styles.skeletonCardSx}
        >
          {/* Header Skeleton */}
          <Box className="flex justify-between items-start">
            <Box>
              <Skeleton width={120} height={24} />
              <Skeleton width={80} height={16} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton variant="circular" width={32} height={32} />
          </Box>

          {/* Body Skeleton */}
          <Box sx={{ flexGrow: 1, py: 1 }}>
            <Skeleton width="100%" height={16} sx={{ mb: 1 }} />
            <Skeleton width="100%" height={16} sx={{ mb: 1 }} />
            <Skeleton width="60%" height={16} />
          </Box>

          {/* Footer Skeleton */}
          <Box className="flex justify-between items-center mt-auto pt-2 border-t border-divider">
            <Skeleton width={100} height={20} />
            <Skeleton width={60} height={20} />
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default VendorBookingsSkeleton;
