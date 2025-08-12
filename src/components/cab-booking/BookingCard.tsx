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
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#667eea",
                  color: "white",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                {avatar}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {booking.clientName}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    wordBreak: "break-word",
                  }}
                >
                  Project: {getProjectName(booking.project)}
                </div>
              </div>
            </div>
            <span style={{ minWidth: 120, display: "inline-block" }}>
              <Select
                value={status}
                onChange={handleStatusChange}
                size="small"
                disabled={updating || isLoading}
                style={{
                  background: getStatusColor(status),
                  color: "white",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: "capitalize",
                  minWidth: 110,
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
                  style={{ marginLeft: 8, color: "#fff" }}
                />
              )}
            </span>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => onViewDetails(booking)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 15,
                wordBreak: "break-word",
              }}
            >
              <b>Pickup:</b> {booking.pickupPoint}
            </div>
            <div
              style={{
                fontSize: 15,
                wordBreak: "break-word",
              }}
            >
              <b>Drop:</b> {booking.dropPoint}
            </div>
            <div style={{ fontSize: 15 }}>
              <b>Date/Time:</b> {formatDateTime(booking.requestedDateTime)}
            </div>
            {booking.notes && (
              <div
                style={{
                  fontSize: 15,
                  wordBreak: "break-word",
                }}
              >
                <b>Notes:</b> {booking.notes}
              </div>
            )}
          </div>
        </>
      }
    />
  );
};

export default BookingCard;
