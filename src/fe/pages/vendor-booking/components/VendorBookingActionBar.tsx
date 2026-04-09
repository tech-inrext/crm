"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Box } from "@/components/ui/Component";
import * as styles from "./styles";

const VendorBookingActionBar: React.FC = () => {
  return (
    <Box sx={styles.actionBarContainerSx}>
      <PageHeader
        title="Vendor Bookings"
        subtitle="Your assigned cab bookings — fill in details for active bookings"
      />
    </Box>
  );
};

export default VendorBookingActionBar;
