// components/ui/BookingLoginCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import { Edit, Visibility, Check, Close, Delete } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import { STATUS_OPTIONS } from "@/constants/bookingLogin";

interface BookingLoginCardProps {
  booking: any;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const handleDeleteBooking = async (booking: any) => {
  // Show appropriate message based on user role and booking status
  let confirmMessage = `Are you sure you want to delete booking for ${booking.customer1Name}?`;
  
  if (!hasAccountsRole() && booking.status !== 'draft') {
    confirmMessage = `This booking has status "${booking.status}" and cannot be deleted. Only Accounts role can delete non-draft bookings.`;
    alert(confirmMessage);
    return;
  }

  if (window.confirm(confirmMessage)) {
    try {
      await deleteBooking(booking._id);
      setSnackbarMessage("Booking deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error: any) {
      setSnackbarMessage(error.message || "Failed to delete booking");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }
};

const BookingLoginCard: React.FC<BookingLoginCardProps> = ({
  booking,
  onEdit,
  onView,
  onDelete,
  onApprove,
  onReject,
}) => {
  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || "default";
  };

  return (
    <Card sx={{ width: "100%", mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {booking.projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.customer1Name}
            </Typography>
          </Box>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status) as any}
            size="small"
          />
        </Box>

        <Box mb={2}>
          <Typography variant="body2">
            <strong>Unit:</strong> {booking.unitNo} | <strong>Area:</strong> {booking.area} sq ft
          </Typography>
          <Typography variant="body2">
            <strong>Phone:</strong> {booking.phoneNo}
          </Typography>
          {booking.email && (
            <Typography variant="body2">
              <strong>Email:</strong> {booking.email}
            </Typography>
          )}
        </Box>

        {/* Approve/Reject buttons for Accounts role */}
        {onApprove && onReject && booking.status === 'submitted' && (
          <Box display="flex" gap={1} mb={2}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={onApprove}
              fullWidth
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<Close />}
              onClick={onReject}
              fullWidth
            >
              Reject
            </Button>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Created by: {booking.createdBy?.name}
          </Typography>
          
          <Box>
            <IconButton size="small" onClick={onView} color="primary">
              <Visibility />
            </IconButton>
            <PermissionGuard module="booking-login" action="write" fallback={null}>
              <IconButton 
                size="small" 
                onClick={onEdit} 
                color="secondary"
                disabled={booking.status === 'approved' || booking.status === 'rejected'}
              >
                <Edit />
              </IconButton>
            </PermissionGuard>
            <PermissionGuard module="booking-login" action="delete" fallback={null}>
  <IconButton 
    size="small" 
    onClick={onDelete} 
    color="error"
    disabled={!hasAccountsRole && booking.status !== 'draft'}
    title={
      (!hasAccountsRole && booking.status !== 'draft') 
        ? "Only draft bookings can be deleted" 
        : "Delete Booking"
    }
  >
    <Delete />
  </IconButton>
</PermissionGuard>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingLoginCard;
