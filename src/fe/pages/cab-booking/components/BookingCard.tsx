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
  ShareIcon,
} from "@/components/ui/Component";
import {
  Visibility,
  LocationOn,
  ArrowForward,
  Event,
  AssignmentInd,
} from "@/components/ui/Component";
import AssignVendorDialog from "./AssignVendorDialog";
import BookingStatus from "./BookingStatus";
import ShareBookingDialog from "./ShareBookingDialog";
import PermissionGuard from "@/components/PermissionGuard";
import CardComponent from "@/components/ui/card/Card";
import Avatar from "@/components/ui/Component/Avatar";
import MODULE_STYLES from "@/styles/moduleStyles";
import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";
import {
  getStatusColor,
  formatDateTime,
  getProjectName,
  statusOptions,
} from "@/fe/pages/cab-booking/constants/cab-booking";
import { useCabBooking } from "@/fe/pages/cab-booking/hooks/useCabBooking";
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
              background: "white",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              width: "100%",
              minHeight: 160,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => onViewDetails(booking)}
          >
            {/* Top Row: Avatar, Info, Status */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontWeight: 700,
                  fontSize: 14,
                  bgcolor: "primary.main",
                  color: "white",
                }}
              >
                {avatar}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.2 }} noWrap>
                  {booking.clientName}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }} noWrap>
                  {getProjectName(booking.project)}
                </Typography>
              </Box>
              <Box onClick={(e) => e.stopPropagation()}>
                <BookingStatus
                  booking={booking}
                  status={status}
                  updating={updating}
                  isLoading={isLoading}
                  isSystemAdmin={isSystemAdmin}
                  isManager={isManager}
                  onChangeStatus={handleStatusChange}
                />
              </Box>
            </Box>

            {/* Middle Row: Pickup & Drop */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocationOn sx={{ fontSize: 18, color: "primary.main", flexShrink: 0, mr: 1 }} />
                <Typography sx={{ fontSize: "0.9rem", color: "text.primary", lineHeight: 1 }} noWrap>
                  <b>Pickup:</b> {booking.pickupPoint}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ArrowForward sx={{ fontSize: 18, color: "success.main", flexShrink: 0, mr: 1 }} />
                <Typography sx={{ fontSize: "0.9rem", color: "text.primary", lineHeight: 1 }} noWrap>
                  <b>Drop:</b> {booking.dropPoint}
                </Typography>
              </Box>
            </Box>

            {/* Bottom Row: Date & Actions */}
            <Box
              sx={{
                mt: "auto",
                pt: 1.5,
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Event sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", lineHeight: 1 }}>
                  {formatDateTime(booking.requestedDateTime)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                {isSystemAdmin && status === "approved" && (
                  <PermissionGuard module="cab-booking" action="write" fallback={null}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAssignOpen(true); }}>
                      <AssignmentInd sx={{ fontSize: 20 }} />
                    </IconButton>
                  </PermissionGuard>
                )}
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}>
                  <ShareIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onViewDetails(booking); }}>
                  <Visibility sx={{ fontSize: 20 }} />
                </IconButton>
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