import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import {
  Visibility,
  LocationOn,
  ArrowForward,
  Event,
  AssignmentInd,
} from "@mui/icons-material";
import AssignVendorDialog from "./AssignVendorDialog";
import BookingStatus from "./BookingStatus";
import ShareBookingDialog from "./ShareBookingDialog";
import PermissionGuard from "@/components/PermissionGuard";
import CardComponent from "@/components/ui/cards/Card";
import Avatar from "@/components/ui/avatar/Avatar";
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
  // ...existing code...
  booking,
  onViewDetails,
}) => {
  // don't auto-fetch the full cab-booking list when this card mounts;
  // parent pages should control fetching. This prevents a vendor page
  // from accidentally performing a protected READ.
  const { updateBookingStatus, isLoading } = useCabBooking({
    autoFetch: false,
  });
  const { user } = useAuth();
  // Determine if current selected role is a system admin (normalized)
  let isSystemAdmin = false;
  if (user) {
    let currentRole = user.currentRole;
    if (typeof currentRole === "string" && user.roles) {
      currentRole = user.roles.find((r) => r._id === currentRole);
    }
    if (currentRole && typeof currentRole !== "string") {
      const v = (currentRole as any).isSystemAdmin;
      isSystemAdmin =
        typeof v === "string" ? v.toLowerCase() === "true" : Boolean(v);
    }
  }
  const [status, setStatus] = useState(booking.status);
  const [updating, setUpdating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const avatar = booking.clientName
    ? booking.clientName.substring(0, 2).toUpperCase()
    : "CB";
  const shareLink = `${window.location.origin}/dashboard/cab-booking?bookingId=${booking._id}`;
  const isManager = booking.canApprove;
  // ...existing code...

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setUpdating(true);
    try {
      await updateBookingStatus(booking._id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  // Assign vendor handler
  const handleAssignVendor = async (vendorId: string) => {
    setUpdating(true);
    try {
      // Call backend to assign vendor and set status to 'active'
      await updateBookingStatus(booking._id, "active", vendorId);
      setStatus("active");
      setAssignOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <CardComponent
        content={
          <Box
            sx={{
              background: MODULE_STYLES.visual.gradients.card,
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              maxWidth: 320,
              minWidth: 200,
              minHeight: 180,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            {/* Header: Avatar + Name + Status + Action */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
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
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                    fontSize: 16,
                    bgcolor: "primary.main",
                    color: "white",
                    boxShadow: 2,
                    flexShrink: 0,
                  }}
                >
                  {avatar}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    fontWeight={700}
                    fontSize={14}
                    color="text.primary"
                    noWrap
                    sx={{ maxWidth: 120 }}
                  >
                    {booking.clientName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: 120, fontSize: 12 }}
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
                <BookingStatus
                  booking={booking}
                  status={status}
                  updating={updating}
                  isLoading={isLoading}
                  isSystemAdmin={isSystemAdmin}
                  isManager={isManager}
                  onChangeStatus={handleStatusChange}
                />
                {/* Assign Icon: Only show for approved bookings */}
                {isSystemAdmin && (
                  <PermissionGuard
                    module="cab-booking"
                    action="write"
                    fallback={null}
                  >
                    {status === "approved" && (
                      <Tooltip title="Assign to Vendor">
                        <IconButton
                          size="small"
                          onClick={() => setAssignOpen(true)}
                          sx={{
                            background: "#fafafa",
                            boxShadow: 1,
                            "&:hover": { background: "#f0f0f0" },
                          }}
                        >
                          <AssignmentInd fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </PermissionGuard>
                )}
                <Tooltip title="Share Booking">
                  <IconButton
                    size="small"
                    onClick={() => setShareOpen(true)}
                    sx={{
                      background: "#fafafa",
                      boxShadow: 1,
                      "&:hover": { background: "#f0f0f0" },
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={() => onViewDetails(booking)}
                    sx={{
                      background: "#fafafa",
                      boxShadow: 1,
                      "&:hover": { background: "#f0f0f0" },
                    }}
                  >
                    <Visibility fontSize="inherit" style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Details Section */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <LocationOn sx={{ color: "primary.main", fontSize: 14 }} />
                <Typography fontSize={12} color="text.primary">
                  <b>Pickup:</b> {booking.pickupPoint}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <ArrowForward sx={{ color: "success.main", fontSize: 14 }} />
                <Typography fontSize={12} color="text.primary">
                  <b>Drop:</b> {booking.dropPoint}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <Event sx={{ color: "secondary.main", fontSize: 14 }} />
                <Typography fontSize={12} color="text.primary">
                  <b>Date/Time:</b> {formatDateTime(booking.requestedDateTime)}
                </Typography>
              </Box>
            </Box>
          </Box>
        }
      />
      <ShareBookingDialog
        open={shareOpen}
        link={shareLink}
        onClose={() => setShareOpen(false)}
      />
      {assignOpen && (
        <AssignVendorDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          onAssign={handleAssignVendor}
        />
      )}
   </>
  );
};

export default BookingCard;
