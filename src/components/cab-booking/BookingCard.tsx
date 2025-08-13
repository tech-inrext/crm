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

  // Use canApprove property from backend for robust logic
  const isManager = booking.canApprove;

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
            width: "100%",
            maxWidth: 370,
            minWidth: 260,
            minHeight: 260,
            boxSizing: "border-box",
            overflow: "visible",
            wordBreak: "break-word",
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
                  {booking.clientName?.length > 28
                    ? `${booking.clientName.slice(0, 25)}...`
                    : booking.clientName}
                </Typography>
                <Typography
                  fontSize={13}
                  color="text.secondary"
                  sx={{
                    wordBreak: "break-word",
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* Project name removed from top section */}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ minWidth: 120, display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  overflow: "visible",
                  justifyContent: "flex-end",
                  minWidth: 120,
                  maxWidth: 180,
                }}
              >
                {isManager ? (
                  (() => {
                    const statusLocked =
                      status === "approved" || status === "rejected";
                    return (
                      <Select
                        value={status}
                        onChange={handleStatusChange}
                        size="small"
                        disabled={updating || isLoading || statusLocked}
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
                              disabled={statusLocked && opt.value !== status}
                            >
                              {opt.label}
                            </MenuItem>
                          ))}
                      </Select>
                    );
                  })()
                ) : (
                  <Box
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
                      px: 2,
                      py: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {statusOptions.find((opt) => opt.value === status)?.label ||
                      status}
                  </Box>
                )}
                {updating && (
                  <CircularProgress
                    size={18}
                    sx={{ ml: 1, color: "primary.main" }}
                  />
                )}
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => onViewDetails(booking)}
                    sx={{ ml: 1, mr: 0.5, background: "#f5f5f5", boxShadow: 1 }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
            {/* Project name at top of details section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography fontSize={15} color="primary.main" fontWeight={700}>
                <b>Project:</b> {getProjectName(booking.project)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOn sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography
                fontSize={15}
                color="text.primary"
                sx={{
                  wordBreak: "break-word",
                  maxWidth: 220,
                  overflow: "visible",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                }}
              >
                <b>Pickup:</b> {booking.pickupPoint}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ArrowForward sx={{ color: "success.main", fontSize: 18 }} />
              <Typography
                fontSize={15}
                color="text.primary"
                sx={{
                  wordBreak: "break-word",
                  maxWidth: 220,
                  overflow: "visible",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                }}
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
          </Box>
        </Box>
      }
    />
  );
};

export default BookingCard;
