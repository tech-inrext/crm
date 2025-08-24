import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import CardComponent from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import { Box, Typography } from "@mui/material";
import { LocationOn, ArrowForward, Event } from "@mui/icons-material";
import MODULE_STYLES from "@/styles/moduleStyles";
import { Booking } from "@/types/cab-booking";
import {
  getStatusColor,
  formatDateTime,
  getProjectName,
  statusOptions,
} from "@/constants/cab-booking";

import { useCabBooking } from "@/hooks/useCabBooking";
import { useAuth } from "@/contexts/AuthContext";

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
}) => {
  const { updateBookingStatus, isLoading } = useCabBooking();
  const { getCurrentRoleName } = useAuth();
  const userRole = getCurrentRoleName();
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

  const isManager = booking.canApprove;

  return (
    <CardComponent
      content={
        <Box
          sx={{
            background: MODULE_STYLES.visual.gradients.card,
            borderRadius: 4,
            boxShadow: 4,
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            maxWidth: 380,
            minWidth: 260,
            minHeight: 260,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 6,
            },
          }}
        >
          {/* Header: Avatar + Name + Status + Action */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", // ✅ wrap if space is tight
              gap: 1,
              mb: 1,
            }}
          >
            {/* Left side: Avatar + Name */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flexGrow: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  fontWeight: 700,
                  fontSize: 20,
                  bgcolor: "primary.main",
                  color: "white",
                  boxShadow: 3,
                  flexShrink: 0,
                }}
              >
                {avatar}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontWeight={700}
                  fontSize={17}
                  color="text.primary"
                  noWrap
                  sx={{ maxWidth: 150 }}
                >
                  {booking.clientName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ maxWidth: 150 }}
                >
                  {getProjectName(booking.project)}
                </Typography>
              </Box>
            </Box>

            {/* Right side: Status + Eye */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
                minWidth: 0,
              }}
            >
              {isManager ? (
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  size="small"
                  disabled={updating || isLoading || status !== "pending"}
                  sx={{
                    background: getStatusColor(status),
                    color: "white",
                    borderRadius: "16px",
                    fontWeight: 600,
                    fontSize: 15,
                    textTransform: "capitalize",
                    minWidth: 220,
                    maxWidth: 220,
                    px: 2,
                    boxShadow: 2,
                    display: "flex",
                    alignItems: "center",
                    "& .MuiSelect-icon": { color: "white" },
                  }}
                  MenuProps={{ PaperProps: { style: { background: "#fff" } } }}
                >
                  {statusOptions
                    .filter((opt) => opt.value && opt.value !== "all")
                    .map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                </Select>
              ) : (
                <Chip
                  label={
                    statusOptions.find((opt) => opt.value === status)?.label ||
                    status
                  }
                  sx={{
                    background: getStatusColor(status),
                    color: "white",
                    fontWeight: 600,
                    fontSize: 15,
                    borderRadius: "16px",
                    px: 2,
                    minWidth: 220,
                    maxWidth: 220,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                  }}
                />
              )}

              {updating && (
                <CircularProgress size={18} sx={{ color: "primary.main" }} />
              )}

              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => onViewDetails(booking)}
                  sx={{
                    background: "#fafafa",
                    boxShadow: 2,
                    "&:hover": { background: "#f0f0f0" },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Details Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOn sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography fontSize={15} color="text.primary">
                <b>Pickup:</b> {booking.pickupPoint}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ArrowForward sx={{ color: "success.main", fontSize: 18 }} />
              <Typography fontSize={15} color="text.primary">
                <b>Drop:</b> {booking.dropPoint}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Event sx={{ color: "secondary.main", fontSize: 18 }} />
              <Typography fontSize={15} color="text.primary">
                <b>Date/Time:</b> {formatDateTime(booking.requestedDateTime)}
              </Typography>
            </Box>
          </Box>
        </Box>
      }
    />
  );
};

export default BookingCard;
