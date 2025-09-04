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
import VendorBookingForm from "./VendorBookingForm";
import PermissionGuard from "@/components/PermissionGuard";
import CardComponent from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
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

  const renderStatus = () =>
    isManager ? (
      <Select
        value={status}
        onChange={handleStatusChange}
        size="small"
        disabled={updating || isLoading || status !== "pending"}
        sx={{
          background: getStatusColor(status),
          color: "white",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: 12,
          textTransform: "capitalize",
          minWidth: 140,
          maxWidth: 140,
          px: 1,
          boxShadow: 1,
          display: "flex",
          alignItems: "center",
          "& .MuiSelect-icon": { color: "white" },
        }}
        MenuProps={{ PaperProps: { style: { background: "#fff" } } }}
      >
        {
          // Build options to render. For managers we want to show 'Pending' first
          // when the current status is pending, then Approved and Rejected.
          (() => {
            if (isManager) {
              const opts: typeof statusOptions = [];
              // Always include the current status option first so the Select
              // can render a value that might not be in the normal manager
              // option list (for example 'active'). Avoid duplicates below.
              const currentOpt = statusOptions.find((o) => o.value === status);
              if (currentOpt) opts.push(currentOpt);

              // Include pending only when current is pending or to let manager
              // see pending -> approve/reject flow.
              if (status === "pending") {
                const pendingOpt = statusOptions.find(
                  (o) => o.value === "pending"
                );
                if (
                  pendingOpt &&
                  !opts.find((x) => x.value === pendingOpt.value)
                )
                  opts.push(pendingOpt);
              }

              // always allow approve/reject for managers
              const approveOpt = statusOptions.find(
                (o) => o.value === "approved"
              );
              const rejectOpt = statusOptions.find(
                (o) => o.value === "rejected"
              );
              if (approveOpt && !opts.find((x) => x.value === approveOpt.value))
                opts.push(approveOpt);
              if (rejectOpt && !opts.find((x) => x.value === rejectOpt.value))
                opts.push(rejectOpt);

              return opts.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ));
            }

            return statusOptions
              .filter((opt) => opt.value && opt.value !== "all")
              .map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ));
          })()
        }
      </Select>
    ) : (
      <Chip
        label={
          statusOptions.find((opt) => opt.value === status)?.label || status
        }
        sx={{
          background: getStatusColor(status),
          color: "white",
          fontWeight: 600,
          fontSize: 12,
          borderRadius: "12px",
          px: 1,
          minWidth: 140,
          maxWidth: 140,
          height: 28,
          display: "flex",
          alignItems: "center",
        }}
      />
    );

  const renderShareDialog = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={() => setShareOpen(false)}
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: 1.5,
          boxShadow: 3,
          p: 1.5,
          minWidth: 200,
          maxWidth: 260,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" mb={1} fontSize={14}>
          Share Booking Link
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <TextField
            value={shareLink}
            size="small"
            fullWidth
            InputProps={{ readOnly: true, style: { fontSize: 12 } }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{ fontSize: 12, minWidth: 40, px: 0.5 }}
            onClick={() => navigator.clipboard.writeText(shareLink)}
          >
            Copy
          </Button>
        </Box>
      </Box>
    </div>
  );

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
                {renderStatus()}
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
                {/* Form Button: Show for vendor bookings with status active */}
                {/* Form Button removed. Vendor form dialog is now managed in vendor booking dashboard. */}
                {/* Share Icon */}
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
      {shareOpen && renderShareDialog()}
      {assignOpen && (
        <AssignVendorDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          onAssign={handleAssignVendor}
        />
      )}
      {/* Vendor form dialog removed. Vendor form dialog is now managed in vendor booking dashboard. */}
      {/* Vendor form dialog removed. Vendor form dialog is now managed in vendor booking dashboard. */}
    </>
  );
};

export default BookingCard;
