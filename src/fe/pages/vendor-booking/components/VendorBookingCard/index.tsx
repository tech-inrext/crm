"use client";

import React from "react";
import { VendorBooking } from "../../types";
import BookingCard from "@/fe/pages/cab-booking/components/BookingCard";
import { Box, Button } from "@/components/ui/Component";
import * as styles from "./styles";
import { VendorBookingCardProps } from "../../types";

const VendorBookingCard: React.FC<VendorBookingCardProps> = ({
  booking,
  canWrite,
  onViewDetails,
  onOpenForm,
}) => {
  return (
    <Box sx={styles.cardContainerSx}>
      <BookingCard
        booking={booking as any}
        onViewDetails={onViewDetails as any}
      />

      {/* "Fill Form" button — only shown to vendor when booking is active */}
      {canWrite && booking.status === "active" && (
        <Box sx={styles.fillFormButtonContainerSx} className="fill-form-btn">
          <Button
            variant="outlined"
            size="small"
            sx={styles.fillFormButtonSx}
            onClick={(e) => {
              e.stopPropagation();
              onOpenForm(booking._id, booking);
            }}
          >
            Fill Form
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default VendorBookingCard;
