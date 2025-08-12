import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import CardComponent from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { Box, Typography } from "@mui/material";
import { LocationOn, ArrowForward, Notes, Event } from "@mui/icons-material";
import MODULE_STYLES from "@/styles/moduleStyles";
import { Booking } from "@/types/cab-booking";
import {
  getStatusColor,
  formatDateTime,
  getProjectName,
  statusOptions,
} from "@/constants/cab-booking";

import { useCabBooking } from "@/hooks/useCabBooking";

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
}) => {
  const { updateBookingStatus, isLoading } = useCabBooking();
  const [status, setStatus] = useState(booking.status);
  const [updating, setUpdating] = useState(false);
  const avatar = booking.clientName
    ? booking.clientName.substring(0, 2).toUpperCase()
    : "CB";

  const handleStatusChange = async (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newStatus = e.target.value as string;
    setStatus(newStatus);
    setUpdating(true);
    try {
      await updateBookingStatus(booking._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <CardComponent
      content={
        <Box
          sx={{
            background: MODULE_STYLES.visual.gradients.card,
            borderRadius: 3,
            boxShadow: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  fontWeight: 700,
                  fontSize: 20,
                  bgcolor: "primary.main",
                  color: "white",
                  boxShadow: 2,
                }}
              >
                {avatar}
              </Avatar>
              <Box>
                <Typography fontWeight={700} fontSize={18} color="text.primary">
                  {booking.clientName}
                </Typography>
                <Typography
                  fontSize={13}
                  color="text.secondary"
                  sx={{ wordBreak: "break-word" }}
                >
                  Project: {getProjectName(booking.project)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ minWidth: 120, display: "flex", alignItems: "center" }}>
              <Select
                value={status}
                onChange={handleStatusChange}
                size="small"
                disabled={updating || isLoading}
                sx={{
                  background: getStatusColor(status),
                  color: "white",
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: "capitalize",
                  minWidth: 110,
                  boxShadow: 1,
                  mr: 1,
                }}
                MenuProps={{
                  PaperProps: {
                    style: { background: "#fff" },
                  },
                }}
              >
                {statusOptions
                  .filter((opt) => opt.value && opt.value !== "all")
                  .map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      style={{ textTransform: "capitalize" }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
              </Select>
              {updating && (
                <CircularProgress
                  size={18}
                  sx={{ ml: 1, color: "primary.main" }}
                />
              )}
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => onViewDetails(booking)}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOn sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography
                fontSize={15}
                color="text.primary"
                sx={{ wordBreak: "break-word" }}
              >
                <b>Pickup:</b> {booking.pickupPoint}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ArrowForward sx={{ color: "success.main", fontSize: 18 }} />
              <Typography
                fontSize={15}
                color="text.primary"
                sx={{ wordBreak: "break-word" }}
              >
                <b>Drop:</b> {booking.dropPoint}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Event sx={{ color: "secondary.main", fontSize: 18 }} />
              <Typography fontSize={15} color="text.primary">
                <b>Date/Time:</b> {formatDateTime(booking.requestedDateTime)}
              </Typography>
            </Box>
            {booking.notes && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Notes sx={{ color: "warning.main", fontSize: 18 }} />
                <Typography
                  fontSize={15}
                  color="text.primary"
                  sx={{ wordBreak: "break-word" }}
                >
                  <b>Notes:</b> {booking.notes}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      }
    />
  );
};

export default BookingCard;
