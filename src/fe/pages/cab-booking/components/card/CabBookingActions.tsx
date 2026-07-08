import React from "react";
import { Visibility, ShareIcon } from "@/components/ui/Component";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PermissionGuard from "@/components/PermissionGuard";
import { Button, Tooltip, IconButton, Box } from "@mui/material";

interface CabBookingActionsProps {
  status: string;
  isSystemAdmin: boolean;
  isAgent: boolean;
  onAssignCab: () => void;
  onCompleteTrip: () => void;
  onShare: () => void;
  onView: () => void;
  canApprove?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onSettlePayment?: () => void;
}

const CabBookingActions: React.FC<CabBookingActionsProps> = ({
  status,
  isSystemAdmin,
  isAgent,
  onAssignCab,
  onCompleteTrip,
  onShare,
  onView,
  canApprove,
  onApprove,
  onReject,
  onSettlePayment,
}) => {
  return (
    <Box
      sx={{
        mt: "auto",
        pt: 2,
        borderTop: "1px dashed #e2e8f0",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 1,
      }}
    >
      {canApprove && status === "pending" && (
        <>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={(e) => { e.stopPropagation(); onApprove && onApprove(); }}
            sx={{ textTransform: "none", borderRadius: 2, px: 2, boxShadow: "none", fontWeight: 600 }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<HighlightOffIcon />}
            onClick={(e) => { e.stopPropagation(); onReject && onReject(); }}
            sx={{ textTransform: "none", borderRadius: 2, px: 2, borderWidth: 1.5, fontWeight: 600, "&:hover": { borderWidth: 1.5 } }}
          >
            Reject
          </Button>
          <Box sx={{ flexGrow: 1 }} />
        </>
      )}

      {/* Admin: Assign Cab */}
      {isSystemAdmin && status === "approved" && (
        <PermissionGuard module="cab-booking" action="write" fallback={null}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<DirectionsCarIcon />}
            onClick={(e) => { e.stopPropagation(); onAssignCab(); }}
            sx={{ textTransform: "none", borderRadius: 2, px: 2, boxShadow: "none", fontWeight: 600 }}
          >
            Assign Cab
          </Button>
        </PermissionGuard>
      )}

      {/* Admin: Settle Payment */}
      {isSystemAdmin && status === "payment_due" && (
        <PermissionGuard module="cab-booking" action="write" fallback={null}>
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={<MonetizationOnIcon />}
            onClick={(e) => { e.stopPropagation(); onSettlePayment && onSettlePayment(); }}
            sx={{ textTransform: "none", borderRadius: 2, px: 2, boxShadow: "none", fontWeight: 600, color: "white" }}
          >
            Settle Payment
          </Button>
        </PermissionGuard>
      )}

      {/* Agent: Complete Trip */}
      {isAgent && status === "active" && (
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={(e) => { e.stopPropagation(); onCompleteTrip(); }}
          sx={{ textTransform: "none", borderRadius: 2, px: 2, boxShadow: "none", fontWeight: 600 }}
        >
          Complete Trip
        </Button>
      )}

      {/* Spacer to push utility icons to the right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Utility Actions */}

      <Tooltip title="Share">
        <IconButton 
          size="small" 
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          sx={{ color: "text.secondary", "&:hover": { bgcolor: "grey.100", color: "text.primary" } }}
        >
          <ShareIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="View Details">
        <IconButton 
          size="small" 
          onClick={(e) => { e.stopPropagation(); onView(); }}
          sx={{ color: "text.secondary", "&:hover": { bgcolor: "grey.100", color: "text.primary" } }}
        >
          <Visibility sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CabBookingActions;
