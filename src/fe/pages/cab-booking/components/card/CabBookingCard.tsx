import React, { useState } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@/components/ui/Component";
import { Button as MuiButton } from "@mui/material";
import CardComponent from "@/components/ui/card/Card";
import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";
import { useAuth } from "@/contexts/AuthContext";
import { cabBookingApi, uploadFileToS3 } from "@/fe/pages/cab-booking/cabBookingApi";

// Sub-components
import CabBookingHeader from "./CabBookingHeader";
import CabBookingStepper from "./CabBookingStepper";
import CabBookingRoute from "./CabBookingRoute";
import CabBookingActions from "./CabBookingActions";

// Dialogs
import ShareBookingDialog from "../ShareBookingDialog";
import AdminAssignCabDialog from "../AdminAssignCabDialog";
import AgentCompleteTripDialog from "../AgentCompleteTripDialog";
import AdminSettlePaymentDialog from "../AdminSettlePaymentDialog";

interface CabBookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onRefresh?: () => void; // Optional callback to trigger list refresh
}

const CabBookingCard: React.FC<CabBookingCardProps> = ({ booking, onViewDetails, onRefresh }) => {
  const { user } = useAuth();
  
  // Determine if current selected role is a system admin
  let isSystemAdmin = false;
  if (user) {
    let currentRole = user.currentRole;
    if (typeof currentRole === "string" && user.roles) {
      currentRole = user.roles.find((r) => r._id === currentRole);
    }
    if (currentRole && typeof currentRole !== "string") {
      const v = (currentRole as any).isSystemAdmin;
      isSystemAdmin = typeof v === "string" ? v.toLowerCase() === "true" : Boolean(v);
    }
  }

  const bookedById = typeof booking.cabBookedBy === "string" ? booking.cabBookedBy : (booking.cabBookedBy as any)?._id;
  const isAgent = Boolean(user && user._id === bookedById);

  let displayName = booking.clientName;
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

  const [status, setStatus] = useState(booking.status);
  const [updating, setUpdating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [completeTripOpen, setCompleteTripOpen] = useState(false);
  const [settlePaymentOpen, setSettlePaymentOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: "primary" | "error" | "warning" | "success" | "info";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    confirmText: "",
    confirmColor: "primary",
    onConfirm: () => {},
  });

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/cab-booking?bookingId=${booking._id}`;

  const handleAssignCabDetails = async (data: any) => {
    setUpdating(true);
    try {
      await cabBookingApi.updateFields(booking._id, { ...data, status: "active" });
      setStatus("active");
      setAssignOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to assign cab details", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteTrip = async (data: any) => {
    setUpdating(true);
    try {
      const payload: any = {
        startKm: data.startKm,
        endKm: data.endKm,
        status: "payment_due"
      };
      
      if (data.odometerStartFile) {
        const { fileUrl } = await uploadFileToS3(data.odometerStartFile);
        payload.odometerStartImageUrl = fileUrl;
      }
      if (data.odometerEndFile) {
        const { fileUrl } = await uploadFileToS3(data.odometerEndFile);
        payload.odometerEndImageUrl = fileUrl;
      }
      
      await cabBookingApi.updateFields(booking._id, payload);
      setStatus("payment_due");
      setCompleteTripOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to complete trip", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    setUpdating(true);
    try {
      await cabBookingApi.updateFields(booking._id, { status: "approved" });
      setStatus("approved");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to approve booking", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = () => {
    setConfirmDialog({
      open: true,
      title: "Reject Booking",
      message: "Are you sure you want to reject this cab booking? The agent will be notified and this action cannot be undone.",
      confirmText: "Reject",
      confirmColor: "error",
      onConfirm: async () => {
        setUpdating(true);
        try {
          await cabBookingApi.updateFields(booking._id, { status: "rejected" });
          setStatus("rejected");
          if (onRefresh) onRefresh();
        } catch (err) {
          console.error("Failed to reject booking", err);
        } finally {
          setUpdating(false);
        }
      }
    });
  };

  const handleSettlePayment = async (data: { fare: string }) => {
    setUpdating(true);
    try {
      await cabBookingApi.updateFields(booking._id, { fare: data.fare, status: "completed" });
      setStatus("completed");
      setSettlePaymentOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to settle payment", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          background: "white",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: "1px solid",
          borderColor: "grey.100",
          borderRadius: 3,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px -10px rgba(0,0,0,0.1)",
            borderColor: "primary.100",
          },
        }}
        onClick={() => onViewDetails(booking)}
      >
            <CabBookingHeader 
              displayName={displayName} 
              project={typeof booking.project === "string" ? booking.project : (booking.project as any)?.name || ""} 
            />
            
            <CabBookingStepper status={status} />
            
            <CabBookingRoute 
              pickupPoint={booking.pickupPoint} 
              dropPoint={booking.dropPoint} 
              requestedDateTime={booking.requestedDateTime} 
              numberOfClients={booking.numberOfClients}
            />
            
            <CabBookingActions 
              status={status}
              isSystemAdmin={isSystemAdmin}
              isAgent={isAgent}
              onAssignCab={() => setAssignOpen(true)}
              onCompleteTrip={() => setCompleteTripOpen(true)}
              onShare={() => setShareOpen(true)}
              onView={() => onViewDetails(booking)}
              canApprove={booking.canApprove}
              onApprove={handleApprove}
              onReject={handleReject}
              onSettlePayment={() => setSettlePaymentOpen(true)}
            />
      </Box>

      <ShareBookingDialog
        open={shareOpen}
        link={shareLink}
        onClose={() => setShareOpen(false)}
      />

      {assignOpen && (
        <AdminAssignCabDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          onSubmit={handleAssignCabDetails}
          isLoading={updating}
        />
      )}

      {completeTripOpen && (
        <AgentCompleteTripDialog
          open={completeTripOpen}
          onClose={() => setCompleteTripOpen(false)}
          onSubmit={handleCompleteTrip}
          isLoading={updating}
        />
      )}

      {settlePaymentOpen && (
        <AdminSettlePaymentDialog
          open={settlePaymentOpen}
          onClose={() => setSettlePaymentOpen(false)}
          onSubmit={handleSettlePayment}
          isLoading={updating}
        />
      )}

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({...prev, open: false}))} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: 18 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ fontSize: 15, lineHeight: 1.5 }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <MuiButton onClick={() => setConfirmDialog(prev => ({...prev, open: false}))} sx={{ color: "grey.600", fontWeight: 600, px: 2, textTransform: "none" }}>
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={() => {
              setConfirmDialog(prev => ({...prev, open: false}));
              confirmDialog.onConfirm();
            }} 
            variant="contained" 
            color={confirmDialog.confirmColor}
            disabled={updating}
            sx={{ fontWeight: 600, boxShadow: "none", px: 3, textTransform: "none", color: "white" }}
          >
            {updating ? "Processing..." : confirmDialog.confirmText}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CabBookingCard;
