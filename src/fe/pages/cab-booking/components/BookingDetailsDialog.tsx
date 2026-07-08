import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from "@/components/ui/Component";
import {
  LocationOn,
  ArrowForward,
  Event,
  Notes,
  Person,
  Info,
  AssignmentInd,
  MonetizationOn,
} from "@/components/ui/Component";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MODULE_STYLES from "@/styles/moduleStyles";
import Avatar from "@/components/ui/Component/Avatar";
import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";
import {
  formatDateTime,
  getProjectName,
  statusOptions,
} from "@/fe/pages/cab-booking/constants/cab-booking";
import { useEffect, useState } from "react";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  booking,
  open,
  onClose,
}) => {
  const [managerName, setManagerName] = useState<string | null>(null);
  const [bookedByName, setBookedByName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchManager = async () => {
      try {
        if (!booking) return;
        // if managerName already provided on booking, use it
        if ((booking as any).managerName) {
          setManagerName((booking as any).managerName);
          return;
        }
        const mgrId = booking.managerId || booking.manager || null;
        const cabBookedByData = (booking as any).cabBookedBy;
        const bookedById = cabBookedByData
          ? typeof cabBookedByData === "object"
            ? cabBookedByData._id || cabBookedByData.id
            : cabBookedByData
          : null;
        if (!mgrId && !bookedById) return;
        const res = await fetch("/api/v0/employee/getAllEmployeeList");
        if (!res.ok) return;
        const payload = await res.json();
        const employees = payload.data || payload;
        if (mgrId) {
          const found = (employees || []).find(
            (e: any) => String(e._id) === String(mgrId)
          );
          if (mounted)
            setManagerName(
              found ? found.name || found.username || found.email : null
            );
        }
        if (bookedById) {
          const found2 = (employees || []).find(
            (e: any) => String(e._id) === String(bookedById)
          );
          if (mounted)
            setBookedByName(
              found2 ? found2.name || found2.username || found2.email : null
            );
        }
      } catch (err) {
        // ignore
      }
    };
    fetchManager();
    return () => {
      mounted = false;
    };
  }, [booking]);

  if (!booking) return null;
  const resolvedManagerName =
    booking.managerName ||
    (typeof booking.managerId === "object"
      ? (booking.managerId as any)?.name || (booking.managerId as any)?.username
      : null) ||
    (booking as any).managerName ||
    (typeof booking.managerId === "string" ? booking.managerId : "-");

  let displayName = booking.clientName || "Client";
  if (booking.leadId) {
    const lead = booking.leadId;
    const leadName = lead.fullName || lead.name || (lead.firstName ? `${lead.firstName} ${lead.lastName || ""}`.trim() : null);
    const leadMobile = lead.mobile || lead.mobileNo || lead.phone || lead.phoneNumber;
    
    if (leadName && leadName.toLowerCase() !== "client") {
      displayName = leadName;
    } else if (leadMobile) {
      displayName = leadMobile;
    }
  } else if (displayName.trim().toLowerCase() === "client") {
    displayName = "Client (No Name Provided)";
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          background: MODULE_STYLES.visual.gradients.tableHeader,
          color: "#fff",
          fontWeight: 700,
          letterSpacing: 1,
          fontSize: 22,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Booking Details</span>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "#fff", ml: 2 }}
          size="small"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            fill="currentColor"
          >
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          background: MODULE_STYLES.visual.gradients.card,
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontWeight: 700,
              fontSize: 24,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: 2,
            }}
          >
            {displayName.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize={20} color="text.primary">
              {displayName}
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              Project: {getProjectName(booking.project)}
            </Typography>
          </Box>
          <Box flex={1} />
          <Chip
            label={
              statusOptions.find((o) => o.value === booking.status)?.label ||
              booking.status
            }
            color={
              booking.status === "approved"
                ? "success"
                : booking.status === "pending"
                ? "info"
                : booking.status === "completed"
                ? "secondary"
                : booking.status === "payment_due"
                ? "warning"
                : "error"
            }
            sx={{
              fontWeight: 600,
              fontSize: 13,
              textTransform: "capitalize",
              px: 1.5,
            }}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Trip Details Section */}
          <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
            <Typography variant="subtitle2" color="primary.main" mb={1.5} fontWeight={700}>
              Trip & Route Details
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn color="action" fontSize="small" />
                <Typography fontSize={14}><b>Pickup:</b> {booking.pickupPoint}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <ArrowForward color="action" fontSize="small" />
                <Typography fontSize={14}><b>Drop:</b> {booking.dropPoint}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Event color="action" fontSize="small" />
                <Typography fontSize={14}><b>Travel Time:</b> {formatDateTime(booking.requestedDateTime)}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <MonetizationOn color="action" fontSize="small" />
                <Typography fontSize={14}>
                  <b>Fare:</b>{" "}
                  {typeof (booking as any).fare !== "undefined" && (booking as any).fare !== null
                    ? `₹ ${(booking as any).fare}`
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Assignment Info Section */}
          <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
            <Typography variant="subtitle2" color="secondary.main" mb={1.5} fontWeight={700}>
              Assignment Information
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <AssignmentInd color="action" fontSize="small" />
                <Typography fontSize={14}><b>Manager:</b> {resolvedManagerName || "-"}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <AssignmentInd color="action" fontSize="small" />
                <Typography fontSize={14}>
                  <b>Booked By:</b>{" "}
                  {(() => {
                    const cabBookedByObj = (booking as any).cabBookedBy;
                    if (typeof cabBookedByObj === "object" && cabBookedByObj !== null) {
                      return cabBookedByObj.name || cabBookedByObj.username || cabBookedByObj.email || bookedByName || String(cabBookedByObj._id || cabBookedByObj);
                    }
                    return bookedByName || cabBookedByObj || "-";
                  })()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Cab & Driver Info Section */}
          <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
            <Typography variant="subtitle2" color="success.main" mb={1.5} fontWeight={700}>
              Cab & Driver Details
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Person color="action" fontSize="small" />
                <Typography fontSize={14}><b>Cab Owner:</b> {(booking as any).cabOwner || (booking as any).ownerName || "-"}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <DirectionsCarIcon color="action" fontSize="small" />
                <Typography fontSize={14}><b>Cab Reg. No.:</b> {(booking as any).cabRegistrationNumber || "-"}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Person color="action" fontSize="small" />
                <Typography fontSize={14}><b>Driver Name:</b> {(booking as any).driverName || (booking as any).driverDetails?.username || "-"}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography fontSize={14}><b>Mobile No.:</b> {(booking as any).driverPhone || "-"}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Info color="action" fontSize="small" />
                <Typography fontSize={14}><b>Aadhar No.:</b> {(booking as any).aadharNumber || "-"}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Info color="action" fontSize="small" />
                <Typography fontSize={14}><b>DL Number:</b> {(booking as any).dlNumber || "-"}</Typography>
              </Box>
            </Box>
          </Box>

          {booking.notes && (
            <Box sx={{ p: 2, bgcolor: "warning.50", borderRadius: 2, border: "1px solid", borderColor: "warning.100" }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Notes color="warning" fontSize="small" />
                <Typography variant="subtitle2" color="warning.dark" fontWeight={700}>Notes</Typography>
              </Box>
              <Typography fontSize={14} color="text.secondary" ml={3.5}>{booking.notes}</Typography>
            </Box>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" flexWrap="wrap" gap={2}>
          {booking.createdAt && (
            <Typography fontSize={13} color="text.secondary">
              <b>Requested At:</b> {formatDateTime(booking.createdAt)}
            </Typography>
          )}
          {booking.updatedAt && (
            <Typography fontSize={13} color="text.secondary">
              <b>Updated At:</b> {formatDateTime(booking.updatedAt)}
            </Typography>
          )}
          <Typography fontSize={13} color="text.secondary">
            <b>Booking ID:</b> {booking.bookingId}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;